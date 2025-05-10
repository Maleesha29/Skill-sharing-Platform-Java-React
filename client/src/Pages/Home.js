import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../css/HomePage.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Home() {
  // States for data
  const [learningPlans, setLearningPlans] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('featured');
  
  // User info (hardcoded for demo purposes)
  const userId = 1;
  const username = "John Doe";
  
  useEffect(() => {
    // Load both learning plans and posts
    const fetchData = async () => {
      setLoading(true);
      try {
        // Parallel requests
        const [plansResponse, postsResponse] = await Promise.all([
          axios.get("http://localhost:8080/api/learning-plans"),
          axios.get("http://localhost:8080/api/posts")
        ]);
        
        setLearningPlans(Array.isArray(plansResponse.data) ? plansResponse.data : []);
        setPosts(Array.isArray(postsResponse.data) ? postsResponse.data : []);
      } catch (error) {
        console.error("Error loading data:", error);
        setLearningPlans([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };
  
  // Get status badge class for learning plans
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'NOT_STARTED': 
        return "user-home-page-badge user-home-page-badge-secondary";
      case 'IN_PROGRESS': 
        return "user-home-page-badge user-home-page-badge-primary";
      case 'COMPLETED': 
        return "user-home-page-badge user-home-page-badge-success";
      default: 
        return "user-home-page-badge user-home-page-badge-light";
    }
  };
  
  // Handle like function for posts
  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    const isLiked = post.likes && post.likes.includes(userId);
    
    try {
      if (isLiked) {
        await axios.put(`http://localhost:8080/api/posts/${postId}/unlike/${userId}`);
      } else {
        await axios.put(`http://localhost:8080/api/posts/${postId}/like/${userId}`);
      }
      
      // Update posts state after like/unlike
      const updatedPost = await axios.get(`http://localhost:8080/api/posts/${postId}`);
      setPosts(posts.map(p => p.id === postId ? updatedPost.data : p));
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };
  
  // Get featured items (mix of plans and posts)
  const getFeaturedItems = () => {
    // Logic to determine featured items - for this example, we'll take recent items
    const recentPlans = learningPlans.slice(0, 2);
    const recentPosts = posts.slice(0, 2);
    
    return { recentPlans, recentPosts };
  };
  
  // Render media for posts
  const renderMedia = (url) => {
    const isImage = /\.(jpeg|jpg|gif|png)$/i.test(url);
    
    if (isImage) {
      return (
        <img 
          src={url} 
          alt="Post media" 
          className="user-home-page-media-thumbnail"
        />
      );
    } else {
      return (
        <div className="user-home-page-file-icon">
          <span>📎</span>
        </div>
      );
    }
  };
  
  // Check if a post is liked by current user
  const isPostLiked = (post) => {
    return post.likes && post.likes.includes(userId);
  };
  
  const { recentPlans, recentPosts } = getFeaturedItems();
  
  return (
    <>
      <NavBar />
      
      <div className="user-home-page-container">
        <div className="user-home-page-hero">
          <div className="user-home-page-hero-content">
            <h1>Learn, Share, Grow</h1>
            <p>Connect with peers, share skills, and accelerate your learning journey</p>
            <div className="user-home-page-hero-buttons">
              <Link to="/learning-plan/add" className="user-home-page-btn user-home-page-btn-primary">
                Create Learning Plan
              </Link>
              <Link to="/add-post" className="user-home-page-btn user-home-page-btn-secondary">
                Share Your Skills
              </Link>
            </div>
          </div>
        </div>
        
        <div className="user-home-page-stats-overview">
          <div className="user-home-page-stat-card">
            <div className="user-home-page-stat-icon">📚</div>
            <div className="user-home-page-stat-value">{learningPlans.length}</div>
            <div className="user-home-page-stat-label">Learning Plans</div>
          </div>
          <div className="user-home-page-stat-card">
            <div className="user-home-page-stat-icon">📝</div>
            <div className="user-home-page-stat-value">{posts.length}</div>
            <div className="user-home-page-stat-label">Skill Posts</div>
          </div>
          <div className="user-home-page-stat-card">
            <div className="user-home-page-stat-icon">🏆</div>
            <div className="user-home-page-stat-value">
              {learningPlans.filter(plan => plan.status === 'COMPLETED').length}
            </div>
            <div className="user-home-page-stat-label">Completed Plans</div>
          </div>
        </div>
        
        <div className="user-home-page-tab-container">
          <div className="user-home-page-tabs">
            <button 
              className={`user-home-page-tab ${activeTab === 'featured' ? 'user-home-page-active' : ''}`}
              onClick={() => setActiveTab('featured')}
            >
              Featured
            </button>
            <button 
              className={`user-home-page-tab ${activeTab === 'plans' ? 'user-home-page-active' : ''}`}
              onClick={() => setActiveTab('plans')}
            >
              Learning Plans
            </button>
            <button 
              className={`user-home-page-tab ${activeTab === 'posts' ? 'user-home-page-active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Skill Posts
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="user-home-page-loading">
            <div className="user-home-page-spinner"></div>
            <span>Loading your personalized dashboard...</span>
          </div>
        ) : (
          <div className="user-home-page-content">
            {/* Featured Tab Content */}
            {activeTab === 'featured' && (
              <div className="user-home-page-featured">
                <div className="user-home-page-section">
                  <div className="user-home-page-section-header">
                    <h2>Featured Learning Plans</h2>
                    <Link to="/learning-plans" className="user-home-page-view-all">View All</Link>
                  </div>
                  
                  <div className="user-home-page-cards-grid">
                    {recentPlans.length > 0 ? (
                      recentPlans.map((plan) => (
                        <div className="user-home-page-plan-card" key={plan.id}>
                          <div className="user-home-page-card-header">
                            <h3 className="user-home-page-card-title">{plan.title}</h3>
                            <span className={getStatusBadgeClass(plan.status)}>
                              {plan.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="user-home-page-card-dates">
                            <span className="user-home-page-date-icon">🗓️</span>
                            <span className="user-home-page-date-text">
                              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                            </span>
                          </div>
                          
                          <div className="user-home-page-card-description">
                            {plan.description.length > 120 
                              ? `${plan.description.substring(0, 120)}...` 
                              : plan.description}
                          </div>
                          
                          <div className="user-home-page-progress-container">
                            <div className="user-home-page-progress-info">
                              <span>Progress</span>
                              <span className="user-home-page-progress-percentage">{plan.progressPercentage}%</span>
                            </div>
                            <div className="user-home-page-progress-bar">
                              <div 
                                className="user-home-page-progress-fill" 
                                style={{ width: `${plan.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <Link to={`/view-learning-plan/${plan.id}`} className="user-home-page-btn user-home-page-btn-view">
                            View Details
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="user-home-page-empty-state">
                        <p>No learning plans available yet.</p>
                        <Link to="/learning-plan/add" className="user-home-page-btn user-home-page-btn-primary">
                          Create Your First Plan
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="user-home-page-section">
                  <div className="user-home-page-section-header">
                    <h2>Recent Skill Posts</h2>
                    <Link to="/posts" className="user-home-page-view-all">View All</Link>
                  </div>
                  
                  <div className="user-home-page-posts-grid">
                    {recentPosts.length > 0 ? (
                      recentPosts.map((post) => (
                        <div className="user-home-page-post-card" key={post.id}>
                          <div className="user-home-page-post-header">
                            <div className="user-home-page-profile-pic">
                              <span className="user-home-page-person-icon">👤</span>
                            </div>
                            <div className="user-home-page-user-info">
                              <h4 className="user-home-page-username">{username}</h4>
                              <p className="user-home-page-time">{formatDate(post.createdAt)}</p>
                            </div>
                          </div>
                          
                          <h3 className="user-home-page-post-title">{post.title}</h3>
                          
                          <div className="user-home-page-post-preview">
                            {post.content.length > 100 
                              ? `${post.content.substring(0, 100)}...` 
                              : post.content}
                          </div>
                          
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="user-home-page-post-media">
                              {renderMedia(post.mediaUrls[0])}
                              {post.mediaUrls.length > 1 && (
                                <span className="user-home-page-more-media">+{post.mediaUrls.length - 1}</span>
                              )}
                            </div>
                          )}
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="user-home-page-post-tags">
                              {post.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="user-home-page-tag">{tag}</span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="user-home-page-more-tags">+{post.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                          
                          <div className="user-home-page-post-actions">
                            <button 
                              className={`user-home-page-like-btn ${isPostLiked(post) ? 'user-home-page-liked' : ''}`}
                              onClick={() => handleLike(post.id)}
                            >
                              <span className="user-home-page-like-icon">👍</span>
                              <span>{post.likes ? post.likes.length : 0}</span>
                            </button>
                            
                            <Link to={`/view-post/${post.id}`} className="user-home-page-view-post-btn">
                              Read More
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="user-home-page-empty-state">
                        <p>No skill posts available yet.</p>
                        <Link to="/add-post" className="user-home-page-btn user-home-page-btn-primary">
                          Share Your First Skill
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Learning Plans Tab Content */}
            {activeTab === 'plans' && (
              <div className="user-home-page-learning-plans-tab">
                <div className="user-home-page-section-header">
                  <h2>My Learning Plans</h2>
                  <Link to="/learning-plan/add" className="user-home-page-btn user-home-page-btn-primary">
                    <span>+</span> New Plan
                  </Link>
                </div>
                
                <div className="user-home-page-cards-grid">
                  {learningPlans.length > 0 ? (
                    learningPlans.map((plan) => (
                      <div className="user-home-page-plan-card" key={plan.id}>
                        <div className="user-home-page-card-header">
                          <h3 className="user-home-page-card-title">{plan.title}</h3>
                          <span className={getStatusBadgeClass(plan.status)}>
                            {plan.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="user-home-page-card-dates">
                          <span className="user-home-page-date-icon">🗓️</span>
                          <span className="user-home-page-date-text">
                            {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                          </span>
                        </div>
                        
                        <div className="user-home-page-card-description">
                          {plan.description.length > 120 
                            ? `${plan.description.substring(0, 120)}...` 
                            : plan.description}
                        </div>
                        
                        <div className="user-home-page-progress-container">
                          <div className="user-home-page-progress-info">
                            <span>Progress</span>
                            <span className="user-home-page-progress-percentage">{plan.progressPercentage}%</span>
                          </div>
                          <div className="user-home-page-progress-bar">
                            <div 
                              className="user-home-page-progress-fill" 
                              style={{ width: `${plan.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {plan.topics && plan.topics.length > 0 && (
                          <div className="user-home-page-topics">
                            {plan.topics.slice(0, 3).map((topic, index) => (
                              <span key={index} className="user-home-page-topic-tag">
                                {topic}
                              </span>
                            ))}
                            {plan.topics.length > 3 && (
                              <span className="user-home-page-topic-more">+{plan.topics.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="user-home-page-card-actions">
                          <Link to={`/view-learning-plan/${plan.id}`} className="user-home-page-btn user-home-page-btn-view">
                            View Details
                          </Link>
                          <div className="user-home-page-btn-group">
                            <Link to={`/edit-learning-plan/${plan.id}`} className="user-home-page-btn user-home-page-btn-outline">
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="user-home-page-empty-state">
                      <p>No learning plans available yet.</p>
                      <Link to="/learning-plan/add" className="user-home-page-btn user-home-page-btn-primary">
                        Create Your First Plan
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Skill Posts Tab Content */}
            {activeTab === 'posts' && (
              <div className="user-home-page-posts-tab">
                <div className="user-home-page-section-header">
                  <h2>Skill Sharing Posts</h2>
                  <Link to="/add-post" className="user-home-page-btn user-home-page-btn-primary">
                    <span>+</span> New Post
                  </Link>
                </div>
                
                <div className="user-home-page-posts-list">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div className="user-home-page-full-post-card" key={post.id}>
                        <div className="user-home-page-post-header">
                          <div className="user-home-page-profile-pic">
                            <span className="user-home-page-person-icon">👤</span>
                          </div>
                          <div className="user-home-page-user-info">
                            <h4 className="user-home-page-username">{username}</h4>
                            <p className="user-home-page-time">{formatDate(post.createdAt)}</p>
                          </div>
                        </div>
                        
                        <h3 className="user-home-page-post-title">{post.title}</h3>
                        
                        <div className="user-home-page-post-content">
                          {post.content.length > 250 
                            ? `${post.content.substring(0, 250)}...` 
                            : post.content}
                        </div>
                        
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="user-home-page-media-gallery">
                            {post.mediaUrls.slice(0, 3).map((url, index) => (
                              <div key={index} className="user-home-page-media-item">
                                {renderMedia(url)}
                              </div>
                            ))}
                            {post.mediaUrls.length > 3 && (
                              <div className="user-home-page-media-more">
                                +{post.mediaUrls.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="user-home-page-post-tags">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="user-home-page-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        
                        <div className="user-home-page-post-footer">
                          <div className="user-home-page-post-stats">
                            <div className="user-home-page-likes-count">
                              <span className="user-home-page-like-icon">👍</span>
                              <span>{post.likes ? post.likes.length : 0} likes</span>
                            </div>
                          </div>
                          
                          <div className="user-home-page-post-actions">
                            <button 
                              className={`user-home-page-action-btn ${isPostLiked(post) ? 'user-home-page-liked' : ''}`}
                              onClick={() => handleLike(post.id)}
                            >
                              <span className="user-home-page-thumb-icon">👍</span>
                              Like
                            </button>
                            
                            <Link to={`/view-post/${post.id}`} className="user-home-page-action-btn">
                              <span className="user-home-page-view-icon">👁️</span>
                              View
                            </Link>
                            
                            <Link to={`/edit-post/${post.id}`} className="user-home-page-action-btn">
                              <span className="user-home-page-edit-icon">✏️</span>
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="user-home-page-empty-state">
                      <p>No skill posts available yet.</p>
                      <Link to="/add-post" className="user-home-page-btn user-home-page-btn-primary">
                        Share Your First Skill
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="user-home-page-call-to-action">
          <div className="user-home-page-cta-content">
            <h2>Ready to take your skills to the next level?</h2>
            <p>Create a structured learning plan or share your knowledge with others.</p>
            <div className="user-home-page-cta-buttons">
              <Link to="/add-learning-plan" className="user-home-page-btn user-home-page-btn-primary">Create Learning Plan</Link>
              <Link to="/add-post" className="user-home-page-btn user-home-page-btn-secondary">Share Your Skills</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}