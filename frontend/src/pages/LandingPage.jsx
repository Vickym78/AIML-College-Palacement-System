import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingPages/LandNavbar';
import LandingHeroPage from '../components/LandingPages/LandHeroPage';
import LandingAbout from '../components/LandingPages/LandAbout';
import LandFooter from '../components/LandingPages/LandFooter';
import Toast from '../components/Toast';

function LandingPage() {
  document.title = 'Campus Placement Management System';
  const location = useLocation();
  const navigate = useNavigate();

  // Toast state management
  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: '',
    type: 'info' // can be 'info', 'success', 'warning', 'error'
  });

  // Handle toast from navigation state
  useEffect(() => {
    if (location.state?.toast) {
      setToastConfig({
        show: true,
        message: location.state.toast.message,
        type: location.state.toast.type || 'info'
      });
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const closeToast = () => {
    setToastConfig(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="flex-grow">
        <LandingHeroPage />
        <LandingAbout />
      </main>

      {/* Footer */}
      <LandFooter />

      {/* Toast Notification */}
      <Toast
        show={toastConfig.show}
        onClose={closeToast}
        message={toastConfig.message}
        type={toastConfig.type}
        delay={3000}
        position="bottom-end"
      />
    </div>
  );
}

export default LandingPage;