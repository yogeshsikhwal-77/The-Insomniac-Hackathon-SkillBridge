import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [formData, setFormData] = useState({
    year: '',
    branch: '',
    skills: '',
    aboutMe: '',
    clubs: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const handleClubToggle = (clubName) => {
    setFormData((prev) => ({
      ...prev,
      clubs: prev.clubs.includes(clubName)
        ? prev.clubs.filter(c => c !== clubName)
        : [...prev.clubs, clubName]
    }));
  };

  // Fetch existing user data on load
  useEffect(() => {
    // If no user is logged in, send them back to the login page
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
          // This populates the form with whatever is already in the database
          setFormData({
            year: data.year || '',
            branch: data.branch || '',
            skills: data.skills || '',
            aboutMe: data.about_me || '',
            clubs: data.club ? data.club.split(',') : []
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    const submitData = {
      ...formData,
      club: formData.clubs.join(',') // Convert back to string for database
    };
    
    // Use `submitData` in the fetch instead of `formData`
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData), 
    });
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully! 🎉');
        setTimeout(() => navigate('/dashboard'), 2000); // Redirect back to dashboard after 2 seconds
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Server error occurred.');
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 py-6 px-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
            <button onClick={() => navigate('/dashboard')} className="text-blue-100 hover:text-white transition">
                Back to Dashboard
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white" required>
              <option value="" disabled>Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Computer Science" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. React, Python, UI/UX" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clubs</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.clubs.includes('devlup')}
                  onChange={() => handleClubToggle('devlup')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Devllup</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.clubs.includes('posoc')}
                  onChange={() => handleClubToggle('posoc')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>POSOC</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
            <textarea name="aboutMe" value={formData.aboutMe} onChange={handleChange} rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" placeholder="Tell us a bit about your experience, interests, and what you're looking for..." required />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200 shadow-md">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;