import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllSessions, joinSession } from '../api/sessionApi';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../css/sessions-overview.css';

const SessionsOverviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directJoinCode, setDirectJoinCode] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [highlightedSessionId, setHighlightedSessionId] = useState(null);

  useEffect(() => {
    // Load all sessions
    loadSessions();
    
    // Check if redirected from creating a new session
    if (location.state && location.state.newSessionCreated) {
      setHighlightedSessionId(location.state.sessionId);
      
      // Clear the highlighted session after a delay
      setTimeout(() => {
        setHighlightedSessionId(null);
      }, 3000);
    }
  }, [location.state]);

  const loadSessions = () => {
    setLoading(true);
    try {
      const allSessions = getAllSessions();
      
      // Sort sessions by scheduled time (soonest first)
      const sortedSessions = allSessions.sort((a, b) => {
        const timeA = new Date(a.scheduledTime).getTime();
        const timeB = new Date(b.scheduledTime).getTime();
        return timeA - timeB;
      });
      
      setSessions(sortedSessions);
    } catch (err) {
      setError('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (sessionId, password = null) => {
    try {
      // Attempt to join the session
      const session = joinSession(sessionId, password);
      
      // If successful, navigate to the join page
      navigate(`/join/${sessionId}`, { 
        state: { sessionDetails: session } 
      });
    } catch (err) {
      setJoinError(err.message);
    }
  };

  const handleDirectJoin = (e) => {
    e.preventDefault();
    setJoinError(null);
    
    if (!directJoinCode.trim()) {
      setJoinError('Please enter a session code');
      return;
    }
    
    // Check if the code exists as a session ID
    const sessionExists = sessions.some(s => s.id === directJoinCode);
    
    if (sessionExists) {
      handleJoinSession(directJoinCode);
    } else {
      // If not found in existing sessions, use it as a direct room name
      navigate(`/join/${directJoinCode}`);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not scheduled';
    
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch (err) {
      return dateTimeStr;
    }
  };

  // Calculate if a session is happening now (within +/- 15 minutes of scheduled time)
  const isSessionNow = (scheduledTime) => {
    if (!scheduledTime) return false;
    
    const now = new Date().getTime();
    const sessionTime = new Date(scheduledTime).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    
    return Math.abs(now - sessionTime) <= fifteenMinutes;
  };

  return (
    <div className="user-sessions-page-wrapper">
      <NavBar />
      
      <div className="user-sessions-page-content">
        <div className="user-sessions-page-container">
          <div className="user-sessions-page-header">
            <h1>Live Skill Sessions</h1>
            <button 
              className="user-sessions-page-btn user-sessions-page-btn-primary"
              onClick={() => navigate('/schedule')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Schedule New Session
            </button>
          </div>
          
          <div className="user-sessions-page-grid">
            <section className="user-sessions-page-direct-join-section">
              <div className="user-sessions-page-card">
                <div className="user-sessions-page-card-header">
                  <h2>Join a Session</h2>
                </div>
                <div className="user-sessions-page-card-body">
                  <form className="user-sessions-page-direct-join-form" onSubmit={handleDirectJoin}>
                    <div className="user-sessions-page-form-group">
                      <label htmlFor="directJoinCode">Enter Session Code:</label>
                      <div className="user-sessions-page-input-with-button">
                        <input
                          type="text"
                          id="directJoinCode"
                          value={directJoinCode}
                          onChange={(e) => setDirectJoinCode(e.target.value)}
                          placeholder="Enter session code or ID"
                          className="user-sessions-page-input"
                        />
                        <button 
                          type="submit" 
                          className="user-sessions-page-btn user-sessions-page-btn-primary"
                        >
                          Join
                        </button>
                      </div>
                      {joinError && <p className="user-sessions-page-error-message">{joinError}</p>}
                    </div>
                  </form>
                </div>
              </div>
            </section>
            
            <section className="user-sessions-page-sessions-list-section">
              <div className="user-sessions-page-card">
                <div className="user-sessions-page-card-header">
                  <h2>Upcoming Sessions</h2>
                </div>
                
                <div className="user-sessions-page-card-body">
                  {loading ? (
                    <div className="user-sessions-page-loading-indicator">
                      <div className="user-sessions-page-loader"></div>
                      <p>Loading sessions...</p>
                    </div>
                  ) : error ? (
                    <div className="user-sessions-page-error-message">{error}</div>
                  ) : sessions.length === 0 ? (
                    <div className="user-sessions-page-no-sessions-message">
                      <div className="user-sessions-page-empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <h3>No upcoming sessions available</h3>
                        <p>Schedule a new session to get started!</p>
                        <button 
                          className="user-sessions-page-btn user-sessions-page-btn-primary"
                          onClick={() => navigate('/schedule')}
                        >
                          Schedule Session
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="user-sessions-page-sessions-list">
                      {sessions.map(session => (
                        <li 
                          key={session.id} 
                          className={`user-sessions-page-session-item ${
                            isSessionNow(session.scheduledTime) ? 'user-sessions-page-happening-now' : ''
                          } ${
                            session.id === highlightedSessionId ? 'user-sessions-page-highlighted' : ''
                          }`}
                        >
                          <div className="user-sessions-page-session-info">
                            <div className="user-sessions-page-session-meta">
                              {isSessionNow(session.scheduledTime) ? (
                                <span className="user-sessions-page-live-badge">
                                  <span className="user-sessions-page-live-dot"></span>
                                  Live Now
                                </span>
                              ) : (
                                <span className="user-sessions-page-time-badge">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  {formatDateTime(session.scheduledTime)}
                                </span>
                              )}
                              
                              {session.isPrivate && (
                                <span className="user-sessions-page-private-badge">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                  </svg>
                                  Private
                                </span>
                              )}
                            </div>
                            
                            <h3 className="user-sessions-page-session-title">{session.title}</h3>
                            
                            <div className="user-sessions-page-host-info">
                              <span className="user-sessions-page-host-avatar">
                                {session.hostName ? session.hostName.charAt(0).toUpperCase() : 'A'}
                              </span>
                              <span className="user-sessions-page-host-name">
                                {session.hostName || 'Anonymous'}
                              </span>
                            </div>
                            
                            {session.description && (
                              <p className="user-sessions-page-description">{session.description}</p>
                            )}
                            
                            {session.participantCount > 0 && (
                              <div className="user-sessions-page-participant-count">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                {session.participantCount} participant{session.participantCount !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          
                          <div className="user-sessions-page-session-actions">
                            <button 
                              className="user-sessions-page-btn user-sessions-page-btn-primary"
                              onClick={() => handleJoinSession(session.id)}
                            >
                              {isSessionNow(session.scheduledTime) ? 'Join Now' : 'Join Session'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SessionsOverviewPage;