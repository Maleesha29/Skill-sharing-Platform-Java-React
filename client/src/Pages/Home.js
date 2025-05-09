import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../css/HomePage.css';
import NavBar from '../components/NavBar';

export default function Home() {
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadLearningPlans();
  }, []);

  const loadLearningPlans = async () => {
    setLoading(true);
    try {
      const result = await axios.get("http://localhost:8080/api/learning-plans");
      setLearningPlans(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error loading learning plans:", error);
      setLearningPlans([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const deleteLearningPlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        await axios.delete(`http://localhost:8080/api/learning-plan/${id}`);
        loadLearningPlans(); 
      } catch (error) {
        console.error("Error deleting learning plan:", error);
      }
    }
  };

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

  const filteredPlans = Array.isArray(learningPlans) 
    ? learningPlans
        .filter(plan => plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(plan => filterStatus === 'ALL' ? true : plan.status === filterStatus)
    : [];

  return (
    <>
      <NavBar />
      <div className="user-home-page-hero">
        <div className="user-home-page-hero-content">
          <h1>Welcome to SkillTribe</h1>
          <p>Track your learning journey and achieve your goals</p>
        </div>
      </div>
      
      <div className="user-home-page-container">
        <div className="user-home-page-filters">
          <div className="user-home-page-search">
            <input 
              type="text" 
              placeholder="Search learning plans..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-home-page-search-input"
            />
            <span className="user-home-page-search-icon">🔍</span>
          </div>
          
          <div className="user-home-page-filter-status">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="user-home-page-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="user-home-page-header">
          <div className="user-home-page-title-section">
            <h2 className="user-home-page-title">My Learning Plans</h2>
            <p className="user-home-page-subtitle">Organize and track your educational journey</p>
          </div>
          <Link to="/add-learning-plan" className="user-home-page-btn user-home-page-btn-primary">
            <span className="user-home-page-btn-icon">+</span> Create New Plan
          </Link>
        </div>

        {loading ? (
          <div className="user-home-page-loading">
            <div className="user-home-page-spinner"></div>
            <span>Loading your learning journey...</span>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="user-home-page-empty-state">
            <div className="user-home-page-empty-icon">📚</div>
            <h3>No learning plans found</h3>
            <p>{searchTerm || filterStatus !== 'ALL' ? 
              "Try adjusting your search or filters" : 
              "Start your learning journey by creating your first plan!"}
            </p>
            {!searchTerm && filterStatus === 'ALL' && (
              <Link to="/add-learning-plan" className="user-home-page-btn user-home-page-btn-primary">
                Create Learning Plan
              </Link>
            )}
          </div>
        ) : (
          <div className="user-home-page-dashboard">
            <div className="user-home-page-stats">
              <div className="user-home-page-stat-card">
                <div className="user-home-page-stat-value">{learningPlans.length}</div>
                <div className="user-home-page-stat-label">Total Plans</div>
              </div>
              <div className="user-home-page-stat-card">
                <div className="user-home-page-stat-value">
                  {learningPlans.filter(plan => plan.status === 'IN_PROGRESS').length}
                </div>
                <div className="user-home-page-stat-label">In Progress</div>
              </div>
              <div className="user-home-page-stat-card">
                <div className="user-home-page-stat-value">
                  {learningPlans.filter(plan => plan.status === 'COMPLETED').length}
                </div>
                <div className="user-home-page-stat-label">Completed</div>
              </div>
            </div>
            
            <h3 className="user-home-page-section-title">Your Learning Plans</h3>
            
            <div className="user-home-page-grid">
              {filteredPlans.map((plan) => (
                <div className="user-home-page-card" key={plan.id}>
                  <div className="user-home-page-card-header">
                    <h3 className="user-home-page-card-title">{plan.title}</h3>
                    <span className={getStatusBadgeClass(plan.status)}>
                      {plan.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="user-home-page-card-dates">
                    <span className="user-home-page-date-icon">🗓️</span>
                    <span className="user-home-page-date-text">
                      {format(new Date(plan.startDate), 'MMM d, yyyy')} - {format(new Date(plan.endDate), 'MMM d, yyyy')}
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
                      <div className="user-home-page-topics-container">
                        {plan.topics.slice(0, 3).map((topic, index) => (
                          <span key={index} className="user-home-page-topic-tag">
                            {topic}
                          </span>
                        ))}
                        {plan.topics.length > 3 && (
                          <span className="user-home-page-topic-more">+{plan.topics.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="user-home-page-card-actions">
                    <Link to={`/view-learning-plan/${plan.id}`} className="user-home-page-btn user-home-page-btn-view">
                      View Details
                    </Link>
                    <div className="user-home-page-btn-group">
                      <Link to={`/edit-learning-plan/${plan.id}`} className="user-home-page-btn user-home-page-btn-edit">
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteLearningPlan(plan.id)} 
                        className="user-home-page-btn user-home-page-btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}