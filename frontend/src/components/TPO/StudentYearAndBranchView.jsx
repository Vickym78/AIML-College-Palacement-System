import React, { useEffect, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import axios from 'axios';
import StudentTable from './StudentTableTemplate';
import { BASE_URL } from '../../config/backend_url';
import AccordionPlaceholder from '../AccordionPlaceholder';

function StudentYearAndBranchView() {
  document.title = 'CPMS | All Students';

  const [loading, setLoading] = useState(true);

  const [firstYearAIML, setFirstYearAIML] = useState([]);
  const [firstYearCSDS, setFirstYearCSDS] = useState([]);

  const [secondYearAIML, setSecondYearAIML] = useState([]);
  const [secondYearCSDS, setSecondYearCSDS] = useState([]);

  const [thirdYearAIML, setThirdYearAIML] = useState([]);
  const [thirdYearCSDS, setThirdYearCSDS] = useState([]);

  const [fourthYearAIML, setFourthYearAIML] = useState([]);
  const [fourthYearCSDS, setFourthYearCSDS] = useState([]);

  const fetchStudentsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/student/all-students-data-year-and-branch`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setFirstYearAIML(response.data.firstYearAIML);
      setFirstYearCSDS(response.data.firstYearCSDS);

      setSecondYearAIML(response.data.secondYearAIML);
      setSecondYearCSDS(response.data.secondYearCSDS);

      setThirdYearAIML(response.data.thirdYearAIML);
      setThirdYearCSDS(response.data.thirdYearCSDS);

      setFourthYearAIML(response.data.fourthYearAIML);
      setFourthYearCSDS(response.data.fourthYearCSDS);

    } catch (error) {
      console.log("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudentsData();
  }, []);

  return (
    <>
      {loading ? (
        <AccordionPlaceholder />
      ) : (
        <div className="my-4 p-6">
          <Accordion defaultActiveKey={['1']} flush className='flex flex-col gap-4'>

            {/* Fourth Year */}
            <Accordion.Item eventKey="1" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
              <Accordion.Header>Fourth Year</Accordion.Header>
              <Accordion.Body>
                <Accordion flush className='flex flex-col gap-2'>
                  <StudentTable branchName={"AIML"} studentData={fourthYearAIML} />
                  <StudentTable branchName={"CSDS"} studentData={fourthYearCSDS} />
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>

            {/* Third Year */}
            <Accordion.Item eventKey="2" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
              <Accordion.Header>Third Year</Accordion.Header>
              <Accordion.Body>
                <Accordion flush className='flex flex-col gap-2'>
                  <StudentTable branchName={"AIML"} studentData={thirdYearAIML} />
                  <StudentTable branchName={"CSDS"} studentData={thirdYearCSDS} />
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>

            {/* Second Year */}
            <Accordion.Item eventKey="3" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
              <Accordion.Header>Second Year</Accordion.Header>
              <Accordion.Body>
                <Accordion flush className='flex flex-col gap-2'>
                  <StudentTable branchName={"AIML"} studentData={secondYearAIML} />
                  <StudentTable branchName={"CSDS"} studentData={secondYearCSDS} />
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>

            {/* First Year */}
            <Accordion.Item eventKey="4" className='backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400'>
              <Accordion.Header>First Year</Accordion.Header>
              <Accordion.Body>
                <Accordion flush className='flex flex-col gap-2'>
                  <StudentTable branchName={"AIML"} studentData={firstYearAIML} />
                  <StudentTable branchName={"CSDS"} studentData={firstYearCSDS} />
                </Accordion>
              </Accordion.Body>
            </Accordion.Item>

          </Accordion>
        </div>
      )}
    </>
  );
}

export default StudentYearAndBranchView;
