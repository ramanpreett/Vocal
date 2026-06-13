import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import logo from '../assets/logo.png'; // Assuming the image is saved as logo.png in assets

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200">
      {/* Left side - Branding & Image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-white items-center justify-center p-12">
        
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center">
          {/* Logo container */}
          <div className="p-10 bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 mb-10 transform hover:-translate-y-2 transition duration-500">
            <img src={logo} alt="VOCAL Logo" className="w-full h-auto object-contain drop-shadow-lg" />
          </div>
          
          {/* Tagline */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              Inspire & Connect
            </h2>
            <p className="text-gray-600 text-lg lg:text-xl font-medium max-w-md mx-auto leading-relaxed">
              The ultimate platform for educators to share knowledge, collaborate on resources, and grow together.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl border border-white/50 bg-white/60 backdrop-blur-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logo} alt="VOCAL Logo" className="h-16 w-auto mb-4 object-contain" />
          <p className="text-gray-600">Welcome back, Educator.</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[#8B5CF6] outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-600">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]" />
              Remember me
            </label>
            <a href="#" className="text-[#8B5CF6] hover:underline">Forgot password?</a>
          </div>

          <button type="submit" className="w-full py-3 px-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-gray-900 font-semibold rounded-lg shadow-md transition duration-200">
            Sign In
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <span className="h-px w-full bg-gray-300"></span>
          <span className="text-gray-500 text-sm">or</span>
          <span className="h-px w-full bg-gray-300"></span>
        </div>

        <button className="mt-6 w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium">
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-[#8B5CF6] hover:underline font-medium">Sign up</Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default Login;
