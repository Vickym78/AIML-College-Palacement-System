import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from "../../assets/CPMS.png";
import Toast from '../../components/Toast';
import isAuthenticated from '../../utility/auth.utility';
import { BASE_URL } from '../../config/backend_url';

function Signup() {
  document.title = 'APMS | Student Sign Up';
  const navigate = useNavigate();
  const location = useLocation();

  const prefillEmail = location?.state?.prefillEmail || '';

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isEyeOpen, setIsEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: prefillEmail,
    department: '',
    password: '',
    number: '',
  });

  const allowedDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com',
    'mail.com', 'gmx.com', 'live.com', 'yandex.com',
    'msn.com', 'pm.me', 'fastmail.com', 'hey.com'
  ];

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.includes(domain);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.number) newErrors.number = 'Mobile number is required';

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address with a public domain';
    }

    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = 'Password must contain 8+ chars with 1 uppercase, 1 lowercase, 1 number & 1 special character';
    }

    if (formData.number && !/^\d{10}$/.test(formData.number)) {
      newErrors.number = 'Mobile number must be 10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/student/signup`, formData);
      setToastMessage("Account created successfully! Please login.");
      setShowToast(true);
      navigate('/student/login', {
        state: {
          toast: {
            message: "Account created successfully! Please login.",
            type: "success"
          }
        }
      });
    } catch (error) {
      const serverMsg = error.response?.data?.msg || 'Registration failed. Please try again.';
      console.error("Signup error:", serverMsg);

      if (serverMsg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: serverMsg }));
      } else if (serverMsg.toLowerCase().includes('number') || serverMsg.toLowerCase().includes('mobile')) {
        setErrors(prev => ({ ...prev, number: serverMsg }));
      } else {
        setToastMessage(serverMsg);
        setShowToast(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="top-center"
      />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
            <div className="flex justify-center">
              <img
                src={Logo}
                alt="APMS Logo"
                className="h-20 w-20 rounded-full border-4 border-white shadow-md"
              />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Student Registration</h1>
            <p className="mt-1 text-blue-100">Join the CPMS Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Number */}
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                maxLength="10"
                className={`w-full px-4 py-3 rounded-lg border ${errors.number ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition`}
                placeholder="10-digit mobile number"
              />
              {errors.number && <p className="text-sm text-red-600 mt-1">{errors.number}</p>}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.department ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition`}
              >
                <option value="">Select Department</option>
                <option value="AIML">AIML</option>
                <option value="CSDS">CSDS</option>
              </select>
              {errors.department && <p className="text-sm text-red-600 mt-1">{errors.department}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={isEyeOpen ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 transition pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsEyeOpen(!isEyeOpen)}
                >
                  <i className={`fas ${isEyeOpen ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/student/login')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>

          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} College Placement Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
