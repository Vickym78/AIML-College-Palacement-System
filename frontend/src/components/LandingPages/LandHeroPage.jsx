import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroImg from '../../assets/heroImg.jpg';
function LandingHeroPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleCreateAccount = () => {
    navigate('/student/signup', {
      state: { prefillEmail: email.trim() }
    });
  };

  const handleScrollAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center justify-center bg-gray-900"
      style={{ backgroundImage: `url(${HeroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 max-w-6xl px-6 text-center">
        <div>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            Your <span className="text-blue-400">College Placement</span> Solution
          </h1>

          <p className="mt-4 text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
            Streamline your placement journey with our comprehensive management platform
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
            />
            <button
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
              onClick={handleCreateAccount}
            >
              Get Started
            </button>
          </div>

          <div className="mt-8">
            <button 
              onClick={handleScrollAbout}
              className="text-gray-300 hover:text-white text-sm underline"
            >
              Learn more about our platform
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingHeroPage;