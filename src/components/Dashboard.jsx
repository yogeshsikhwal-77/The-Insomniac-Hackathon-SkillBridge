import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const BASE_URL = 'http://localhost:5000';
const PALETTES = ['pal-0','pal-1','pal-2','pal-3','pal-4','pal-5'];

const IconSearch = () => (
  <svg className="db-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);
const IconChat = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
);
const IconArrow = () => (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
  </svg>
);
const IconCheck = () => (
  <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
  </svg>
);
const IconSpinner = () => (
  <svg className="db-spin-icon" width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const IconClose = () => (
  <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Guest';
  const userId   = localStorage.getItem('userId');

  const [mentors,        setMentors]        = useState([]);
  const [connections,    setConnections]    = useState({});
  const [myChats,        setMyChats]        = useState([]);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [isLoading,      setIsLoading]      = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [reason,         setReason]         = useState('');
  const [isSending,      setIsSending]      = useState(false);

  useEffect(() => {
    if (!userName || !userId) navigate('/');
  }, [navigate, userName, userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${BASE_URL}/api/my-chats/${userId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setMyChats(data))
      .catch(err => console.error('Failed to fetch chats:', err));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetch(`${BASE_URL}/api/mentors`).then(r => r.json()),
      fetch(`${BASE_URL}/api/connections/${userId}`).then(r => r.json()),
    ])
      .then(([mentorData, connData]) => {
        setMentors(Array.isArray(mentorData) ? mentorData : []);
        if (Array.isArray(connData)) {
          const map = {};
          connData.forEach(c => { map[c.senior_id] = c.status; });
          setConnections(map);
        }
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/request-connection`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ juniorId: userId, seniorId: selectedMentor.id, reason }),
      });
      if (res.ok) {
        setConnections(prev => ({ ...prev, [selectedMentor.id]: 'pending' }));
        setSelectedMentor(null);
        setReason('');
      } else {
        alert('Failed to send request. Please try again.');
      }
    } catch (err) {
      console.error('Request error:', err);
      alert('Could not connect to server.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredMentors = mentors.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.full_name || '').toLowerCase().includes(q) ||
      (m.skills    || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="db-root">

      {/* ── NAV ── */}
      <nav className="db-nav">
        <div className="db-logo">
          <span className="db-logo-dot" />
          SkillBridge
        </div>
        <div className="flex items-center gap-3">
          <span className="db-nav-greeting hidden md:block">
            Hello, <span>{userName}</span>
          </span>
          <button className="db-btn-ghost" onClick={() => navigate('/profile')}>Profile</button>
          <button className="db-btn-danger" onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">

        {/* HERO */}
        <div className="db-hero">
          <div className="db-hero-bg" />
          <div className="db-hero-grid" />
          <div className="db-hero-content">
            <div className="db-eyebrow">Mentorship Platform</div>
            <h1>Find Your<br /><em>Perfect Mentor</em></h1>
            <p>Connect with experienced seniors, level up your skills, and accelerate your career journey.</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="db-search-wrap">
          <IconSearch />
          <input
            type="text"
            placeholder="Search by skills (e.g. React, Python) or name…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ── ACTIVE CHATS ── */}
        <section className="mb-14">
          <div className="db-section-header">
            <span className="db-section-title">Active Chats</span>
            <span className="db-section-count">{myChats.length}</span>
          </div>
          {myChats.length === 0 ? (
            <div className="db-empty-state">
              No active chats yet — connect with a mentor below to get started!
            </div>
          ) : (
            <div className="db-chat-grid">
              {myChats.map(chat => (
                <div key={chat.connection_id} className="db-chat-card">
                  <div className="db-chat-card-top">
                    <span className="db-chat-name">{chat.target_name}</span>
                    <span className={`db-badge ${chat.connection_type === 'Senior / Mentor' ? 'db-badge-senior' : 'db-badge-junior'}`}>
                      {chat.connection_type}
                    </span>
                  </div>
                  <div className="db-chat-email">{chat.target_email}</div>
                  <button className="db-chat-btn" onClick={() => navigate(`/chat/${chat.target_user_id}`)}>
                    <IconChat /> Open Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── BROWSE MENTORS ── */}
        <section>
          <div className="db-section-header">
            <span className="db-section-title">Browse Mentors</span>
            <span className="db-section-count">{filteredMentors.length} found</span>
          </div>
          {isLoading ? (
            <div className="db-loading">
              <div className="db-spinner" />
              <span>Loading mentors…</span>
            </div>
          ) : (
            <div className="db-mentor-grid">
              {filteredMentors.length > 0 ? (
                filteredMentors.map((mentor, i) => {
                  const status = connections[mentor.id];
                  const pal    = PALETTES[i % PALETTES.length];
                  return (
                    <div key={mentor.id} className="db-mentor-card" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className={`db-card-top ${pal}`} />
                      <div className="db-card-body">
                        <div className={`db-avatar ${pal}`}>
                          {(mentor.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="db-mentor-name">{mentor.full_name}</div>
                        <div className="db-mentor-role">
                          {mentor.year || (mentor.role === 'senior' ? 'Senior Developer' : mentor.role)}
                        </div>
                        <div className="db-skills-label">Top Skills</div>
                        <div className="db-skills">
                          {mentor.skills
                            ? mentor.skills.split(',').map((s, idx) => (
                                <span key={idx} className="db-skill-tag">{s.trim()}</span>
                              ))
                            : <span className="db-no-skills">No skills listed</span>
                          }
                        </div>
                        <div className="db-card-footer">
                          {status === 'accepted' && (
                            <div className="db-accepted-box">
                              <p className="db-accepted-label"><IconCheck /> Request Accepted</p>
                              <p className="db-accepted-info"><strong>Email:</strong> {mentor.email}</p>
                              <p className="db-accepted-info"><strong>Mobile:</strong> {mentor.mobile_no || 'Not provided'}</p>
                              <button className="db-btn-open-chat" onClick={() => navigate(`/chat/${mentor.id}`)}>
                                Open Chat
                              </button>
                            </div>
                          )}
                          {status === 'pending' && (
                            <button className="db-btn-pending" disabled>
                              <IconSpinner /> Requested
                            </button>
                          )}
                          {!status && (
                            <button className="db-btn-connect" onClick={() => setSelectedMentor(mentor)}>
                              Connect <IconArrow />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="db-no-results">
                  <div className="db-no-results-title">No Mentors Found</div>
                  <div className="db-no-results-sub">Nothing matched "{searchQuery}" — try a different skill or name.</div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── MODAL ── */}
      {selectedMentor && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedMentor(null)}>
          <div className="db-modal">
            <div className="db-modal-head">
              <div>
                <div className="db-modal-title">Connect Request</div>
                <div className="db-modal-sub">To: {selectedMentor.full_name}</div>
              </div>
              <button className="db-modal-close" onClick={() => setSelectedMentor(null)}><IconClose /></button>
            </div>
            <div className="db-modal-body">
              <form onSubmit={handleSendRequest}>
                <label className="db-modal-label">Why do you want to connect?</label>
                <textarea
                  required rows={4}
                  className="db-modal-textarea"
                  placeholder="Hi! I am looking for guidance on React and noticed your great experience…"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                />
                <div className="db-modal-actions">
                  <button type="button" className="db-btn-cancel" onClick={() => setSelectedMentor(null)}>Cancel</button>
                  <button type="submit" className="db-btn-submit" disabled={isSending}>
                    {isSending ? <><IconSpinner /> Sending…</> : 'Send Request →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
