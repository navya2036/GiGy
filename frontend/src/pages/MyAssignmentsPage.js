import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MyAssignmentsPage.css';

const MyAssignmentsPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, assigned, completed

  useEffect(() => {
    const fetchMyAssignments = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/gigs/user/myassignments`,
          config
        );
        
        setAssignments(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your assignments. Please try again.');
        setLoading(false);
      }
    };
    
    if (userInfo) {
      fetchMyAssignments();
    }
  }, [userInfo]);

  const filteredAssignments = filter === 'all' 
    ? assignments 
    : assignments.filter(assignment => assignment.status === filter);

  return (
    <div className="page-container">
      <div className="main-content">
        <div className="assignments-header">
          <h1>My Assigned Gigs</h1>
        </div>
        
        {/* Filter Buttons */}
        <div className="filter-container">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
            onClick={() => setFilter('assigned')}
          >
            In Progress
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <p>Loading your assignments...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="empty-container">
            <p>No assignments found. {filter !== 'all' && 'Try a different filter or '} 
              <Link to="/gigs">browse available gigs</Link>.
            </p>
          </div>
        ) : (
          <div className="assignments-container">
            {filteredAssignments.map((assignment) => (
              <div key={assignment._id} className="assignment-card">
                <h3>{assignment.title}</h3>
                <p>{assignment.description.substring(0, 150)}...</p>
                <div className="assignment-details">
                  <div className="detail-group">
                    <p><strong>Budget:</strong> ${assignment.budget}</p>
                    <p><strong>Duration:</strong> {assignment.duration}</p>
                    <p><strong>Category:</strong> {assignment.category}</p>
                  </div>
                  <div className="detail-group">
                    <p><strong>Status:</strong> {assignment.status}</p>
                    <p><strong>Posted by:</strong> {assignment.creator.name}</p>
                    <p><strong>Assigned:</strong> {new Date(assignment.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="action-buttons">
                  <Link to={`/gigs/${assignment._id}`} className="action-btn view-btn">
                    View Details
                  </Link>
                  
                  <Link to={`/messages/${assignment.creator._id}`} className="action-btn message-btn">
                    Message Client
                  </Link>
                </div>
                
                {/* Completed info */}
                {assignment.status === 'completed' && (
                  <div className="completed-section">
                    <p><strong>Completed on:</strong> {new Date(assignment.completionDate).toLocaleDateString()}</p>
                    
                    {/* Review Link - Only show if the user hasn't left a review yet */}
                    <Link to={`/gigs/${assignment._id}`} className="review-btn">
                      View or Leave Review
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssignmentsPage;
