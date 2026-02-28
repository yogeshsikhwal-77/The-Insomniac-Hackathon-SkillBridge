import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
        const res = await fetch(`http://localhost:5000/api/my-chats/${userId}`);
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
        const response = await fetch('http://localhost:5000/api/mentors');
        const data = await response.json();
        
        if (response.ok) {
          setMentors(data);
        } else {
          console.error('Failed to fetch mentors:', data.error);
        }
      } catch (error) {
        console.error('Error connecting to backend:', error);
      }
    };

    const fetchConnections = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/connections/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
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
      const response = await fetch('http://localhost:5000/api/request-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juniorId: userId,
          seniorId: selectedMentor.id,
          reason: reason
        })
      });

      if (response.ok) {
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

  const filteredMentors = mentors.filter(mentor => {
    if (!searchQuery) return true;
    const safeSkills = mentor.skills || '';
    const safeName = mentor.full_name || '';
    return safeSkills.toLowerCase().includes(searchQuery.toLowerCase()) ||
           safeName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-16 selection:bg-blue-200">
      {/* Top Navigation Bar - Glassmorphism */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
              SkillBridge
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center text-sm font-medium text-gray-500 bg-gray-100/80 px-4 py-2 rounded-full">
              Hello, <span className="text-gray-900 font-bold ml-1">{userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/profile')}
                className="text-sm text-gray-600 hover:text-blue-600 font-semibold px-4 py-2 hover:bg-blue-50 rounded-xl transition-all"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-white font-semibold px-5 py-2 hover:bg-red-500 rounded-xl transition-all border border-red-100 hover:border-transparent"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* --- MY ACTIVE CHATS SECTION --- */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Active Chats</h2>
            <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
          </div>
          
          {myChats.length === 0 ? (
            <div className="bg-white/50 p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No active chats yet. Connect with a mentor below to get started!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myChats.map((chat) => (
                <div key={chat.connection_id} className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
                  <div className="flex justify-between items-start mb-3 pl-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{chat.target_name}</h3>
                    <span className={`text-[11px] uppercase tracking-wider px-3 py-1 rounded-full font-bold ${
                      chat.connection_type === 'Senior / Mentor' 
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {chat.connection_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-6 pl-2 truncate flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {chat.target_email}
                  </p>
                  
                  <button 
                    onClick={() => navigate(`/chat/${chat.target_user_id}`)}
                    className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hero & Search Section */}
        <div className="mb-14 relative z-10">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfect Mentor</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              Connect with experienced seniors, level up your skills, and accelerate your career journey today.
            </p>
          </div>

          <div className="relative max-w-3xl group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by skills (e.g., React, Python, UI/UX) or name..."
              className="w-full pl-14 pr-4 py-5 rounded-2xl border-0 bg-white shadow-lg shadow-gray-200/50 ring-1 ring-gray-200 focus:ring-4 focus:ring-blue-500/20 outline-none text-gray-800 transition-all text-lg font-medium placeholder:font-normal placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-500 font-semibold mt-6 tracking-wide">Discovering amazing seniors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => {
                const status = connections[mentor.id]; 

                return (
                  <div key={mentor.id} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-gray-100 flex flex-col group overflow-hidden">
                    {/* Card Header Abstract Background */}
                    <div className="h-24 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl"></div>
                    </div>
                    
                    <div className="px-8 pb-8 flex-grow flex flex-col -mt-12 relative z-10">
                      {/* Avatar */}
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-4xl shadow-xl shadow-blue-500/30 mb-5 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 border-4 border-white">
                        {mentor.full_name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{mentor.full_name}</h3>
                        <div className="flex items-center text-sm text-blue-600 font-bold mt-2 bg-blue-50 inline-flex px-3 py-1 rounded-full">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {mentor.year ? mentor.year : (mentor.role === 'senior' ? 'Senior Developer' : mentor.role)}
                        </div>
                      </div>
                      
                      {/* Skills */}
                      <div className="mb-8 flex-grow">
                        <h4 className="text-xs text-gray-400 uppercase font-black tracking-widest mb-3">Top Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills ? mentor.skills.split(',').map((skill, index) => (
                            <span key={index} className="bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-default text-xs px-3.5 py-1.5 rounded-lg font-bold border border-gray-100">
                              {skill.trim()}
                            </span>
                          )) : (
                            <span className="text-sm text-gray-400 italic bg-gray-50 px-3 py-1 rounded-lg">No skills listed yet</span>
                          )}
                        </div>
                      </div>

                      {/* Connect Button Logic */}
                      <div className="mt-auto pt-6 border-t border-gray-100">
                        {status === 'accepted' ? (
                          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                            <p className="text-sm font-extrabold text-emerald-700 mb-3 flex items-center gap-2">
                              <span className="bg-emerald-200 text-emerald-800 rounded-full p-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              Connection Accepted
                            </p>
                            <p className="text-xs text-gray-600 mb-1.5 flex items-center gap-2">
                              <strong className="text-gray-800">✉</strong> {mentor.email}
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <strong className="text-gray-800">📱</strong> {mentor.mobile_no || 'Not provided'}
                            </p>
                            <button 
                               onClick={() => navigate(`/chat/${mentor.id}`)}
                               className="mt-4 w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
                            >
                              Open Chat
                            </button>
                          </div>
                        ) : status === 'pending' ? (
                          <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-400 py-3 rounded-xl font-bold cursor-not-allowed border border-gray-200">
                            <svg className="w-5 h-5 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Request Sent</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedMentor(mentor)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                          >
                            <span>Connect</span>
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-gray-100 border-dashed shadow-sm">
                <div className="bg-gray-50 p-6 rounded-full mb-6 text-gray-300">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Mentors Found</h3>
                <p className="text-gray-500 text-lg">We couldn't find anyone matching "{searchQuery}". Try searching for a different skill!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- POPUP MODAL --- */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 border border-white/20">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white flex justify-between items-start relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-1">Connect Request</h2>
                <p className="text-blue-100 font-medium flex items-center gap-2">
                  To: <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-lg">{selectedMentor.full_name}</span>
                </p>
              </div>
              <button onClick={() => setSelectedMentor(null)} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all relative z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSendRequest} className="p-8">
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Why do you want to connect?
              </label>
              <textarea
                required
                rows="4"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none resize-none mb-8 text-gray-800 transition-all font-medium placeholder:font-normal placeholder:text-gray-400"
                placeholder="Hi! I am looking for guidance on React and noticed you have great experience..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => setSelectedMentor(null)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  {isSending ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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