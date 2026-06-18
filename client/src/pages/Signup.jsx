import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import logo from '../assets/logo.png';
import { VOCATIONAL_SKILLS } from '../utils/constants';

const vocationalImages = [
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=300&h=200", // Carpentry
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300&h=200", // Electrical
  "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300&h=200", // Mechanics
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
    gender: '', state: '',
    highestQualification: '', institution: '', yearOfGraduation: '',
    currentRole: '', organization: '', skills: '',
    otp: ''
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

  const handleNext = async () => {
    if (step === 1) {
      if (usernameStatus.includes('taken')) return setError('Please choose an available username');
      if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
      if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.gender || !formData.state) {
        return setError('Please fill all required fields');
      }
    } else if (step === 2) {
      if (!formData.highestQualification || !formData.institution || !formData.yearOfGraduation) {
        return setError('Please fill all required fields');
      }
    } else if (step === 3) {
      if (!formData.currentRole || !formData.organization || !formData.skills) {
        return setError('Please fill all required fields');
      }
      /* OTP Disabled for now
      try {
        await api.post('/api/auth/send-otp', { email: formData.email });
        setError('');
        setStep(4);
        return;
      } catch (err) {
        return setError(err.response?.data?.message || 'Failed to send verification code');
      }
      */
      handleSubmit({ preventDefault: () => {} }, true);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e, bypassStep = false) => {
    if (e && e.preventDefault) e.preventDefault();
    /* OTP Disabled for now
    if (step !== 4) return;
    */
    if (!bypassStep && step !== 4) return;
    
    try {
      const dataToSubmit = {
        ...formData,
        skills: formData.skills ? [formData.skills] : []
      };
      const res = await api.post('/api/auth/register', dataToSubmit);
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
          <div className="p-6 lg:p-8 bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-md border border-white/60 mb-6 transform hover:-translate-y-2 transition duration-500">
            <img src={logo} alt="VOCAL Logo" className="w-full max-h-24 lg:max-h-32 object-contain drop-shadow-lg" />
          </div>
          
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-md w-full glass p-6 rounded-2xl shadow-xl">
          <div className="text-center mb-4 flex flex-col items-center">
            <img src={logo} alt="VOCAL Logo" className="h-12 w-auto mb-2 object-contain lg:hidden" />
            <h2 className="text-2xl font-bold">Create Account</h2>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center justify-center mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-[#8B5CF6] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-8 h-1 ${step >= 2 ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-[#8B5CF6] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-8 h-1 ${step >= 3 ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-[#8B5CF6] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            <div className={`w-8 h-1 ${step >= 4 ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 4 ? 'bg-[#8B5CF6] text-white' : 'bg-gray-200 text-gray-500'}`}>4</div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {step === 1 && "Personal Details"}
              {step === 2 && "Qualification Details"}
              {step === 3 && "Current Practice Details"}
              {step === 4 && "Verify Email"}
            </h3>
          </div>

          {error && <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <input type="text" name="fullName" value={formData.fullName} placeholder="Full Name" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <input type="text" name="username" value={formData.username} placeholder="Username" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                  {usernameStatus && <p className={`text-xs mt-1 font-medium ${usernameStatus.includes('taken') ? 'text-red-500' : 'text-green-500'}`}>{usernameStatus}</p>}
                </div>
                <div>
                  <input type="email" name="email" value={formData.email} placeholder="Email" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <input type="password" name="password" value={formData.password} placeholder="Password" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} placeholder="Confirm Password" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div className="flex space-x-3">
                  <select name="gender" value={formData.gender} required onChange={handleChange} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition text-gray-700">
                    <option value="" disabled>Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <select name="state" value={formData.state} required onChange={handleChange} className="w-1/2 px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition text-gray-700">
                    <option value="" disabled>State / UT</option>
                    {[
                      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
                      "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
                      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
                      "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
                      "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                    ].map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Qualification Details */}
            {step === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <input type="text" name="highestQualification" value={formData.highestQualification} placeholder="Highest Qualification (e.g., Master's in Education)" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <input type="text" name="institution" value={formData.institution} placeholder="Institution / University" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <input type="number" name="yearOfGraduation" value={formData.yearOfGraduation} placeholder="Year of Graduation (e.g., 2020)" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
              </div>
            )}

            {/* STEP 3: Current Practice Details */}
            {step === 3 && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <input type="text" name="currentRole" value={formData.currentRole} placeholder="Current Role (e.g., Vocational Instructor)" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <input type="text" name="organization" value={formData.organization} placeholder="Organization / School" required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" />
                </div>
                <div>
                  <select name="skills" value={formData.skills} required onChange={handleChange} className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition text-gray-700">
                    <option value="" disabled>Select your Vocational Subject</option>
                    {VOCATIONAL_SKILLS.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* STEP 4: Email Verification */}
            {step === 4 && (
              <div className="space-y-3 animate-fade-in text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a 6-digit verification code to <strong>{formData.email}</strong>.
                </p>
                <div>
                  <input type="text" name="otp" value={formData.otp} placeholder="Enter 6-digit Code" required onChange={handleChange} className="w-full px-4 py-3 text-center tracking-widest text-lg rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" maxLength="6" />
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex space-x-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={handlePrev} className="w-1/3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
                  Back
                </button>
              )}
              {step < 4 ? (
                <button type="button" onClick={handleNext} className={`${step > 1 ? 'w-2/3' : 'w-full'} py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-md transition`}>
                  {/* OTP Disabled for now */}
                  {/* {step === 3 ? "Send Verification Code" : "Next"} */}
                  {step === 3 ? "Create Account" : "Next"}
                </button>
              ) : (
                <button type="submit" className="w-2/3 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white font-semibold rounded-lg shadow-md transition">
                  Verify & Create Account
                </button>
              )}
            </div>
          </form>

          {step === 1 && (
            <>
              <div className="mt-5 flex items-center justify-center space-x-2">
                <span className="h-px w-full bg-gray-300"></span>
                <span className="text-gray-500 text-sm">or</span>
                <span className="h-px w-full bg-gray-300"></span>
              </div>

              <button className="mt-4 w-full flex items-center justify-center space-x-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                <FcGoogle className="text-lg" />
                <span>Sign up with Google</span>
              </button>
            </>
          )}

          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-[#8B5CF6] hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
