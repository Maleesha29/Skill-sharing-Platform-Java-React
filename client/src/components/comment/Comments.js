import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/Comments.css';

export default function Comments({ postId, userId }) {
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState({});
    const [newComment, setNewComment] = useState('');
    const [replyContents, setReplyContents] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [loading, setLoading] = useState(true);
    // Add state for editing comments
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        if (postId) {
            loadComments();
        }
    }, [postId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            // Get top-level comments for the post
            const result = await axios.get(`http://localhost:8080/api/posts/${postId}/top-comments`);
            setComments(result.data);

            // Load replies for each comment
            const repliesMap = {};
            for (const comment of result.data) {
                const repliesResult = await axios.get(`http://localhost:8080/api/comments/${comment.id}/replies`);
                console.log("Replies for comment", comment.id, ":", repliesResult.data);
                repliesMap[comment.id] = repliesResult.data;
            }
            setReplies(repliesMap);
            setLoading(false);
        } catch (error) {
            console.error("Error loading comments:", error);
            setLoading(false);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const comment = {
                content: newComment,
                userId: userId,
                postId: postId
            };

            await axios.post(`http://localhost:8080/api/posts/${postId}/comments`, comment);
            setNewComment('');
            loadComments();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleReplySubmit = async (e, commentId) => {
        e.preventDefault();
        const replyContent = replyContents[commentId];
        if (!replyContent || !replyContent.trim()) return;

        try {
            const reply = {
                content: replyContent,
                userId: userId,
                postId: postId,
                parentCommentId: commentId
            };

            await axios.post(`http://localhost:8080/api/comments/${commentId}/replies`, reply);
            setReplyContents({ ...replyContents, [commentId]: '' });
            setActiveReplyId(null);
            loadComments();
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    // New function to handle comment editing
    const handleEditSubmit = async (e, commentId) => {
        e.preventDefault();
        if (!editContent.trim()) return;

        try {
            // Use the edit endpoint with user verification
            await axios.put(
                `http://localhost:8080/api/comments/${commentId}/edit?userId=${userId}`,
                { content: editContent }
            );
            setEditingCommentId(null);
            setEditContent('');
            loadComments();
        } catch (error) {
            console.error("Error editing comment:", error);
            if (error.response && error.response.status === 403) {
                alert("You don't have permission to edit this comment");
            }
        }
    };

    const toggleReplyForm = (commentId) => {
        setActiveReplyId(activeReplyId === commentId ? null : commentId);
    };

    // New function to start editing a comment
    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
        setActiveReplyId(null); // Close any open reply forms
    };

    // Function to cancel editing
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditContent('');
    };

    const handleLikeComment = async (commentId) => {
        try {
            await axios.put(`http://localhost:8080/api/comments/${commentId}/like/${userId}`);
            loadComments();
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    const handleUnlikeComment = async (commentId) => {
        try {
            await axios.put(`http://localhost:8080/api/comments/${commentId}/unlike/${userId}`);
            loadComments();
        } catch (error) {
            console.error("Error unliking comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                await axios.delete(`http://localhost:8080/api/comments/${commentId}`);
                loadComments();
            } catch (error) {
                console.error("Error deleting comment:", error);
            }
        }
    };

    // Formatted timestamp
    const formatDate = (timestamp) => {
        if (!timestamp) return "Just now";
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get user initial for avatar
    const getUserInitial = (userId) => {
        return `U${userId}`.charAt(0);
    };

    // Check if the current user has liked a comment
    const hasUserLiked = (likes) => {
        return likes && likes.includes(userId);
    };

    return (
        <div className="comments-container">
            {/* New comment form */}
            <form className="comment-form" onSubmit={handleCommentSubmit}>
                <div className="comment-input-wrapper">
                    <div className="comment-avatar">
                        <span>{getUserInitial(userId)}</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="comment-input"
                    />
                </div>
                <button type="submit" className="comment-submit-btn">Comment</button>
            </form>

            {/* Comments list */}
            {loading ? (
                <div className="comments-loading">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="no-comments">No comments yet. Be the first to comment!</div>
            ) : (
                <div className="comments-list">
                    {comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                                <div className="comment-avatar">
                                    <span>{getUserInitial(comment.userId)}</span>
                                </div>
                                <div className="comment-user-info">
                                    <div className="comment-username">User {comment.userId}</div>
                                    <div className="comment-timestamp">{formatDate(comment.createdAt)}</div>
                                </div>
                            </div>

                            {/* Show edit form if this comment is being edited, otherwise show content */}
                            {editingCommentId === comment.id ? (
                                <form className="edit-comment-form" onSubmit={(e) => handleEditSubmit(e, comment.id)}>
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="edit-comment-input"
                                        autoFocus
                                    />
                                    <div className="edit-buttons">
                                        <button type="button" className="edit-cancel-btn" onClick={cancelEditing}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="edit-save-btn">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="comment-content">{comment.content}</div>
                            )}

                            {/* Only show actions if not currently editing */}
                            {editingCommentId !== comment.id && (
                                <div className="comment-actions">
                                    <button
                                        className={`comment-like-btn ${hasUserLiked(comment.likes) ? 'liked' : ''}`}
                                        onClick={() => hasUserLiked(comment.likes)
                                            ? handleUnlikeComment(comment.id)
                                            : handleLikeComment(comment.id)
                                        }
                                    >
                                        <i className={`bi ${hasUserLiked(comment.likes) ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
                                        {comment.likes?.length || 0} Like
                                    </button>

                                    <button
                                        className="comment-reply-btn"
                                        onClick={() => toggleReplyForm(comment.id)}
                                    >
                                        <i className="bi bi-reply"></i> Reply
                                    </button>

                                    {comment.userId === userId && (
                                        <>
                                            <button
                                                className="comment-edit-btn"
                                                onClick={() => startEditing(comment)}
                                            >
                                                <i className="bi bi-pencil"></i> Edit
                                            </button>

                                            <button
                                                className="comment-delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                <i className="bi bi-trash"></i> Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Reply form */}
                            {activeReplyId === comment.id && (
                                <form className="reply-form" onSubmit={(e) => handleReplySubmit(e, comment.id)}>
                                    <div className="reply-input-wrapper">
                                        <div className="reply-avatar">
                                            <span>{getUserInitial(userId)}</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Write a reply..."
                                            value={replyContents[comment.id] || ''}
                                            onChange={(e) => setReplyContents({
                                                ...replyContents,
                                                [comment.id]: e.target.value
                                            })}
                                            className="reply-input"
                                        />
                                    </div>
                                    <div className="reply-buttons">
                                        <button type="button" className="reply-cancel-btn" onClick={() => toggleReplyForm(comment.id)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="reply-submit-btn">Reply</button>
                                    </div>
                                </form>
                            )}

                            {/* Replies list */}
                            {Array.isArray(replies[comment.id]) && replies[comment.id].length > 0 && (
                                <div className="replies-list">
                                    {replies[comment.id].map((reply) => (
                                        <div key={reply.id} className="reply-item">
                                            <div className="reply-header">
                                                <div className="reply-avatar">
                                                    <span>{getUserInitial(reply.userId)}</span>
                                                </div>
                                                <div className="reply-user-info">
                                                    <div className="reply-username">User {reply.userId}</div>
                                                    <div className="reply-timestamp">{formatDate(reply.createdAt)}</div>
                                                </div>
                                            </div>

                                            {/* Show edit form for replies too */}
                                            {editingCommentId === reply.id ? (
                                                <form className="edit-reply-form" onSubmit={(e) => handleEditSubmit(e, reply.id)}>
                                                    <input
                                                        type="text"
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="edit-reply-input"
                                                        autoFocus
                                                    />
                                                    <div className="edit-buttons">
                                                        <button type="button" className="edit-cancel-btn" onClick={cancelEditing}>
                                                            Cancel
                                                        </button>
                                                        <button type="submit" className="edit-save-btn">Save</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="reply-content">{reply.content}</div>
                                            )}

                                            {/* Only show actions if not currently editing */}
                                            {editingCommentId !== reply.id && (
                                                <div className="reply-actions">
                                                    <button
                                                        className={`reply-like-btn ${hasUserLiked(reply.likes) ? 'liked' : ''}`}
                                                        onClick={() => hasUserLiked(reply.likes)
                                                            ? handleUnlikeComment(reply.id)
                                                            : handleLikeComment(reply.id)
                                                        }
                                                    >
                                                        <i className={`bi ${hasUserLiked(reply.likes) ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
                                                        {reply.likes?.length || 0} Like
                                                    </button>

                                                    {reply.userId === userId && (
                                                        <>
                                                            <button
                                                                className="reply-edit-btn"
                                                                onClick={() => startEditing(reply)}
                                                            >
                                                                <i className="bi bi-pencil"></i> Edit
                                                            </button>

                                                            <button
                                                                className="reply-delete-btn"
                                                                onClick={() => handleDeleteComment(reply.id)}
                                                            >
                                                                <i className="bi bi-trash"></i> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}