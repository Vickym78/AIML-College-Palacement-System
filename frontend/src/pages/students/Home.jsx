import React from 'react';
import NoticeBox from '../../components/NoticeBox';
import NotificationBox from '../../components/Students/NotificationBox';

// student 
function Home() {
  // Set the page title
  document.title = 'AIML Placement Management System | Student Dashboard';

  return (
    <>
      <div className={`grid grid-cols-1 gap-1 max-sm:grid-cols-1`}>
        {/* <NotificationBox /> */}
        <NoticeBox />
      </div>
    </>
  );
}

export default Home
