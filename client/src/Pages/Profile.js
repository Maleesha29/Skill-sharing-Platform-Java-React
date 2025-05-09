import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/authService';
import '../css/Profile.css';
import Navbar from '../components/NavBar';
import { FaUserEdit, FaSignOutAlt, FaTrash, FaTh, FaBookmark, FaTag } from 'react-icons/fa';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    navigate('/Login');
                    return;
                }
                setUser(currentUser);
            } catch (error) {
                setError('Failed to load profile data');
                console.error(error);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
            try {
                await authService.deleteProfile(user.id);
                authService.logout();
                navigate('/Login');
            } catch (error) {
                setError(error.message || 'Failed to delete profile');
            }
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    if (!user) return (
        <div className="Profile-loading-container">
            <div className="Profile-loading-spinner"></div>
            <p>Loading profile...</p>
        </div>
    );

    // Mock data for posts, followers, following
    const postCount = 0; // Will be replaced with actual data
    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    return (
        <div className="Profile-page">
            <Navbar />
            
            <div className="Profile-container">
                {error && <div className="Profile-error-message">{error}</div>}
                
                <div className="Profile-header">
                    <div className="Profile-avatar-container">
                        <img
                            src={user.profilePicture || '/ProfailIcon.jpg'}
                            alt={user.username}
                            className="Profile-avatar"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/ProfailIcon.jpg';
                            }}
                        />
                    </div>
                    
                    <div className="Profile-user-info">
                        <div className="Profile-username-section">
                            <h1 className="Profile-username">{user.username}</h1>
                            <div className="Profile-actions">
                                <button 
                                    onClick={() => navigate('/update-profile')} 
                                    className="Profile-edit-button"
                                >
                                    <FaUserEdit /> Edit Profile
                                </button>
                                <button 
                                    onClick={handleLogout} 
                                    className="Profile-logout-button"
                                >
                                    <FaSignOutAlt />
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    className="Profile-delete-button"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        
                        <div className="Profile-stats">
                            <div className="Profile-stat-item">
                                <span className="Profile-stat-count">{postCount}</span> posts
                            </div>
                            <div className="Profile-stat-item">
                                <span className="Profile-stat-count">{followersCount}</span> followers
                            </div>
                            <div className="Profile-stat-item">
                                <span className="Profile-stat-count">{followingCount}</span> following
                            </div>
                        </div>
                        
                        <div className="Profile-bio-section">
                            <h2 className="Profile-real-name">{user.firstName} {user.lastName}</h2>
                            <p className="Profile-bio">{user.bio || 'No bio yet'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="Profile-content">
                    <div className="Profile-tabs">
                        <button 
                            className={`Profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            <FaTh /> POSTS
                        </button>
                        <button 
                            className={`Profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            <FaBookmark /> SAVED
                        </button>
                        <button 
                            className={`Profile-tab ${activeTab === 'tagged' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tagged')}
                        >
                            <FaTag /> TAGGED
                        </button>
                    </div>
                    
                    <div className="Profile-gallery">
                        {postCount === 0 ? (
                            <div className="Profile-no-posts">
                                <div className="Profile-no-posts-icon">📷</div>
                                <h3>No Posts Yet</h3>
                                <p>When you share photos, they will appear on your profile.</p>
                                <button className="Profile-share-button">Share your first photo</button>
                            </div>
                        ) : (
                            // This would be populated with actual posts
                            <div className="Profile-posts-grid">
                                {/* Post items would go here */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
