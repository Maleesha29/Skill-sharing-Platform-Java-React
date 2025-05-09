
import React, { useState,userEffect } from 'react';
import '../../css/AddLearningPlan.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../components/NavBar';

export default function AddLearningPlan() {
  const navigate = useNavigate();
  
  const [learningPlan, setLearningPlan] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    topics: [],
    resources: [],
    progressPercentage: 0,
    status: 'NOT_STARTED',
    userId: 1 
  });
  
  const [newTopic, setNewTopic] = useState('');
  const [newResource, setNewResource] = useState('');
  const [error, setError] = useState(null);

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
      const response = await axios.post("http://localhost:8080/api/learning-plan", learningPlan);
      navigate('/');
    } catch (error) {
      console.error("Error creating learning plan:", error);
      setError("Failed to create learning plan. Please try again.");
    }
  };

  return (
    <>
    <NavBar/>
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-header">
              <h3>Create Learning Plan</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={learningPlan.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={learningPlan.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="startDate" className="form-label">Start Date</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="startDate"
                      name="startDate"
                      value={learningPlan.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="endDate" className="form-label">End Date</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="endDate"
                      name="endDate"
                      value={learningPlan.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Topics</label>
                  <div className="input-group mb-2">
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Add a topic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={addTopic}
                    >
                      Add
                    </button>
                  </div>
                  <div>
                    {learningPlan.topics.map((topic, index) => (
                      <span key={index} className="badge bg-light text-dark me-2 mb-2">
                        {topic}
                        <button 
                          type="button" 
                          className="btn-close ms-1" 
                          aria-label="Remove topic"
                          style={{ fontSize: '0.5rem' }}
                          onClick={() => removeTopic(index)}
                        ></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Resources</label>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add a resource (URL or text)"
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={addResource}
                    >
                      Add
                    </button>
                  </div>
                  <ul className="list-group">
                    {learningPlan.resources.map((resource, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {resource}
                        <button 
                          type="button" 
                          className="btn-close" 
                          aria-label="Remove resource"
                          onClick={() => removeResource(index)}
                        ></button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Link to="/" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    Create Learning Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}