import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userDataParam = params.get('userData');
        const token = params.get('token');
        
        if (userDataParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userDataParam));
                
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify({
                    ...userData,
                    profileImage: userData.profileImage || "http://www.w3.org/2000/svg"
                }));
                
                // Store token in localStorage if present
                if (token) {
                    localStorage.setItem('token', token);
                }
                
                navigate('/Profile');
            } catch (error) {
                console.error('OAuth authentication failed:', error);
                navigate('/Login', { state: { error: 'Authentication failed' } });
            }
        } else {
            navigate('/Login', { state: { error: 'Authentication failed' } });
        }
    }, [navigate, location]);

    return (
        <div className="oauth-redirect">
            <p>Please wait, redirecting...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;