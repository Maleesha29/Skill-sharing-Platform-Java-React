

export const getSessions = () => {
  return new Promise((resolve) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      resolve(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      resolve([]);
    }
  });
};


export const getSessionById = (sessionId) => {
  return new Promise((resolve) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      const session = sessions.find((s) => s.id === sessionId);
      resolve(session || null);
    } catch (error) {
      console.error('Error fetching session:', error);
      resolve(null);
    }
  });
};

/**
 * Fetches a specific session by room name
 * @param {string} roomName - Room name of the session to fetch
 * @returns {Promise<Object|null>} - Session object or null if not found
 */
export const getSessionByRoomName = (roomName) => {
  return new Promise((resolve) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      const session = sessions.find((s) => s.roomName === roomName);
      resolve(session || null);
    } catch (error) {
      console.error('Error fetching session by room name:', error);
      resolve(null);
    }
  });
};

/**
 * Creates a new session
 * @param {Object} sessionData - Session data to create
 * @returns {Promise<Object>} - Created session object
 */
export const createSession = (sessionData) => {
  return new Promise((resolve) => {
    try {
      
      const newSession = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...sessionData,
      };

      
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      const updatedSessions = [...sessions, newSession];
      
      
      localStorage.setItem('skillSessions', JSON.stringify(updatedSessions));
      
      
      resolve(newSession);
    } catch (error) {
      console.error('Error creating session:', error);
      resolve(null);
    }
  });
};

/**
 * Updates an existing session
 * @param {string} sessionId - ID of the session to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated session object or null if not found
 */
export const updateSession = (sessionId, updates) => {
  return new Promise((resolve) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        resolve(null);
        return;
      }
      
      
      const updatedSession = {
        ...sessions[sessionIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      
      sessions[sessionIndex] = updatedSession;
      
      
      localStorage.setItem('skillSessions', JSON.stringify(sessions));
      
      
      resolve(updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
      resolve(null);
    }
  });
};

/**
 * Deletes a session
 * @param {string} sessionId - ID of the session to delete
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
export const deleteSession = (sessionId) => {
  return new Promise((resolve) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      const filteredSessions = sessions.filter((s) => s.id !== sessionId);
      
      // If no sessions were removed, return false
      if (filteredSessions.length === sessions.length) {
        resolve(false);
        return;
      }
      
      // Save the filtered sessions back to localStorage
      localStorage.setItem('skillSessions', JSON.stringify(filteredSessions));
      
      // Return success
      resolve(true);
    } catch (error) {
      console.error('Error deleting session:', error);
      resolve(false);
    }
  });
};

/**
 * Gets upcoming public sessions
 * @returns {Promise<Array>} - Array of upcoming public session objects
 */
export const getUpcomingPublicSessions = () => {
  return new Promise((resolve) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('skillSessions') || '[]');
      const now = new Date();
      
      const upcomingSessions = sessions.filter((session) => {
        return session.isPublic && new Date(session.startTime) > now;
      }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      resolve(upcomingSessions);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      resolve([]);
    }
  });
};