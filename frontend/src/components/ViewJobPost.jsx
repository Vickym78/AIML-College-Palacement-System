import React, { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Toast from './Toast';
import Button from 'react-bootstrap/Button';
import ModalBox from './Modal';
import { BASE_URL } from '../config/backend_url';

function ViewJobPost() {
  document.title = 'APMS | View Job Post';
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [currentUser, setCurrentUser] = useState({});
  const [applied, setApplied] = useState(false);
  const [isHired, setIsHired] = useState(false);
  const [applicant, setApplicant] = useState([]);
  const [detailedApplicants, setDetailedApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalBody, setModalBody] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get(`${BASE_URL}/user/detail`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
        });
      })
      .catch(() => {
        setToastMessage("Failed to fetch user details.");
        setShowToast(true);
      });
  }, [navigate]);

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tpo/job/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(response.data);
    } catch (error) {
      if (error?.response?.data?.msg === "job data not found") {
        navigate('../404');
      } else {
        setToastMessage(error?.response?.data?.msg || error.message);
        setShowToast(true);
      }
    }
  };

  const fetchCompanyData = async () => {
    try {
      if (!data.company) return;
      const response = await axios.get(`${BASE_URL}/company/company-data?companyId=${data.company}`);
      setCompany(response.data.company);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const fetchApplied = async () => {
    if (!currentUser.id) return;
    try {
      const response = await axios.get(`${BASE_URL}/student/check-applied/${jobId}/${currentUser.id}`);
      setApplied(response.data.applied);
      setIsHired(response.data.isHired);
    } catch (error) {
      setToastMessage(error.response?.data?.msg || "Error checking application status");
      setShowToast(true);
    }
  };

  const fetchApplicant = async () => {
    const res = await axios.get(`${BASE_URL}/tpo/job/applicants/${jobId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setApplicant(res.data.applicantsList);
  };

  // Fixed function to fetch detailed student data with multiple endpoint attempts
  const fetchDetailedApplicantData = async () => {
    if (!applicant || applicant.length === 0) return;
    
    setLoadingApplicants(true);
    try {
      const detailedData = await Promise.all(
        applicant.map(async (app) => {
          // Try multiple possible endpoints
          const possibleEndpoints = [
            `${BASE_URL}/tpo/user/${app.id}`,
            `${BASE_URL}/user/details/${app.id}`,
            `${BASE_URL}/student/profile/${app.id}`,
            `${BASE_URL}/admin/user/${app.id}`,
            `${BASE_URL}/tpo/student/${app.id}`
          ];

          for (const endpoint of possibleEndpoints) {
            try {
              console.log(`Trying endpoint: ${endpoint}`); // Debug log
              const studentResponse = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              
              console.log(`Success with endpoint ${endpoint}:`, studentResponse.data); // Debug log
              
              return {
                ...app,
                fullUserData: studentResponse.data,
                fetchedFrom: endpoint // Track which endpoint worked
              };
            } catch (error) {
              console.log(`Failed endpoint ${endpoint}:`, error.response?.status, error.response?.data?.msg);
              // Continue to next endpoint
              continue;
            }
          }

          // If all endpoints fail, log the error and return basic data
          console.error(`All endpoints failed for student ${app.id}`);
          return {
            ...app,
            fullUserData: null,
            fetchedFrom: 'none'
          };
        })
      );
      
      setDetailedApplicants(detailedData);
      console.log('Detailed applicants:', detailedData); // Debug log
      
      // Show success/failure summary
      const successCount = detailedData.filter(app => app.fullUserData !== null).length;
      const totalCount = detailedData.length;
      
      if (successCount > 0) {
        setToastMessage(`Successfully fetched detailed data for ${successCount}/${totalCount} students`);
        setShowToast(true);
      }
      
    } catch (error) {
      console.error("Error fetching detailed applicant data:", error);
      setToastMessage("Error fetching detailed student data");
      setShowToast(true);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchJobDetail();
      await fetchCompanyData();
      await fetchApplied();
      await fetchApplicant();
      setLoading(false);
    };
    fetchData();
  }, [currentUser, data.company, jobId]);

  // Fetch detailed applicant data when applicant list is loaded
  useEffect(() => {
    if (applicant.length > 0 && currentUser.role !== "student") {
      fetchDetailedApplicantData();
    }
  }, [applicant, currentUser.role]);

  const closeModal = () => setShowModal(false);

  const handleApply = () => {
    setModalBody("Do you really want to apply for this job? Make sure your profile is updated to increase your placement chances.");
    setShowModal(true);
  };

  const handleConfirmApply = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/student/job/${jobId}/${currentUser.id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.msg) {
        setToastMessage(response.data.msg);
        setShowToast(true);
      }
      setShowModal(false);
      fetchApplied();
    } catch (error) {
      setShowModal(false);
      setToastMessage(error.response?.data?.msg || "Failed to apply to job");
      setShowToast(true);
    }
  };

const handleDownloadCSV = () => {
  const dataToDownload = detailedApplicants.length > 0 ? detailedApplicants : applicant;

  if (!dataToDownload || dataToDownload.length === 0) {
    setToastMessage("No applicant data available to download");
    setShowToast(true);
    return;
  }

  // Helper function to clean CSV fields
  const sanitize = (text) => {
    if (text === null || text === undefined) return '-';
    const str = String(text);
    return (str.includes(',') || str.includes('"') || str.includes('\n'))
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const headers = [
    'Name',
    'Email',
    'Current Round',
    'Status',
    'Applied Date'
  ];

  const rows = dataToDownload.map(app => {
    const userData = app.fullUserData || {};
    const name = userData.name || app.name || '-';
    const email = userData.email || app.email || '-';
    const currentRound = app.currentRound ? app.currentRound[0].toUpperCase() + app.currentRound.slice(1) : '-';
    const status = app.status ? app.status[0].toUpperCase() + app.status.slice(1) : '-';
    const appliedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleString('en-IN') : '-';

    return [
      sanitize(name),
      sanitize(email),
      sanitize(currentRound),
      sanitize(status),
      sanitize(appliedDate)
    ];
  });

  // Generate CSV content
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

  // Trigger file download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `applicants_${data.jobTitle?.replace(/\s+/g, '_') || 'job'}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  const fullDataCount = dataToDownload.filter(app => app.fullUserData).length;
  setToastMessage(`Downloaded ${dataToDownload.length} applicants (${fullDataCount} with full profiles)`);
  setShowToast(true);
};


  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      {loading ? (
        <div className="flex justify-center h-72 items-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 my-6 text-base max-sm:text-sm max-sm:grid-cols-1">
          <div className="flex flex-col grid-flow-row-dense gap-2">
            <Accordion defaultActiveKey={['0']} alwaysOpen className='shadow rounded'>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Company Details</Accordion.Header>
                <Accordion.Body>
                  <h3 className='text-3xl text-center border-b-2 py-4 mb-4'>{company?.companyName}</h3>
                  <div className="border-b-2 px-2 pb-4 text-gray-500 text-justify leading-5">
                    {company?.companyDescription}
                  </div>
                  <div className="flex justify-between p-2 border-b-2 my-2">
                    <span>Website</span>
                    <span className='bg-blue-500 py-1 px-2 text-white rounded cursor-pointer'>
                      <a href={company?.companyWebsite} target='_blank' rel="noreferrer" className='no-underline text-white'>
                        {company?.companyWebsite}
                      </a>
                    </span>
                  </div>
                  <div className="flex justify-between p-2 border-b-2 my-2">
                    <span>Job Locations</span>
                    <div className="flex gap-2">
                      {company?.companyLocation?.split(',').map((location, i) => (
                        <span key={i} className='bg-blue-500 py-1 px-2 text-white rounded'>{location.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between p-2 border-b-2 my-2">
                    <span>Company Type</span>
                    {company?.companyType === "Dream" && <span className='bg-green-500 py-1 px-2 text-white rounded'>{company.companyType}</span>}
                    {company?.companyType === "Non-Dream" && <span className='bg-orange-500 py-1 px-2 text-white rounded'>{company.companyType}</span>}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {currentUser.role !== "student" && (
              <Accordion defaultActiveKey={['3']} alwaysOpen className='shadow rounded mt-4'>
                <Accordion.Item eventKey="3">
                  <Accordion.Header>
                    Applicants Applied 
                    {loadingApplicants && <i className="fa-solid fa-spinner fa-spin ml-2" />}
                  </Accordion.Header>
                  <Accordion.Body>
                    {applicant.length > 0 && (
                      <div className="flex justify-end mb-3">
                        <Button 
                          variant="outline-success" 
                          onClick={handleDownloadCSV}
                          disabled={loadingApplicants}
                        >
                          <i className="fa-solid fa-download pr-2" />
                          Download Detailed Report
                          {loadingApplicants && <i className="fa-solid fa-spinner fa-spin ml-2" />}
                        </Button>
                      </div>
                    )}
                    <Table striped bordered hover size='sm' className='text-center'>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Current Round</th>
                          <th>Status</th>
                          <th>Applied On</th>
                          
                        </tr>
                      </thead>
                      <tbody>
                        {applicant.length > 0 ? (
                          applicant.map((app, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                {(currentUser.role === 'tpo_admin' || currentUser.role === 'management_admin' || currentUser.role === 'superuser') ? (
                                  <Link to={`/${currentUser.role.split('_')[0]}/user/${app.id}`} target='_blank' className='text-blue-500 no-underline hover:text-blue-700'>
                                    {app.name}
                                  </Link>
                                ) : app.name}
                              </td>
                              <td>{app.email}</td>
                              <td>{(app.currentRound?.charAt(0).toUpperCase() + app.currentRound?.slice(1)) || '-'}</td>
                              <td>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</td>
                              <td>{new Date(app.appliedAt).toLocaleString('en-IN')}</td>
                             
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={7}>No Student Yet Applied!</td></tr>
                        )}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
          </div>

          {/* Right Side Job Detail Section */}
          <div>
            <Accordion defaultActiveKey={['1']} alwaysOpen className='shadow rounded'>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Job Details</Accordion.Header>
                <Accordion.Body>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                      <span className='text-xl text-blue-500 py-2 border-b-2'>Job Title</span>
                      <span className='py-3'>{data.jobTitle}</span>
                    </div>
                    <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                      <span className='text-xl text-blue-500 py-2 border-b-2'>Job Profile</span>
                      <span className='py-3' dangerouslySetInnerHTML={{ __html: data.jobDescription }} />
                    </div>
                    <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                      <span className='text-xl text-blue-500 py-2 border-b-2'>Eligibility</span>
                      <span className='py-3' dangerouslySetInnerHTML={{ __html: data.eligibility }} />
                    </div>
                    <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                      <span className='text-xl text-blue-500 py-2 border-b-2'>Annual CTC</span>
                      <span className='py-3'>{data.salary} LPA</span>
                    </div>
                    <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                      <span className='text-xl text-blue-500 py-2 border-b-2'>Last Date of Application</span>
                      <span className='py-3'>
                        {new Date(data.applicationDeadline).toLocaleDateString('en-IN', {
                          month: 'long', year: 'numeric', day: 'numeric'
                        })}
                      </span>
                    </div>
                    {(applied === true || currentUser.role !== 'student') && (
                      <div className="flex flex-col backdrop-blur-md bg-white/30 border border-white/20 rounded-lg px-2 shadow-sm shadow-red-400">
                        <span className='text-xl text-blue-500 py-2 border-b-2'>How to Apply?</span>
                        <span className='py-3' dangerouslySetInnerHTML={{ __html: data.howToApply }} />
                      </div>
                    )}
                    {currentUser.role === 'student' && (
                      <div className="flex justify-center mt-4">
                        {!applied ? (
                          <Button variant="warning" onClick={handleApply}>
                            <i className="fa-solid fa-check px-2" />
                            Apply Now
                          </Button>
                        ) : (
                          !isHired ? (
                            <Link to={`/student/status/${jobId}`}>
                              <Button variant="warning">
                                <i className="fa-solid fa-check px-2" />
                                Update Status
                              </Button>
                            </Link>
                          ) : (
                            <Button variant="success" disabled>
                              <i className="fa-solid fa-check-circle px-2" />
                              Hired (Status Locked)
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      )}

      <ModalBox
        show={showModal}
        close={closeModal}
        header="Confirmation"
        body={modalBody}
        btn="Apply"
        confirmAction={handleConfirmApply}
      />
    </>
  );
}

export default ViewJobPost;