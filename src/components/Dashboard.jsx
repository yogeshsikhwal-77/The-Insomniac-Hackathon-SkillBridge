import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Define base URL once at the top so it's clean and reusable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Guest';
  const userId = localStorage.getItem('userId');

  const [mentors, setMentors] = useState([]);
  const [connections, setConnections] = useState({}); // Stores { mentorId: 'pending' | 'accepted' }
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [reason, setReason] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Chat State
  const [myChats, setMyChats] = useState([]);

  // Fetch accepted chats for the logged-in user
  useEffect(() => {
    const fetchMyChats = async () => {
      try {
        // 2. Updated to use dynamic URL
        const res = await fetch(`${API_BASE_URL}/api/my-chats/${userId}`);
        const data = await res.json();
        setMyChats(data);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    if (userId) {
      fetchMyChats();
    }
  }, [userId]);

  // Main data fetching
  useEffect(() => {
    if (!userName || !userId) {
      navigate('/');
      return;
    }

    const fetchMentors = async () => {
      try {
        // 3. Updated to use dynamic URL
        const response = await fetch(`${API_BASE_URL}/api/mentors`);

        if (response.ok) {
          const data = await response.json(); // FIXED BUG: This was missing in your original code!
          setMentors(data);
        } else {
          console.error('Failed to fetch mentors');
        }
      } catch (error) {
        console.error('Error connecting to backend:', error);
      }
    };

    const fetchConnections = async () => {
      try {
        // 4. FIXED BUG: Changed route to fetch connections, not mentors
        const response = await fetch(`${API_BASE_URL}/api/connections/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          const statusMap = {};
          data.forEach(conn => {
            statusMap[conn.senior_id] = conn.status;
          });
          setConnections(statusMap);
        }
      } catch (error) {
        console.error("Failed to fetch connections", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
    fetchConnections();
  }, [navigate, userName, userId]);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // 5. Updated to use dynamic URL
      const response = await fetch(`${API_BASE_URL}/api/request-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juniorId: userId,
          seniorId: selectedMentor.id,
          reason: reason
        })
      });

      if (response.ok) {
        // Update local state to show 'Requested' instantly
        setConnections(prev => ({ ...prev, [selectedMentor.id]: 'pending' }));
        setSelectedMentor(null);
        setReason('');
      } else {
        alert("Failed to send request. Check server console.");
      }
    } catch (error) {
      console.error("Error sending request", error);
      alert("Error connecting to server.");
    } finally {
      setIsSending(false);
    }
  };

  // Bulletproof filter logic
  const filteredMentors = mentors.filter(mentor => {
    if (!searchQuery) return true;
    const safeSkills = mentor.skills || '';
    const safeName = mentor.full_name || '';
    const safeClubs = mentor.club || '';
    return safeSkills.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safeClubs.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">SkillBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm font-medium text-gray-600">
              Hello, <span className="text-blue-600">{userName}</span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 hover:bg-blue-50 rounded-lg transition"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-semibold px-4 py-2 hover:bg-red-50 rounded-lg transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* --- MY ACTIVE CHATS SECTION --- */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b border-gray-200 pb-2">My Active Chats</h2>

          {myChats.length === 0 ? (
            <p className="text-gray-500 italic bg-white p-5 rounded-xl border border-dashed border-gray-300">
              No active chats yet. Connect with someone below to start chatting!
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myChats.map((chat) => (
                <div key={chat.connection_id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{chat.target_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${chat.connection_type === 'Senior / Mentor'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {chat.connection_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 truncate">{chat.target_email}</p>

                  <button
                    onClick={() => navigate(`/chat/${chat.target_user_id}`)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex justify-center items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfect Mentor</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Connect with experienced seniors, level up your skills, and accelerate your career journey.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="relative max-w-2xl mb-12 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by skills (e.g., React, Python, UI/UX) or name..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-gray-700 transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading amazing seniors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => {
                const status = connections[mentor.id]; // Get status for this specific mentor

                return (
                  <div key={mentor.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group overflow-hidden">
                    {/* Card Header Background */}
                    <div className="h-20 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100"></div>

                    <div className="px-6 pb-6 flex-grow flex flex-col -mt-10">
                      {/* Avatar */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-3xl border-4 border-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                        {mentor.full_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{mentor.full_name}</h3>
                        <div className="flex items-center text-sm text-blue-600 font-medium mt-1">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {mentor.year ? mentor.year : (mentor.role === 'senior' ? 'Senior Developer' : mentor.role)}
                        </div>
                      </div>

                      {/* Check if mentor has clubs, split them by comma, and map into badges */}
                      {mentor.club && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {mentor.club.split(',').map((clubName, index) => (
                            <span key={index} className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                              {clubName.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Example placement inside your mentor card map */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                          Club: {mentor.club ? mentor.club.toUpperCase() : 'None'}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="mb-6 flex-grow">
                        <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3">Top Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills ? mentor.skills.split(',').map((skill, index) => (
                            <span key={index} className="bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default text-xs px-3 py-1.5 rounded-lg font-medium">
                              {skill.trim()}
                            </span>
                          )) : (
                            <span className="text-sm text-gray-400 italic">No skills listed yet</span>
                          )}
                        </div>
                      </div>

                      {/* Connect Button Logic */}
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        {status === 'accepted' ? (
                          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Request Accepted
                            </p>
                            <p className="text-xs text-gray-700 mb-1"><strong>Email:</strong> {mentor.email}</p>
                            <p className="text-xs text-gray-700"><strong>Mobile:</strong> {mentor.mobile_no || 'Not provided'}</p>
                            <button
                              onClick={() => navigate(`/chat/${mentor.id}`)}
                              className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                              Open Chat
                            </button>
                          </div>
                        ) : status === 'pending' ? (
                          <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-2.5 rounded-xl font-semibold cursor-not-allowed border-2 border-transparent">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Requested</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedMentor(mentor)}
                            className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200"
                          >
                            <span>Connect</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Mentors Found</h3>
                <p className="text-gray-500">We couldn't find anyone matching "{searchQuery}". Try a different skill!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- POPUP MODAL --- */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Connect Request</h2>
                <p className="text-blue-100 text-sm mt-1">To: {selectedMentor.full_name}</p>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Why do you want to connect?
              </label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none mb-6 text-gray-700"
                placeholder="Hi! I am looking for guidance on React and noticed you have experience..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sending...
                    </>
                  ) : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;