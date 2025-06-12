import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandFooter() {
  const navigate = useNavigate();

  const loginLinks = [
    { label: 'Coordinator Login', path: '/tpo/login', color: 'from-blue-600 to-blue-500' },
    { label: 'TPO Login', path: '/management/login', color: 'from-purple-600 to-purple-500' },
    { label: 'CPC Portal', path: '/admin', color: 'from-rose-600 to-rose-500' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Login Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {loginLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => navigate(link.path)}
              className={`
                relative overflow-hidden px-6 py-3 rounded-lg text-white font-medium
                bg-gradient-to-r ${link.color} shadow-md hover:shadow-lg
                transform hover:-translate-y-1 transition-all duration-300
                group
              `}
            >
              <span className="relative z-10">{link.label}</span>
              <span className={`
                absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100
                transition-opacity duration-300
              `}></span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200/80 my-6"></div>

        {/* Footer Text */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              AIML Placement Management System
            </span>. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Developed with ❤️ by <span className="font-medium">Team Vitalis</span>
          </p>
        </div>

        {/* Back to Top Button */}
        <div className="mt-6 flex justify-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Back to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default LandFooter;