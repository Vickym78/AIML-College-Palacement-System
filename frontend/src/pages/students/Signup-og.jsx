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
      navigate("../student/dashboard");
    }
  }, [navigate]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: prefillEmail,
    department: '',
    password: '',
  });

  const { name, email, department, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'name') setError({ ...error, name: '' });
    if (e.target.name === 'email') setError({ ...error, email: '' });
    if (e.target.name === 'department') setError({ ...error, department: '' });
    if (e.target.name === 'password') {
      setError({ ...error, password: '' });
      if (!validatePassword(e.target.value)) {
        setError({
          ...error,
          password:
            'Password must contain at least 8 characters, 1 special character, 1 number, 1 uppercase, and 1 lowercase letter',
        });
      }
    }
  };

// Move allowedDomains outside component to avoid recreation
const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 
  'hotmail.com', 'icloud.com', 'aol.com',
  'protonmail.com', 'zoho.com', 'mail.com',
  'gmx.com', 'live.com', 'yandex.com'
];

// Update validation function
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return false;
  
  const domain = email.split('@')[1].toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
}

  function validatePassword(password) {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !department || !password) {
      setError({
        name: !name ? 'Name is required!' : '',
        email: !email ? 'Email is required!' : '',
        department: !department ? 'Department is required!' : '',
        password: !password
          ? 'Password is required!'
          : !validatePassword(password)
          ? 'Password must contain at least 8 characters, 1 special character, 1 number, 1 uppercase, and 1 lowercase letter'
          : '',
      });
      return;
    }

    if (!validatePassword(password)) {
      return setError({
        ...error,
        password:
          'Password must contain at least 8 characters, 1 special character, 1 number, 1 uppercase, and 1 lowercase letter',
      });
    }

    try {
      const response = await axios.post(`${BASE_URL}/student/signup`, formData);
      setToastMessage("User created successfully! Now you can log in.");
      setShowToast(true);

      const dataToPass = {
        showToastPass: true,
        toastMessagePass: "User created successfully! Now you can log in.",
      };
      navigate('../student/login', { state: dataToPass });
    } catch (error) {
      if (error.response?.data?.msg) {
        setToastMessage(error.response.data.msg);
        setShowToast(true);
      }
      console.log("Student Signup.jsx => ", error);
    }
  };

  const [isEyeOpen, setEyeOpen] = useState(false);
  const handleEye = () => setEyeOpen(!isEyeOpen);

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      <div className="flex justify-center items-center py-2 min-h-screen bg-gradient-to-r from-red-400 from-10% via-pink-300 via-40% to-purple-300 to-100%">
        <form
          className="form-signin flex justify-center items-center flex-col gap-3 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg shadow shadow-red-400 p-8 w-1/3 max-lg:w-2/3 max-md:w-3/4 max-[400px]:w-4/5"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-center items-center flex-col">
            <img
              className="mb-4 rounded-xl shadow w-30 h-28 lg:w-40 lg:h-40"
              src={Logo}
              alt="Logo"
            />
            <h1 className="h3 mb-3 font-weight-normal">Sign Up as a Student</h1>
          </div>

          {/* Name */}
          <div className="w-full">
            <label htmlFor="inputName" className="sr-only">Name</label>
            <input
              type="text"
              id="inputName"
              className="form-control ml-1"
              placeholder="Full Name"
              name="name"
              value={name}
              onChange={handleChange}
            />
            <div className="text-red-500 ml-2">
              <span>{error?.name}</span>
            </div>
          </div>

          {/* Email */}
          <div className="w-full">
            <label htmlFor="inputEmail" className="sr-only">Email Address</label>
            <input
              type="email"
              id="inputEmail"
              className="form-control ml-1"
              placeholder="Email Address"
              name="email"
              value={email}
              onChange={handleChange}
            />
            <div className="text-red-500 ml-2">
              <span>{error?.email}</span>
            </div>
          </div>

          {/* Department */}
          <div className="w-full">
            <label htmlFor="inputDepartment" className="sr-only">Department</label>
            <input
              type="text"
              id="inputDepartment"
              className="form-control ml-1"
              placeholder="Department"
              name="department"
              value={department}
              onChange={handleChange}
            />
            <div className="text-red-500 ml-2">
              <span>{error?.department}</span>
            </div>
          </div>

          {/* Password */}
          <div className="w-full">
            <div className="flex justify-center items-center w-full">
              <label htmlFor="inputPassword" className="sr-only">Password</label>
              <input
                type={isEyeOpen ? "text" : "password"}
                id="inputPassword"
                className="form-control"
                placeholder="Password"
                name="password"
                value={password}
                onChange={handleChange}
              />
              <i
                className={`${isEyeOpen ? "fa-solid fa-eye" : "fa-regular fa-eye-slash"} -ml-6 cursor-pointer`}
                onClick={handleEye}
              ></i>
            </div>
            <div className="text-red-500 ml-2">
              <span>{error?.password}</span>
            </div>
          </div>

          <div className="flex justify-center items-center flex-col">
            <button className="btn btn-primary btn-block" type="submit">
              Sign Up
            </button>
          </div>
          <span className="text-center">
            Already have an account?
            <span
              className="text-blue-500 font-bold cursor-pointer px-1"
              onClick={() => navigate('../student/login')}
            >
              Login
            </span>
          </span>
          <p className="text-muted text-center text-gray-400">
            © College Placement Management System 2024 - 25
          </p>
        </form>
      </div>
    </>
  );
}

export default Signup;
