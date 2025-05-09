import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jitsiService from '../Services/jitsiService';
import { createSession } from '../api/sessionApi';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../css/schedule-page.css';

const SchedulePage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hostName: '',
    password: '',
    scheduledTime: '',
    isPrivate: false,
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved host name if available
  useEffect(() => {
    const savedName = localStorage.getItem('userDisplayName');
    if (savedName) {
      setFormData(prev => ({ ...prev, hostName: savedName }));
    }
    
    // Set default scheduled time to 15 minutes from now
    const defaultTime = new Date();
    defaultTime.setMinutes(defaultTime.getMinutes() + 15);
    setFormData(prev => ({ 
      ...prev, 
      scheduledTime: formatDateTimeForInput(defaultTime)
    }));
  }, []);

  // Helper function to format date for datetime-local input
  const formatDateTimeForInput = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear previous errors/success messages
    setError(null);
    setSuccess(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error('Session title is required');
      }
      
      if (!formData.hostName.trim()) {
        throw new Error('Host name is required');
      }
      
      // Generate a room name based on the title
      const roomName = jitsiService.generateRoomName(formData.title);
      
      // Save host name for future use
      localStorage.setItem('userDisplayName', formData.hostName);
      
      // Create the session
      const newSession = await createSession({
        ...formData,
        roomName,
        createdAt: new Date().toISOString(),
        participantCount: 0,
      });
      
      setSuccess('Session created successfully!');
      
      // Redirect to sessions overview after a short delay
      setTimeout(() => {
        navigate('/sessions', { 
          state: { 
            newSessionCreated: true,
            sessionId: newSession.id
          } 
        });
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-schedule-page-wrapper">
      <NavBar />
      
      <div className="user-schedule-page-content">
        <div className="user-schedule-page-container">
          <div className="user-schedule-page-header">
            <h1>Schedule a Live Skill Session</h1>
            <p>Create a new video session to share your skills with others</p>
          </div>
          
          <div className="user-schedule-page-card">
            <form className="user-schedule-page-form" onSubmit={handleSubmit}>
              <div className="user-schedule-page-form-group">
                <label htmlFor="title">Session Title<span className="user-schedule-page-required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for your session"
                  required
                  className="user-schedule-page-input"
                />
              </div>
              
              <div className="user-schedule-page-form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what participants will learn or do in this session"
                  className="user-schedule-page-textarea"
                  rows="4"
                />
              </div>
              
              <div className="user-schedule-page-form-row">
                <div className="user-schedule-page-form-group">
                  <label htmlFor="hostName">Your Name<span className="user-schedule-page-required">*</span></label>
                  <input
                    type="text"
                    id="hostName"
                    name="hostName"
                    value={formData.hostName}
                    onChange={handleInputChange}
                    placeholder="Enter your name as session host"
                    required
                    className="user-schedule-page-input"
                  />
                </div>
                
                <div className="user-schedule-page-form-group">
                  <label htmlFor="scheduledTime">Scheduled Time<span className="user-schedule-page-required">*</span></label>
                  <input
                    type="datetime-local"
                    id="scheduledTime"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    required
                    className="user-schedule-page-input"
                  />
                </div>
              </div>
              
              <div className="user-schedule-page-form-group user-schedule-page-checkbox-group">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                  className="user-schedule-page-checkbox"
                />
                <label htmlFor="isPrivate" className="user-schedule-page-checkbox-label">
                  Make this session private
                </label>
              </div>
              
              {formData.isPrivate && (
                <div className="user-schedule-page-form-group user-schedule-page-password-group">
                  <label htmlFor="password">Session Password<span className="user-schedule-page-required">*</span></label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password for your private session"
                    required={formData.isPrivate}
                    className="user-schedule-page-input"
                  />
                  <small className="user-schedule-page-helper-text">
                    Only people with this password will be able to join your session
                  </small>
                </div>
              )}
              
              {error && <div className="user-schedule-page-error-message">{error}</div>}
              {success && <div className="user-schedule-page-success-message">{success}</div>}
              
              <div className="user-schedule-page-form-actions">
                <button 
                  type="button" 
                  className="user-schedule-page-btn user-schedule-page-btn-secondary"
                  onClick={() => navigate('/sessions')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="user-schedule-page-btn user-schedule-page-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="user-schedule-page-spinner"></span>
                      Creating...
                    </>
                  ) : (
                    'Create Session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SchedulePage;