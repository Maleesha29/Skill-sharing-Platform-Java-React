// src/components/Post/AddPost.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/AddPost.css';
import NavBar from '../../components/NavBar';

import Footer from '../../components/Footer'; 

export default function AddPost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [username, setUsername] = useState('');
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const userId = 1; 

    
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles.length > 3) {
            setError('Maximum 3 files allowed');
            return;
        }

        
        const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
        for (let file of selectedFiles) {
            if (!validTypes.includes(file.type)) {
                setError('Invalid file type. Only JPG, PNG, and MP4 are allowed.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB size limit
                setError('Each file must be less than 10MB.');
                return;
            }
        }

        setFiles(selectedFiles);
        setError('');
    };

    
    const uploadFiles = async () => {
        if (files.length === 0) return [];

        try {
            setUploading(true);
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await axios.post('http://localhost:8080/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploading(false);
            return response.data;
        } catch (error) {
            setUploading(false);
            setError('Error uploading files');
            console.error('Upload error:', error);
            return [];
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (files.length > 3) {
            setError('Maximum 3 files allowed');
            return;
        }

        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        const uploadedUrls = files.length > 0 ? await uploadFiles() : [];

        if (error) return;

        const newPost = {
            title,
            content,
            tags: tags.split(',').map(tag => tag.trim()),
            mediaUrls: uploadedUrls,
            userId,
            username
        };

        try {
            await axios.post('http://localhost:8080/api/posts', newPost);
            navigate('/PostsListrandomuser');
        } catch (error) {
            setError('Error creating post');
            console.error('Post creation error:', error);
        }
    };

   
    const renderPreview = () => {
        if (files.length === 0) return null;

        return (
            
            <div className="add-post-preview">
                <h5>Preview:</h5>
                <div className="add-post-preview-images">
                    {files.map((file, index) => (
                        <div key={index}>
                            {file.type.startsWith('image/') ? (
                                <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={`Preview ${index}`} 
                                    className="add-post-preview-image" 
                                />
                            ) : file.type.startsWith('video/') ? (
                                <video 
                                    src={URL.createObjectURL(file)}
                                    controls
                                    className="add-post-preview-video"
                                />
                            ) : (
                                <div className="p-3 border rounded">
                                    <i className="bi bi-file-earmark"></i> {file.name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <NavBar />
            <div className="add-post-container">
                <div className="add-post-card">
                    <h2 className="add-post-title">Create Post</h2>

                    {error && (
                        <div className="add-post-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="add-post-form-label">Username</label>
                            <input
                                type="text"
                                className="add-post-form-input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="add-post-form-label">Title</label>
                            <input
                                type="text"
                                className="add-post-form-input"
                                placeholder="Enter post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="add-post-form-label">Content</label>
                            <textarea
                                className="add-post-form-textarea"
                                placeholder="Enter your post content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows="5"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="add-post-form-label">Tags (comma separated)</label>
                            <input
                                type="text"
                                className="add-post-form-input"
                                placeholder="Enter tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="add-post-form-label">Media (Max 3 files)</label>
                            <input
                                type="file"
                                className="add-post-form-file"
                                onChange={handleFileChange}
                                multiple
                                accept="image/*, video/*"
                            />
                            <small>You can upload up to 3 images or videos (Max 10MB each).</small>
                        </div>

                        {renderPreview()}

                        <div className="add-post-buttons">
                            <button 
                                type="submit" 
                                className="add-post-submit-btn"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Submit'}
                            </button>
                            <Link to="/PostsListrandomuser" className="add-post-cancel-btn">Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
              <Footer /> 
        </>
    );
}