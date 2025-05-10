import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../css/PostList.css';
import Comments from '../comment/Comments'; 
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer'; 

export default function PostsList() {
    const [posts, setPosts] = useState([]);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(1); 
    const [commentCounts, setCommentCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        loadPosts();
    }, []);
    
    const loadPosts = async () => {
        try {
            setLoading(true);
            console.log("Fetching posts...");
            const result = await axios.get('http://localhost:8080/api/posts');
            console.log("Posts fetched:", result.data);
            setPosts(result.data);
            
            const counts = {};
            for (const post of result.data) {
                const commentsResult = await axios.get(`http://localhost:8080/api/posts/${post.id}/comments`);
                counts[post.id] = commentsResult.data.length;
            }
            setCommentCounts(counts);
            setLoading(false);
        } catch (error) {
            console.error("Error loading posts:", error);
            setError(`Failed to load posts: ${error.message}`);
            setLoading(false);
        }
    };
    
    const deletePost = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/posts/${id}`);
            loadPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post");
        }
    };

    const toggleComments = (postId) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
        } else {
            setActiveCommentPostId(postId);
        }
    };

    const getInitial = (username) => {
        return username ? username.charAt(0).toUpperCase() : "U";
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Just now";
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    const handleLikePost = async (postId) => {
        try {
            const post = posts.find(p => p.id === postId);
            if (post && post.likes && post.likes.includes(currentUserId)) {
                await axios.put(`http://localhost:8080/api/posts/${postId}/unlike/${currentUserId}`);
            } else {
                await axios.put(`http://localhost:8080/api/posts/${postId}/like/${currentUserId}`);
            }
            loadPosts();
        } catch (error) {
            console.error("Error handling post like:", error);
            alert("Failed to update like status");
        }
    };

    const hasUserLikedPost = (post) => {
        return post.likes && post.likes.includes(currentUserId);
    };

    const getMediaGridClass = (mediaUrls) => {
        if (!mediaUrls || mediaUrls.length === 0) return '';
        
        if (mediaUrls.length === 1) return 'single-photo';
        if (mediaUrls.length === 2) return 'two-photos';
        if (mediaUrls.length === 3) return 'three-photos';
        if (mediaUrls.length === 4) return 'four-photos';
        return 'many-photos';
    };

    return (
        <>
            <NavBar />
            <div className="postlist-container">
                <div className="posts-wrapper">
                    <div className="postlist-header">
                        <h2 className="postlist-title">Find Skills</h2>
                        <Link to="/add-post" className="postlist-add-btn">Create Post</Link>
                    </div>
                    
                    <div className="create-post">
                        <div className="create-post-header">
                            <div className="post-avatar">
                                <span>U</span>
                            </div>
                            <Link to="/add-post" className="create-input">
                                Share your skills...
                            </Link>
                        </div>
                    </div>
                
                    {loading ? (
                        <div className="postlist-loading">Loading posts...</div>
                    ) : error ? (
                        <div className="postlist-error">{error}</div>
                    ) : posts.length === 0 ? (
                        <div className="postlist-empty">
                            <div className="postlist-empty-icon">
                                <i className="bi bi-journal-text"></i>
                            </div>
                            <p>No posts available. Create your first post!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <div className="post-avatar">
                                        <span>{getInitial(post.username)}</span>
                                    </div>
                                    <div className="post-author">
                                        <p className="post-author-name">
                                            {post.username || `User ${post.userId}`}
                                        </p>
                                        <p className="post-timestamp">{formatDate(post.createdAt)}</p>
                                    </div>
                                </div>
                                
                                <div className="post-content">
                                    <h3 className="post-title">{post.title}</h3>
                                    <p>{post.content?.length > 250 
                                        ? post.content.substring(0, 250) + '...' 
                                        : post.content}
                                    </p>
                                  
                                    
                                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                                        <div className={`post-media ${getMediaGridClass(post.mediaUrls)}`}>
                                            {post.mediaUrls.length === 3 ? (
                                                <>
                                                    {post.mediaUrls.map((url, index) => (
                                                        <img 
                                                            key={index}
                                                            src={url} 
                                                            alt={`Post media ${index + 1}`} 
                                                            className="post-media-item" 
                                                        />
                                                    ))}
                                                </>
                                            ) : (
                                                post.mediaUrls.slice(0, 4).map((url, index) => (
                                                    <div key={index} className={post.mediaUrls.length > 4 && index === 3 ? "photo-counter-container" : ""}>
                                                        <img 
                                                            src={url} 
                                                            alt={`Post media ${index + 1}`} 
                                                            className="post-media-item" 
                                                        />
                                                        {post.mediaUrls.length > 4 && index === 3 && (
                                                            <div className="photo-counter">
                                                                +{post.mediaUrls.length - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="post-engagement">
                                    <div className={`post-likes ${hasUserLikedPost(post) ? 'you-liked' : ''}`}>
                                        <span className="likes-icon">
                                            <i className={`bi ${hasUserLikedPost(post) ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
                                        </span>
                                        <span>
                                            {post.likes?.length || 0} 
                                            {hasUserLikedPost(post) && post.likes?.length > 0 && (
                                                <span className="liked-indicator"> • You liked this</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="post-comments-count" onClick={() => toggleComments(post.id)}>
                                        {commentCounts[post.id] || 0} Comments
                                    </div>
                                </div>
                                
                                <div className="post-actions">
                                    <button 
                                        className={`post-action-btn ${hasUserLikedPost(post) ? 'liked' : ''}`}
                                        onClick={() => handleLikePost(post.id)}
                                    >
                                        <i className={`bi ${hasUserLikedPost(post) ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i> 
                                        {hasUserLikedPost(post) ? 'Liked' : 'Like'}
                                    </button>
                                    <button className="post-action-btn" onClick={() => toggleComments(post.id)}>
                                        <i className="bi bi-chat"></i> Comment
                                    </button>
                                    <button className="post-action-btn">
                                        <i className="bi bi-share"></i> Share
                                    </button>
                                </div>
                                
                                
                                {activeCommentPostId === post.id && (
                                    <div className="post-comments-section">
                                        <Comments 
                                            postId={post.id} 
                                            userId={currentUserId} 
                                            showLikedIndicator={true} 
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <Footer /> 
        </>
    );
}
