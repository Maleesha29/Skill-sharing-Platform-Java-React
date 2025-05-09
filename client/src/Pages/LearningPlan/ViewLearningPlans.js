import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import '../../css/ViewLearningPlans.css';
import NavBar from '../../components/NavBar';

export default function ViewLearningPlans() {
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
      setLearningPlans(result.data);
    } catch (error) {
      console.error("Error loading learning plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLearningPlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        await axios.delete(`http://localhost:8080/api/learning-plan/${id}`);
        loadLearningPlans(); // Reload the list after deletion
      } catch (error) {
        console.error("Error deleting learning plan:", error);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'NOT_STARTED': 
        return "User-View-Learning-Plans-badge User-View-Learning-Plans-badge-secondary";
      case 'IN_PROGRESS': 
        return "User-View-Learning-Plans-badge User-View-Learning-Plans-badge-primary";
      case 'COMPLETED': 
        return "User-View-Learning-Plans-badge User-View-Learning-Plans-badge-success";
      default: 
        return "User-View-Learning-Plans-badge User-View-Learning-Plans-badge-light";
    }
  };

  const getFormattedStatus = (status) => {
    return status.replace('_', ' ');
  };

  const filteredPlans = learningPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plan.topics && plan.topics.some(topic => 
                            topic.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    const matchesFilter = filterStatus === 'ALL' || plan.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <NavBar />
      <div className="User-View-Learning-Plans-container">
        <div className="User-View-Learning-Plans-header">
          <div className="User-View-Learning-Plans-title-section">
            <h1 className="User-View-Learning-Plans-title">Learning Plans</h1>
            <p className="User-View-Learning-Plans-subtitle">
              Track and manage your learning journey
            </p>
          </div>
          <Link to="/add-learning-plan" className="User-View-Learning-Plans-btn User-View-Learning-Plans-btn-primary">
            <span className="User-View-Learning-Plans-btn-icon">+</span> Create New Plan
          </Link>
        </div>

        <div className="User-View-Learning-Plans-filters">
          <div className="User-View-Learning-Plans-search">
            <input
              type="text"
              placeholder="Search plans by title, description or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="User-View-Learning-Plans-search-input"
            />
            <span className="User-View-Learning-Plans-search-icon">🔍</span>
          </div>
          
          <div className="User-View-Learning-Plans-filter-group">
            <label className="User-View-Learning-Plans-filter-label">Filter by status:</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="User-View-Learning-Plans-filter-select"
            >
              <option value="ALL">All Plans</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="User-View-Learning-Plans-loading">
            <div className="User-View-Learning-Plans-spinner"></div>
            <span>Loading your learning plans...</span>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="User-View-Learning-Plans-empty-state">
            <div className="User-View-Learning-Plans-empty-icon">📚</div>
            {searchTerm || filterStatus !== 'ALL' ? (
              <>
                <h3>No matching learning plans found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('ALL');
                  }} 
                  className="User-View-Learning-Plans-btn User-View-Learning-Plans-btn-secondary"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h3>No learning plans found</h3>
                <p>Start your learning journey by creating your first plan!</p>
                <Link to="/add-learning-plan" className="User-View-Learning-Plans-btn User-View-Learning-Plans-btn-primary">
                  Create Learning Plan
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="User-View-Learning-Plans-count">
              Showing {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'}
              {(searchTerm || filterStatus !== 'ALL') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('ALL');
                  }}
                  className="User-View-Learning-Plans-clear-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="User-View-Learning-Plans-grid">
              {filteredPlans.map((plan) => (
                <div className="User-View-Learning-Plans-card" key={plan.id}>
                  <div className="User-View-Learning-Plans-card-header">
                    <h3 className="User-View-Learning-Plans-card-title">{plan.title}</h3>
                    <span className={getStatusBadgeClass(plan.status)}>
                      {getFormattedStatus(plan.status)}
                    </span>
                  </div>
                  
                  <div className="User-View-Learning-Plans-card-dates">
                    <span className="User-View-Learning-Plans-date-icon">🗓️</span>
                    {format(new Date(plan.startDate), 'MMM d, yyyy')} - {format(new Date(plan.endDate), 'MMM d, yyyy')}
                  </div>
                  
                  <div className="User-View-Learning-Plans-card-description">
                    {plan.description.length > 100 
                      ? `${plan.description.substring(0, 100)}...` 
                      : plan.description}
                  </div>
                  
                  <div className="User-View-Learning-Plans-progress-container">
                    <div className="User-View-Learning-Plans-progress-info">
                      <span>Progress</span>
                      <span className="User-View-Learning-Plans-progress-percentage">{plan.progressPercentage}%</span>
                    </div>
                    <div className="User-View-Learning-Plans-progress-bar">
                      <div 
                        className="User-View-Learning-Plans-progress-fill" 
                        style={{ width: `${plan.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {plan.topics && plan.topics.length > 0 && (
                    <div className="User-View-Learning-Plans-topics">
                      <span className="User-View-Learning-Plans-topics-label">Topics:</span>
                      <div className="User-View-Learning-Plans-topics-container">
                        {plan.topics.slice(0, 3).map((topic, index) => (
                          <span key={index} className="User-View-Learning-Plans-topic-tag">
                            {topic}
                          </span>
                        ))}
                        {plan.topics.length > 3 && (
                          <span className="User-View-Learning-Plans-topic-more">
                            +{plan.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="User-View-Learning-Plans-card-actions">
                    <Link to={`/view-learning-plan/${plan.id}`} className="User-View-Learning-Plans-btn User-View-Learning-Plans-btn-view">
                      View Details
                    </Link>
                    <div className="User-View-Learning-Plans-btn-group">
                      <Link to={`/edit-learning-plan/${plan.id}`} className="User-View-Learning-Plans-btn User-View-Learning-Plans-btn-edit">
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteLearningPlan(plan.id)} 
                        className="User-View-Learning-Plans-btn User-View-Learning-Plans-btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}