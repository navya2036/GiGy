import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ApplicationsPage.css';

const ApplicationsPage = () => {
  const { gigId } = useParams();
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/gigs/${gigId}`, config);
        
        // Check if the user is the creator of the gig
        if (data.creator._id !== userInfo._id) {
          navigate('/my-gigs');
          return;
        }
        
        setGig(data);
      } catch (err) {
        setError('Failed to fetch gig details. Please try again.');
      }
    };
    
    const fetchApplications = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/applications/gig/${gigId}`,
          config
        );
        
        setApplications(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch applications. Please try again.');
        setLoading(false);
      }
    };
    
    if (userInfo) {
      fetchGig();
      fetchApplications();
    }
  }, [gigId, userInfo, navigate]);

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const handleAccept = async (applicationId) => {
    if (window.confirm('Are you sure you want to accept this application?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.put(
          `${process.env.REACT_APP_API_URL}/applications/${applicationId}/accept`,
          {},
          config
        );
        
        // Update local state
        navigate(`/gigs/${gigId}`);
      } catch (err) {
        alert(err.response && err.response.data.message
          ? err.response.data.message
          : 'Error accepting application');
      }
    }
  };

  const handleReject = async (applicationId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.put(
          `${process.env.REACT_APP_API_URL}/applications/${applicationId}/reject`,
          {},
          config
        );
        
        // Update local state
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: 'rejected' } : app
        ));
      } catch (err) {
        alert(err.response && err.response.data.message
          ? err.response.data.message
          : 'Error rejecting application');
      }
    }
  };

  if (loading) {
    return (
      <div className="applications-page">
        <div className="main-content">
          <div className="loading-container">
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-page">
        <div className="main-content">
          <div className="error-container">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="main-content">
        <Link to={`/gigs/${gigId}`} className="back-link">
          ← Back to Gig
        </Link>
        
        <h1 className="page-title">Applications for: {gig?.title}</h1>
        
        <div className="filter-container">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(app => app.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({applications.filter(app => app.status === 'accepted').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({applications.filter(app => app.status === 'rejected').length})
          </button>
        </div>
        
        {filteredApplications.length === 0 ? (
          <p className="empty-message">No applications found with the selected filter.</p>
        ) : (
          <div className="applications-list">
            {filteredApplications.map((app) => (
              <div key={app._id} className="application-card">
                <div className="applicant-header">
                  {app.applicant.profilePicture && (
                    <img 
                      src={app.applicant.profilePicture} 
                      alt={app.applicant.name}
                      className="applicant-avatar"
                    />
                  )}
                  <div className="applicant-info">
                    <h3>{app.applicant.name}</h3>
                    <p className="application-date">
                      Applied on: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="application-details">
                  <div className="detail-group">
                    <p><strong>Proposed Amount:</strong> ${app.proposedAmount}</p>
                    <p>
                      <strong>Status: </strong>
                      <span className={`status-badge ${app.status}`}>
                        {app.status}
                      </span>
                    </p>
                  </div>
                  
                  {app.applicant.rating > 0 && (
                    <div className="detail-group">
                      <p><strong>Rating:</strong> {app.applicant.rating.toFixed(1)}/5</p>
                      <p><strong>Completed Gigs:</strong> {app.applicant.completedGigs}</p>
                    </div>
                  )}
                </div>
                
                <div className="cover-letter">
                  <h4>Cover Letter:</h4>
                  <p>{app.coverLetter}</p>
                </div>
                
                {app.applicant.skills && app.applicant.skills.length > 0 && (
                  <div className="skills-list">
                    {app.applicant.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
                
                <div className="action-buttons">
                  {gig?.status === 'open' && app.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAccept(app._id)}
                        className="action-btn accept-btn"
                      >
                        Accept & Hire
                      </button>
                      <button 
                        onClick={() => handleReject(app._id)}
                        className="action-btn reject-btn"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  <Link 
                    to={`/messages/${app.applicant._id}`}
                    className="action-btn message-btn"
                  >
                    Message Applicant
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
