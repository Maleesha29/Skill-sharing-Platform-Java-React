import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../../css/EditLearningPlan.css';
import NavBar from '../../components/NavBar';

export default function EditLearningPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [learningPlan, setLearningPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    topics: [],
    resources: [],
    progressPercentage: 0,
    status: 'NOT_STARTED',
    userId: 1  // Assuming a default user ID for simplicity
  });
  
  // For handling topics and resources
  const [newTopic, setNewTopic] = useState('');
  const [newResource, setNewResource] = useState('');

  useEffect(() => {
    loadLearningPlan();
  }, []);

  const loadLearningPlan = async () => {
    try {
      const result = await axios.get(`http://localhost:8080/api/learning-plan/${id}`);
      const plan = result.data;
      
      // Format dates for the input fields
      plan.startDate = formatDateForInput(plan.startDate);
      plan.endDate = formatDateForInput(plan.endDate);
      
      setLearningPlan(plan);
    } catch (error) {
      console.error("Error loading learning plan:", error);
      setError("Failed to load learning plan. It may not exist or has been deleted.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLearningPlan({ ...learningPlan, [name]: value });
  };

  const addTopic = () => {
    if (newTopic.trim() !== '') {
      setLearningPlan({
        ...learningPlan,
        topics: [...learningPlan.topics, newTopic.trim()]
      });
      setNewTopic('');
    }
  };

  const removeTopic = (index) => {
    const updatedTopics = [...learningPlan.topics];
    updatedTopics.splice(index, 1);
    setLearningPlan({ ...learningPlan, topics: updatedTopics });
  };

  const addResource = () => {
    if (newResource.trim() !== '') {
      setLearningPlan({
        ...learningPlan,
        resources: [...learningPlan.resources, newResource.trim()]
      });
      setNewResource('');
    }
  };

  const removeResource = (index) => {
    const updatedResources = [...learningPlan.resources];
    updatedResources.splice(index, 1);
    setLearningPlan({ ...learningPlan, resources: updatedResources });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/learning-plan/${id}`, learningPlan);
      navigate(`/view-learning-plan/${id}`);
    } catch (error) {
      console.error("Error updating learning plan:", error);
      setError("Failed to update learning plan. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="Edit-Learning-Plan-loading">
        <div className="spinner-border Edit-Learning-Plan-spinner" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Edit-Learning-Plan-container">
        <div className="container">
          <div className="row">
            <div className="col-md-8 offset-md-2">
              <div className="Edit-Learning-Plan-error">{error}</div>
              <Link to="/" className="Edit-Learning-Plan-btn-primary btn">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'NOT_STARTED': return 'Not Started';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="Edit-Learning-Plan-container">
      <div className="container">
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div className="Edit-Learning-Plan-card card">
              <div className="Edit-Learning-Plan-card-header">
                <h3 className="Edit-Learning-Plan-title">Edit Learning Plan</h3>
              </div>
              <div className="Edit-Learning-Plan-card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="title" className="Edit-Learning-Plan-form-label">Title</label>
                    <input
                      type="text"
                      className="Edit-Learning-Plan-form-control form-control"
                      id="title"
                      name="title"
                      value={learningPlan.title}
                      onChange={handleInputChange}
                      placeholder="Give your learning plan a clear title"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="Edit-Learning-Plan-form-label">Description</label>
                    <textarea
                      className="Edit-Learning-Plan-form-control Edit-Learning-Plan-text-area form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={learningPlan.description}
                      onChange={handleInputChange}
                      placeholder="Describe what you want to learn and why"
                    ></textarea>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label htmlFor="startDate" className="Edit-Learning-Plan-form-label">Start Date</label>
                      <input
                        type="datetime-local"
                        className="Edit-Learning-Plan-form-control form-control"
                        id="startDate"
                        name="startDate"
                        value={learningPlan.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="endDate" className="Edit-Learning-Plan-form-label">End Date</label>
                      <input
                        type="datetime-local"
                        className="Edit-Learning-Plan-form-control form-control"
                        id="endDate"
                        name="endDate"
                        value={learningPlan.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="status" className="Edit-Learning-Plan-form-label">Status</label>
                    <select
                      className="Edit-Learning-Plan-form-control form-select"
                      id="status"
                      name="status"
                      value={learningPlan.status}
                      onChange={handleInputChange}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="Edit-Learning-Plan-progress-container">
                    <div className="Edit-Learning-Plan-progress-label">
                      <label htmlFor="progressPercentage" className="Edit-Learning-Plan-form-label">
                        Progress
                      </label>
                      <span>{learningPlan.progressPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      className="Edit-Learning-Plan-range form-range"
                      id="progressPercentage"
                      name="progressPercentage"
                      min="0"
                      max="100"
                      value={learningPlan.progressPercentage}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="Edit-Learning-Plan-form-label">Topics</label>
                    <div className="Edit-Learning-Plan-input-group input-group">
                      <input
                        type="text"
                        className="Edit-Learning-Plan-form-control form-control"
                        placeholder="Add a learning topic"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                      />
                      <button 
                        type="button" 
                        className="Edit-Learning-Plan-btn-accent btn" 
                        onClick={addTopic}
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-3">
                      {learningPlan.topics.map((topic, index) => (
                        <span key={index} className="Edit-Learning-Plan-topic-badge">
                          {topic}
                          <button 
                            type="button" 
                            className="Edit-Learning-Plan-topic-remove" 
                            aria-label="Remove topic"
                            onClick={() => removeTopic(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="Edit-Learning-Plan-form-label">Resources</label>
                    <div className="Edit-Learning-Plan-input-group input-group">
                      <input
                        type="text"
                        className="Edit-Learning-Plan-form-control form-control"
                        placeholder="Add a resource (URL, book title, course name, etc.)"
                        value={newResource}
                        onChange={(e) => setNewResource(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                      />
                      <button 
                        type="button" 
                        className="Edit-Learning-Plan-btn-accent btn" 
                        onClick={addResource}
                      >
                        Add
                      </button>
                    </div>
                    
                    {learningPlan.resources.length > 0 && (
                      <ul className="Edit-Learning-Plan-resource-list list-group mt-3">
                        {learningPlan.resources.map((resource, index) => (
                          <li key={index} className="Edit-Learning-Plan-resource-item list-group-item d-flex justify-content-between align-items-center">
                            {resource}
                            <button 
                              type="button" 
                              className="Edit-Learning-Plan-resource-remove btn-close" 
                              aria-label="Remove resource"
                              onClick={() => removeResource(index)}
                            ></button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="Edit-Learning-Plan-footer">
                    <Link to={`/view-learning-plan/${id}`} className="Edit-Learning-Plan-btn-secondary btn">
                      Cancel
                    </Link>
                    <button type="submit" className="Edit-Learning-Plan-btn-primary btn">
                      Update Learning Plan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}