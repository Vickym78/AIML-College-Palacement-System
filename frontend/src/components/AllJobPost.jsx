import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Placeholder from 'react-bootstrap/Placeholder';
import { useLocation, useNavigate } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Toast from './Toast';
import TablePlaceholder from './TablePlaceholder';
import { BASE_URL } from '../config/backend_url';

function AllJobPost() {
  document.title = 'APMS | Job Listings';
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Delete Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Checking for authentication and fetching user details
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setToastMessage('No authentication token found');
      setShowToast(true);
      return;
    }

    axios.get(`${BASE_URL}/user/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          email: res.data.email,
          role: res.data.role,
        });
        fetchJobs();
      })
      .catch(err => {
        console.log("Error in fetching user details => ", err);
        setToastMessage(err.response?.data?.msg || err.message || 'Error loading user data');
        setShowToast(true);
        setLoading(false);
      });
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tpo/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setJobs(response.data.data);
      fetchCompanies(response.data.data);
    } catch (error) {
      console.log("Error fetching jobs ", error);
      setToastMessage(error.response?.data?.msg || 'Error fetching jobs');
      setShowToast(true);
      setLoading(false);
    }
  };

  const fetchCompanies = async (jobs) => {
    const companyNames = {};
    const token = localStorage.getItem('token');
    
    for (const job of jobs) {
      if (job.company && !companyNames[job.company]) {
        try {
          const response = await axios.get(`${BASE_URL}/company/company-data?companyId=${job.company}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          companyNames[job.company] = response.data.company.companyName;
        } catch (error) {
          console.log("Error fetching company name => ", error);
          companyNames[job.company] = 'Unknown Company';
        }
      }
    }
    setCompanies(companyNames);
    setLoading(false);
  };

  const handleDeleteClick = (job) => {
    console.log('Job to delete:', job);
    console.log('Job ID:', job._id);
    
    setJobToDelete({
      id: job._id,
      title: job.jobTitle,
      company: companies[job.company] || 'Unknown Company',
      applicants: job.applicants?.length || 0
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setToastMessage('Authentication token not found. Please login again.');
        setShowToast(true);
        setIsDeleting(false);
        return;
      }

      console.log('Deleting job with ID:', jobToDelete.id);
      console.log('Making request to:', `${BASE_URL}/tpo/delete-job`);
      
      // Use the POST method with the correct endpoint
      const response = await axios.post(`${BASE_URL}/tpo/delete-job`, 
        { jobId: jobToDelete.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Delete response:', response.data);

      setShowDeleteModal(false);
      setJobToDelete(null);
      
      // Show success message
      if (response?.data?.msg) {
        setToastMessage(response.data.msg);
      } else {
        setToastMessage('Job deleted successfully!');
      }
      setShowToast(true);
      
      // Refresh the job list
      await fetchJobs();
      
    } catch (error) {
      console.log("Full error object:", error);
      console.log("Error response:", error.response);
      
      let errorMessage = 'Error deleting job';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.msg || error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - please check your connection';
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const { showToastPass, toastMessagePass } = location.state || { showToastPass: false, toastMessagePass: '' };

  useEffect(() => {
    if (showToastPass) {
      setToastMessage(toastMessagePass);
      setShowToast(showToastPass);
      navigate('.', { replace: true, state: {} });
    }
  }, [showToastPass, toastMessagePass, navigate]);

  return (
    <>
      {/* Toast Component */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className=''>
        {
          loading || !currentUser ? (
            <TablePlaceholder />
          ) : (
            <div className="overflow-x-auto max-sm:text-sm max-sm:p-1">
              <div className="table-scrollbar">
                <Table striped bordered hover className='bg-white my-6 rounded-lg shadow w-full'>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th><b>Company Name</b></th>
                      <th>Job Title</th>
                      <th>Annual CTC</th>
                      <th>Last date of Application</th>
                      <th>No. of Students Applied</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs?.length > 0 ? (
                      jobs?.map((job, index) => {
                        const isMatched = job?.applicants?.find(student => student.studentId == currentUser.id);
                        return (
                          <tr
                            key={job?._id}
                            className={`${isMatched ? 'table-success' : ''}`}
                          >
                            <td>{index + 1}</td>
                            <td>
                              <b>
                                {companies[job?.company] || <Placeholder as="p" animation="glow">
                                  <Placeholder xs={12} />
                                </Placeholder>}
                              </b>
                            </td>
                            <td>{job?.jobTitle}</td>
                            <td>{job?.salary}</td>
                            <td>{new Date(job?.applicationDeadline).toLocaleDateString('en-In')}</td>
                            <td>{job?.applicants?.length || 0}</td>
                            <td>
                              <div className="flex justify-around items-center">
                                <div className="px-0.5">
                                  {/* View Post */}
                                  <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={<Tooltip>View Post</Tooltip>}
                                  >
                                    <i
                                      className="fa-solid fa-circle-info text-2xl max-sm:text-lg cursor-pointer transition-colors duration-200 ease-in-out hover:text-blue-500"
                                      onClick={() => {
                                        const rolePaths = {
                                          'tpo_admin': `../tpo/job/${job._id}`,
                                          'management_admin': `../management/job/${job._id}`,
                                          'superuser': `../admin/job/${job._id}`,
                                          'student': `../student/job/${job._id}`,
                                        };
                                        navigate(rolePaths[currentUser.role]);
                                      }}
                                    />
                                  </OverlayTrigger>
                                </div>
                                {
                                  currentUser.role !== 'student' && (
                                    <>
                                      {/* Edit Post */}
                                      <div className="px-0.5">
                                        <OverlayTrigger
                                          placement="top"
                                          delay={{ show: 250, hide: 400 }}
                                          overlay={<Tooltip>Edit Post</Tooltip>}
                                        >
                                          <i
                                            className="fa-regular fa-pen-to-square text-2xl max-sm:text-lg cursor-pointer transition-colors duration-200 ease-in-out hover:text-green-500 hover:fa-solid"
                                            onClick={() => {
                                              const rolePaths = {
                                                'tpo_admin': `../tpo/post-job/${job._id}`,
                                                'management_admin': `../management/post-job/${job._id}`,
                                                'superuser': `../admin/post-job/${job._id}`,
                                              };
                                              navigate(rolePaths[currentUser.role]);
                                            }}
                                          />
                                        </OverlayTrigger>
                                      </div>

                                      {/* Delete Post */}
                                      <div className="px-0.5">
                                        <OverlayTrigger
                                          placement="top"
                                          delay={{ show: 250, hide: 400 }}
                                          overlay={<Tooltip>Delete Post</Tooltip>}
                                        >
                                          <i
                                            className="fa-regular fa-trash-can text-2xl max-sm:text-lg cursor-pointer transition-colors duration-200 ease-in-out hover:text-red-500 hover:fa-solid"
                                            onClick={() => handleDeleteClick(job)}
                                          />
                                        </OverlayTrigger>
                                      </div>
                                    </>
                                  )
                                }
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No Job Posts Found!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )
        }
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="py-4">
          <div className="text-center">
            <div className="mb-3">
              <i className="fa-solid fa-trash-can text-danger" style={{ fontSize: '3rem' }}></i>
            </div>
            
            <h5 className="mb-3">Are you sure you want to delete this job?</h5>
            
            {jobToDelete && (
              <div className="bg-light p-3 rounded">
                <div className="row">
                  <div className="col-sm-4 font-weight-bold">Company:</div>
                  <div className="col-sm-8">{jobToDelete.company}</div>
                </div>
                <div className="row">
                  <div className="col-sm-4 font-weight-bold">Job Title:</div>
                  <div className="col-sm-8">{jobToDelete.title}</div>
                </div>
                <div className="row">
                  <div className="col-sm-4 font-weight-bold">Applicants:</div>
                  <div className="col-sm-8">{jobToDelete.applicants} students</div>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-muted">
              <small>
                <i className="fa-solid fa-info-circle me-1"></i>
                This action cannot be undone. All application data will be permanently deleted.
              </small>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer className="border-0 justify-content-center">
          <Button 
            variant="secondary" 
            onClick={closeDeleteModal}
            disabled={isDeleting}
            className="px-4"
          >
            <i className="fa-solid fa-times me-1"></i>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4"
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Deleting...
              </>
            ) : (
              <>
                <i className="fa-solid fa-trash me-1"></i>
                Delete Job
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AllJobPost;