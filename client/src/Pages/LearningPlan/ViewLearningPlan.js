import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../../css/ViewLearningPlan.css';
import NavBar from '../../components/NavBar';

export default function ViewLearningPlan() {
  const [learningPlan, setLearningPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    loadLearningPlan();
  }, []);

  const loadLearningPlan = async () => {
    try {
      const result = await axios.get(`http://localhost:8080/api/learning-plan/${id}`);
      setLearningPlan(result.data);
    } catch (error) {
      console.error("Error loading learning plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'NOT_STARTED': 
        return "view-learning-plan-badge view-learning-plan-badge-secondary";
      case 'IN_PROGRESS': 
        return "view-learning-plan-badge view-learning-plan-badge-primary";
      case 'COMPLETED': 
        return "view-learning-plan-badge view-learning-plan-badge-success";
      default: 
        return "view-learning-plan-badge view-learning-plan-badge-light";
    }
  };

  if (loading) {
    return (
      <div className="view-learning-plan-loading-container">
        <div className="view-learning-plan-spinner"></div>
        <span>Loading learning plan details...</span>
      </div>
    );
  }

  if (!learningPlan) {
    return (
      <div className="view-learning-plan-container">
        <div className="view-learning-plan-error-card">
          <div className="view-learning-plan-error-icon">⚠️</div>
          <h3>Learning Plan Not Found</h3>
          <p>This learning plan may have been deleted or doesn't exist.</p>
          <Link to="/" className="view-learning-plan-btn view-learning-plan-btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <NavBar/>
    <div className="view-learning-plan-container">
      <div className="view-learning-plan-card">
        <div className="view-learning-plan-header">
          <h2 className="view-learning-plan-title">{learningPlan.title}</h2>
          <span className={getStatusBadgeClass(learningPlan.status)}>
            {learningPlan.status.replace('_', ' ')}
          </span>
        </div>
        
        <div className="view-learning-plan-content">
          <div className="view-learning-plan-section">
            <h3 className="view-learning-plan-section-title">Description</h3>
            <p className="view-learning-plan-description">{learningPlan.description}</p>
          </div>

          <div className="view-learning-plan-two-columns">
            <div className="view-learning-plan-column">
              <h3 className="view-learning-plan-section-title">Timeline</h3>
              <div className="view-learning-plan-timeline">
                <div className="view-learning-plan-date-item">
                  <span className="view-learning-plan-date-label">Start Date</span>
                  <span className="view-learning-plan-date-value">
                    {format(new Date(learningPlan.startDate), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="view-learning-plan-date-item">
                  <span className="view-learning-plan-date-label">End Date</span>
                  <span className="view-learning-plan-date-value">
                    {format(new Date(learningPlan.endDate), 'MMMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="view-learning-plan-column">
              <h3 className="view-learning-plan-section-title">Progress</h3>
              <div className="view-learning-plan-progress-container">
                <div className="view-learning-plan-progress-info">
                  <span className="view-learning-plan-progress-label">Completion</span>
                  <span className="view-learning-plan-progress-percentage">{learningPlan.progressPercentage}%</span>
                </div>
                <div className="view-learning-plan-progress-bar">
                  <div 
                    className="view-learning-plan-progress-fill" 
                    style={{ width: `${learningPlan.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {learningPlan.topics && learningPlan.topics.length > 0 && (
            <div className="view-learning-plan-section">
              <h3 className="view-learning-plan-section-title">Topics</h3>
              <div className="view-learning-plan-topics">
                {learningPlan.topics.map((topic, index) => (
                  <span key={index} className="view-learning-plan-topic-tag">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {learningPlan.resources && learningPlan.resources.length > 0 && (
            <div className="view-learning-plan-section">
              <h3 className="view-learning-plan-section-title">Resources</h3>
              <ul className="view-learning-plan-resources-list">
                {learningPlan.resources.map((resource, index) => (
                  <li key={index} className="view-learning-plan-resource-item">
                    {resource.startsWith('http') ? (
                      <a 
                        href={resource} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-learning-plan-resource-link"
                      >
                        {resource}
                      </a>
                    ) : (
                      resource
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="view-learning-plan-metadata">
            <div className="view-learning-plan-timestamp">
              <span className="view-learning-plan-timestamp-label">Created:</span> 
              {format(new Date(learningPlan.createdAt), 'MMMM d, yyyy h:mm a')}
            </div>
            <div className="view-learning-plan-timestamp">
              <span className="view-learning-plan-timestamp-label">Last Updated:</span> 
              {format(new Date(learningPlan.updatedAt), 'MMMM d, yyyy h:mm a')}
            </div>
          </div>
        </div>
        
        <div className="view-learning-plan-footer">
          <Link to="/" className="view-learning-plan-btn view-learning-plan-btn-outline">
            Back to Home
          </Link>
          <Link 
            to={`/edit-learning-plan/${learningPlan.id}`} 
            className="view-learning-plan-btn view-learning-plan-btn-accent"
          >
            Edit Plan
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}