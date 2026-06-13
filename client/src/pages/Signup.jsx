import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import logo from '../assets/logo.png';

const vocationalImages = [
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=300&h=200", // Carpentry
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300&h=200", // Electrical
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300&h=200", // Mechanics
];

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length > 3) {
        try {
          const res = await api.get(`/api/users/check-username/${formData.username}`);
          if (res.data.available) {
            setUsernameStatus('Username Available ✓');
          } else {
            setUsernameStatus('Username already taken ✗');
          }
        } catch (err) {
          console.error('Error checking username', err);
        }
      } else {
        setUsernameStatus('');
      }
    };

    const delayDebounceFn = setTimeout(() => {
      checkUsername();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus.includes('taken')) {
      return setError('Please choose an available username');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      const res = await api.post('/api/auth/register', formData);
      login(res.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="h-screen overflow-hidden flex text-gray-900 bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200">
      {/* Left side illustration/benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white flex-col justify-between p-6 lg:p-10 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center justify-start flex-1 pt-0 mt-4 lg:mt-6">
          {/* Logo container */}
          <div className="p-6 lg:p-8 bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-md border border-white/60 mb-6 transform hover:-translate-y-2 transition duration-500">
            <img src={logo} alt="VOCAL Logo" className="w-full max-h-24 lg:max-h-32 object-contain drop-shadow-lg" />
          </div>
          
          {/* Tagline */}
          <div className="w-full text-center space-y-3">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              Inspire & Connect
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl font-medium max-w-md mx-auto leading-relaxed">
              The ultimate platform for educators to share knowledge, collaborate on resources, and grow together.
            </p>
          </div>
        </div>

        {/* Scrolling Images Section */}
        <div className="relative z-10 w-full mt-auto pt-4 -mx-6 lg:-mx-10 px-6 lg:px-10 overflow-hidden pb-4">
          <div className="animate-scroll flex items-center">
            {[...vocationalImages, ...vocationalImages].map((src, i) => (
              <div key={i} className="px-3 flex-shrink-0">
                <img src={src} alt="Vocational Subject" className="w-56 h-40 lg:w-64 lg:h-48 object-cover rounded-2xl shadow-lg border border-white/50" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6">
        <div className="max-w-md w-full glass p-6 rounded-2xl shadow-xl">
          <div className="text-center mb-4 flex flex-col items-center">
            <img src={logo} alt="VOCAL Logo" className="h-12 w-auto mb-2 object-contain" />
            <h2 className="text-2xl font-bold">Create Account</h2>
          </div>
          
          {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input type="text" name="fullName" placeholder="Full Name" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            <div>
              <input type="text" name="username" placeholder="Username" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
              {usernameStatus && <p className={`text-xs mt-1 font-medium ${usernameStatus.includes('taken') ? 'text-red-500' : 'text-green-500'}`}>{usernameStatus}</p>}
            </div>
            <div>
              <input type="email" name="email" placeholder="Email" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            <div>
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            <div>
              <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            
            <button type="submit" className="w-full py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 font-semibold rounded-lg shadow-md transition">Sign Up</button>
          </form>

          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="h-px w-full bg-gray-300"></span>
            <span className="text-gray-500 text-sm">or</span>
            <span className="h-px w-full bg-gray-300"></span>
          </div>

          <button className="mt-4 w-full flex items-center justify-center space-x-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            <FcGoogle className="text-lg" />
            <span>Sign up with Google</span>
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-[#8B5CF6] hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
