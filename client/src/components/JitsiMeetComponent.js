import React, { useEffect, useState, useRef } from 'react';
import jitsiService from '../Services/jitsiService';
import '../css/jitsi.css';

const JitsiMeetComponent = ({ 
  roomName, 
  displayName = 'Guest User',
  onApiReady = () => {},
  onMeetingEnd = () => {}
}) => {
  const jitsiContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    
    let isMounted = true;
    
    const initializeJitsi = async () => {
      try {
        setLoading(true);
        
        
        if (!jitsiContainerRef.current) {
          throw new Error('Jitsi container not found');
        }

        
        const jitsiApi = await jitsiService.initJitsiMeet({
          roomName: roomName || 'LiveSkillSession',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName
          }
        });

        
        if (isMounted) {
          setApi(jitsiApi);
          setLoading(false);
          onApiReady(jitsiApi);
          
          
          jitsiApi.addListener('readyToClose', () => {
            if (isMounted) {
              onMeetingEnd();
            }
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to initialize Jitsi:', err);
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializeJitsi();

    
    return () => {
      isMounted = false;
      if (api) {
        api.dispose();
      }
      jitsiService.disposeJitsiMeet();
    };
  }, [roomName, displayName, onApiReady, onMeetingEnd]);

  
  if (error) {
    return (
      <div className="jitsi-error-container">
        <h3>Failed to load video conference</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="jitsi-component">
      {loading && (
        <div className="jitsi-loader">
          <div className="loader-spinner"></div>
          <p>Setting up your meeting...</p>
        </div>
      )}
      <div 
        id="jitsi-container" 
        ref={jitsiContainerRef} 
        className="jitsi-container"
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default JitsiMeetComponent;