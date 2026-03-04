import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Define base URL for dynamic environment support
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [skills, setSkills] = useState('');
  
  // FIXED: Changed "club, setClub" to "clubs, setClubs"
  const [clubs, setClubs] = useState([]);     

  const handleClubToggle = (clubName) => {
    setClubs((prev) => 
      prev.includes(clubName) 
        ? prev.filter(c => c !== clubName) 
        : [...prev, clubName]              
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'signin' : 'signup';
    // FIXED: Now uses the correct "clubs" variable
    const payload = isLogin 
      ? { email, password } 
      : { fullName, email, password, mobileNo, year, branch, skills, club: clubs.join(',') };

    try {
      // 2. Use the dynamic API_BASE_URL here
      const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok) {
        if (!isLogin) {
          alert('Account created successfully! Please sign in.');
          setIsLogin(true); 
          setPassword(''); 
        } else {
          if (data.user?.full_name) {
             localStorage.setItem('userName', data.user.full_name);
             localStorage.setItem('userId', data.user.id);
             localStorage.setItem('userYear', data.user.year);
          }
          navigate('/dashboard');
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isLogin ? 'Enter your details to sign in' : 'Join us by filling out the form below'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="1234567890" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} required />
            </div>
        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white" value={year} onChange={(e) => setYear(e.target.value)} required>
                <option value="" disabled>Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clubs</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={clubs.includes('devlup')}
                    onChange={() => handleClubToggle('devlup')}
                  />
                  <span className="text-gray-700">Devlup</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    checked={clubs.includes('posoc')}
                    onChange={() => handleClubToggle('posoc')}
                  />
                  <span className="text-gray-700">POSOC</span>
                </label>
              </div>
            </div>
        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Computer Science" value={branch} onChange={(e) => setBranch(e.target.value)} required />
            </div>
        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. React, Python, UI/UX" value={skills} onChange={(e) => setSkills(e.target.value)} required />
            </div>
          </>
        )}
        
        {isLogin && (
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500"
              onClick={() => alert('Redirect to Forgot Password logic')}
            >
              Forgot password?
            </button>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button" // FIXED: Added type="button" here to prevent accidental form submits
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 font-bold text-blue-600 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;