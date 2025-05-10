import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../css/ViewPost.css';
import Comments from '../comment/Comments'; 

export default function ViewPost() {
    const [post, setPost] = useState({
        title: '',
        content: '',
        tags: [],
        likes: [],
        mediaUrls: [],
        createdAt: new Date().toISOString() 
    });
    const [showComments, setShowComments] = useState(false); 
    const [commentCount, setCommentCount] = useState(0); 

    const { id } = useParams();

    
    const userId = 1;
    const username = "John Doe"; 

    useEffect(() => {
        loadPost();
        loadCommentCount(); 
    }, []);

    const loadPost = async () => {
        try {
            const result = await axios.get(`http://localhost:8080/api/posts/${id}`);
            setPost(result.data);
        } catch (error) {
            console.error("Error loading post:", error);
        }
    };

    
    const loadCommentCount = async () => {
        try {
            const commentsResult = await axios.get(`http://localhost:8080/api/posts/${id}/comments`);
            const count = Array.isArray(commentsResult.data) ? 
                        commentsResult.data.length : 
                        (commentsResult.data && commentsResult.data.content ? 
                        commentsResult.data.content.length : 0);
            setCommentCount(count);
        } catch (error) {
            console.error("Error fetching comment count:", error);
            setCommentCount(0);
        }
    };

    const handleLike = async () => {
        const isLiked = post.likes.includes(userId);

        try {
            if (isLiked) {
                await axios.put(`http://localhost:8080/api/posts/${id}/unlike/${userId}`);
            } else {
                await axios.put(`http://localhost:8080/api/posts/${id}/like/${userId}`);
            }
            loadPost();  
        } catch (error) {
            console.error("Error updating like status:", error);
        }
    };

    
    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    const renderMedia = (url) => {
        const isImage = /\.(jpeg|jpg|gif|png)$/i.test(url);
        const isVideo = /\.(mp4|webm|ogg)$/i.test(url);

        if (isImage) {
            return (
                <img 
                    src={url} 
                    alt="Post media" 
                    className="media-item"
                />
            );
        } else if (isVideo) {
            return (
                <video 
                    src={url} 
                    controls 
                    className="media-item"
                />
            );
        } else {
            return (
                <div className="file-attachment">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <span className="file-icon"></span>
                        <span>View Attachment</span>
                    </a>
                </div>
            );
        }
    };

    const getMediaClass = () => {
        if (!post.mediaUrls || post.mediaUrls.length === 0) return '';
        if (post.mediaUrls.length === 1) return 'single-item';
        if (post.mediaUrls.length === 2) return 'double-item';
        return 'triple-item';
    };

    const isLiked = post.likes && post.likes.includes(userId);

    return (
        <div className="viewpost-container">
            <div className="viewpost-wrapper">
                
                <div className="viewpost-header">
                    <div className="viewpost-profile-pic">
                        <span className="person-icon"></span>
                    </div>
                    <div className="viewpost-user-info">
                        <h4 className="viewpost-username">{username}</h4>
                        <p className="viewpost-time">{formatDate(post.createdAt)}</p>
                    </div>
                </div>

                
                <h3 className="viewpost-title">{post.title}</h3>
                
                <div className="viewpost-content">
                    <p>{post.content}</p>
                </div>

               
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className={`viewpost-media ${getMediaClass()}`}>
                        {post.mediaUrls.map((url, index) => (
                            <div key={index} className="media-container">
                                {renderMedia(url)}
                            </div>
                        ))}
                    </div>
                )}

            
                {post.tags && post.tags.length > 0 && (
                    <div className="viewpost-tags">
                        <h5>Tags</h5>
                        <div>
                            {post.tags.map((tag, index) => (
                                <span key={index} className="tag-badge">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}

                
                <div className="viewpost-stats">
                    <div className="viewpost-likes">
                        <span className="like-icon">👍</span>
                        <span>{post.likes ? post.likes.length : 0}</span>
                    </div>
                    <div className="viewpost-comments-count" onClick={toggleComments}>
                        <span className="comment-icon">💬</span>
                        <span>{commentCount} Comments</span>
                    </div>
                </div>

                
                <div className="viewpost-actions">
                    <button
                        className={`viewpost-action-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        <span className="custom-icon thumb-icon"></span>
                        Like
                    </button>
                    
                    <button 
                        className="viewpost-action-btn"
                        onClick={toggleComments}
                    >
                        <span className="custom-icon comment-icon"></span>
                        Comment
                    </button>
                    
                    <button className="viewpost-action-btn">
                        <span className="custom-icon share-icon"></span>
                        Share
                    </button>
                </div>

              
                {showComments && (
                    <div className="viewpost-comments-section">
                        <Comments 
                            postId={id}
                            userId={userId}
                            showLikedIndicator={true}
                            onCommentAdded={loadCommentCount} 
                        />
                    </div>
                )}

                
                <div className="viewpost-controls">
                    <Link to={`/edit-post/${post.id}`} className="viewpost-control-btn viewpost-edit-btn">
                        Edit
                    </Link>
                    <Link to="/posts" className="viewpost-control-btn viewpost-back-btn">
                        Back
                    </Link>
                </div>
            </div>
        </div>
        
    );
}