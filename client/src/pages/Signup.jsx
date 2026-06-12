import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

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
    <div className="min-h-screen flex text-gray-900 bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200">
      {/* Left side illustration/benefits */}
      <div className="hidden lg:flex w-1/2 p-12 flex-col justify-center relative overflow-hidden glass m-4 rounded-3xl">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-[#001011] mb-6">Join the Vocational Educator Network</h1>
          <ul className="text-xl text-[#001011] space-y-4">
            <li className="flex items-center">✓ Share teaching resources</li>
            <li className="flex items-center">✓ Collaborate professionally</li>
            <li className="flex items-center">✓ Network with educators</li>
            <li className="flex items-center">✓ Conduct meetings</li>
          </ul>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#98CE00] opacity-30 rounded-full blur-3xl"></div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
          
          {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input type="text" name="fullName" placeholder="Full Name" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            <div>
              <input type="text" name="username" placeholder="Username" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
              {usernameStatus && <p className={`text-xs mt-1 font-medium ${usernameStatus.includes('taken') ? 'text-red-500' : 'text-green-500'}`}>{usernameStatus}</p>}
            </div>
            <div>
              <input type="email" name="email" placeholder="Email" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            <div>
              <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            <div>
              <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none" />
            </div>
            
            <button type="submit" className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 font-semibold rounded-lg shadow-md transition">Sign Up</button>
          </form>

          <div className="mt-4 flex items-center justify-center space-x-2">
            <span className="h-px w-full bg-gray-300"></span>
            <span className="text-gray-500 text-sm">or</span>
            <span className="h-px w-full bg-gray-300"></span>
          </div>

          <button className="mt-4 w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <FcGoogle className="text-xl" />
            <span>Sign up with Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-[#8B5CF6] hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
