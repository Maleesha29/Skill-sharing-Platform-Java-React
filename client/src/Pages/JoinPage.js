// src/pages/JoinPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import JitsiMeetComponent from '../components/JitsiMeetComponent';
import jitsiService from '../Services/jitsiService';
import '../css/join-page.css';

const JoinPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sessionDetails, setSessionDetails] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  
  // Try to get session details from location state first
  useEffect(() => {
    // If we have session details in the location state, use those
    if (location.state && location.state.sessionDetails) {
      setSessionDetails(location.state.sessionDetails);
      setRoomName(location.state.sessionDetails.roomName || jitsiService.generateRoomName(location.state.sessionDetails.title));
      setRequiresPassword(!!location.state.sessionDetails.password);
    } 
    // Otherwise, try to fetch them from localStorage
    else if (sessionId) {
      try {
        // Get stored sessions from localStorage
        const storedSessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
        const session = storedSessions.find(s => s.id === sessionId);
        
        if (session) {
          setSessionDetails(session);
          setRoomName(session.roomName || jitsiService.generateRoomName(session.title));
          setRequiresPassword(!!session.password);
        } else {
          // If session not found in localStorage but we have a sessionId,
          // we'll just use that as the room name
          setRoomName(sessionId);
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        setJoinError('Unable to find session details. The session may no longer exist.');
      }
    } else {
      setJoinError('No session ID provided. Please select a session to join.');
    }
    
    // Try to get user's previous display name
    const savedName = localStorage.getItem('userDisplayName');
    if (savedName) {
      setDisplayName(savedName);
    }
  }, [sessionId, location.state]);

  const handleJoinSession = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!displayName.trim()) {
      setJoinError('Please enter your display name');
      return;
    }
    
    // Check password if required
    if (requiresPassword && sessionDetails && sessionDetails.password && password !== sessionDetails.password) {
      setJoinError('Incorrect password');
      return;
    }
    
    // Save display name for future use
    localStorage.setItem('userDisplayName', displayName);
    
    // Join the session
    setIsJoining(true);
    setJoinError(null);
  };
  
  const handleMeetingEnd = () => {
    navigate('/sessions', { replace: true });
  };

  // If we're still loading session details
  if (!sessionDetails && !joinError && !roomName) {
    return (
      <div className="join-page loading">
        <div className="loader"></div>
        <p>Loading session details...</p>
      </div>
    );
  }

  // If there was an error loading the session
  if (joinError && !isJoining) {
    return (
      <div className="join-page error">
        <div className="error-container">
          <h2>Session Error</h2>
          <p>{joinError}</p>
          <button className="btn btn-primary" onClick={() => navigate('/sessions')}>
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  // If we're showing the join form
  if (!isJoining) {
    return (
      <div className="join-page">
        <div className="join-container">
          <h2>{sessionDetails ? `Join: ${sessionDetails.title}` : 'Join Session'}</h2>
          
          {sessionDetails && (
            <div className="session-info">
              <p><strong>Host:</strong> {sessionDetails.hostName || 'Anonymous'}</p>
              {sessionDetails.description && (
                <p><strong>Description:</strong> {sessionDetails.description}</p>
              )}
              {sessionDetails.scheduledTime && (
                <p><strong>Scheduled Time:</strong> {new Date(sessionDetails.scheduledTime).toLocaleString()}</p>
              )}
            </div>
          )}
          
          <form onSubmit={handleJoinSession}>
            <div className="form-group">
              <label htmlFor="displayName">Your Name:</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
              />
            </div>
            
            {requiresPassword && (
              <div className="form-group">
                <label htmlFor="password">Session Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the session password"
                  required
                />
              </div>
            )}
            
            {joinError && <p className="error-message">{joinError}</p>}
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/sessions')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Join Now
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // If we're in the actual Jitsi session
  return (
    <div className="video-session-container">
      <JitsiMeetComponent
        roomName={roomName}
        displayName={displayName}
        onMeetingEnd={handleMeetingEnd}
      />
    </div>
  );
};

export default JoinPage;