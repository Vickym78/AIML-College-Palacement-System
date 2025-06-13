import React, { useEffect, useState } from 'react';
import Logo from '../../assets/CPMS.png';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function LandingNavbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' 
          : 'bg-white/80 backdrop-blur-sm py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <img
              src={Logo}
              alt="CPMS Logo"
              className={`rounded-xl border-2 border-white shadow-lg transition-all duration-300 ${
                isScrolled ? 'w-12 h-12' : 'w-14 h-14'
              } group-hover:rotate-6 group-hover:shadow-md`}
            />
            <h1 className={`font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent ${
              isScrolled ? 'text-xl' : 'text-2xl'
            } ${isMobile ? 'hidden sm:block' : ''}`}>
              {isMobile ? 'CPMS' : 'Campus Placement Management System'}
            </h1>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline-primary"
              size={isMobile ? 'sm' : 'md'}
              className={`rounded-full border-2 font-medium transition-all duration-300 ${
                isScrolled ? 'px-3 py-1' : 'px-4 py-1.5'
              } hover:bg-indigo-50 hover:shadow-md hover:-translate-y-0.5`}
              onClick={() => navigate('/student/login')}
            >
              {isMobile ? 'Login' : 'Student Login'}
            </Button>

            <Button
              variant="primary"
              size={isMobile ? 'sm' : 'md'}
              className={`rounded-full border-2 font-medium transition-all duration-300 ${
                isScrolled ? 'px-3 py-1' : 'px-4 py-1.5'
              } bg-gradient-to-r from-indigo-600 to-emerald-500 border-transparent hover:shadow-md hover:-translate-y-0.5 hover:opacity-90`}
              onClick={() => navigate('/student/signup')}
            >
              {isMobile ? 'Sign Up' : 'Register Now'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;