import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 p-4">
      <div className="max-w-md w-full glass p-8 rounded-2xl shadow-xl border border-white/50 bg-white/60 backdrop-blur-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8B5CF6] mb-2 tracking-tight">VOCAL</h1>
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
  );
};

export default Login;
