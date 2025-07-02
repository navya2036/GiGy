import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './MyGigsPage.css';

const MyGigsPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, open, assigned, completed

  useEffect(() => {
    const fetchMyGigs = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/gigs/user/mygigs`,
          config
        );
        
        setGigs(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your gigs. Please try again.');
        setLoading(false);
      }
    };
    
    if (userInfo) {
      fetchMyGigs();
    }
  }, [userInfo]);

  const filteredGigs = filter === 'all' 
    ? gigs 
    : gigs.filter(gig => gig.status === filter);

  const deleteGig = async (gigId) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        await axios.delete(`${process.env.REACT_APP_API_URL}/gigs/${gigId}`, config);
        
        setGigs(gigs.filter(gig => gig._id !== gigId));
      } catch (err) {
        alert(err.response && err.response.data.message
          ? err.response.data.message
          : 'Error deleting gig');
      }
    }
  };

  return (
    <div className="my-gigs-page">
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">My Gigs Page</h1>
          <Link to="/create-gig" className="create-gig-btn">
            Create a New Gig
          </Link>
        </div>
        
        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button 
            className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
            onClick={() => setFilter('assigned')}
          >
            Assigned
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
            <p>Loading your gigs...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="empty-container">
            <p>You haven't posted any gigs yet.</p>
            <Link to="/create-gig">Create your first gig</Link>
          </div>
        ) : (
          <div className="gigs-grid">
            {filteredGigs.map((gig) => (
              <div key={gig._id} className="gig-card">
                <h3 className="gig-title">{gig.title}</h3>
                <p className="gig-description">{gig.description.substring(0, 150)}...</p>
                
                <div className="gig-details">
                  <div className="gig-info">
                    <p><strong>Budget:</strong> ${gig.budget}</p>
                    <p><strong>Duration:</strong> {gig.duration}</p>
                  </div>
                  <div className="gig-meta">
                    <span className={`gig-status ${gig.status}`}>{gig.status}</span>
                    <p><strong>Created:</strong> {new Date(gig.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {gig.status !== 'open' && gig.assignedTo && (
                  <div className="assigned-worker">
                    <p><strong>Assigned to:</strong> {gig.assignedTo.name}</p>
                  </div>
                )}

                <div className="action-buttons">
                  <Link to={`/gigs/${gig._id}`}>
                    <button className="btn view-btn">View Details</button>
                  </Link>
                  
                  {gig.status === 'open' && (
                    <>
                      <Link to={`/gigs/edit/${gig._id}`}>
                        <button className="btn edit-btn">Edit</button>
                      </Link>
                      <button 
                        className="btn delete-btn"
                        onClick={() => deleteGig(gig._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {gig.applications && gig.applications.length > 0 && gig.status === 'open' && (
                    <Link to={`/applications/${gig._id}`}>
                      <button className="btn applications-btn">View Applications ({gig.applications.length})</button>
                    </Link>
                  )}
                  
                  {gig.status === 'assigned' && (
                    <button 
                      className="btn complete-btn"
                      onClick={async () => {
                        try {
                          const config = {
                            headers: {
                              Authorization: `Bearer ${userInfo.token}`,
                            },
                          };
                          
                          await axios.put(
                            `${process.env.REACT_APP_API_URL}/gigs/${gig._id}/complete`,
                            {},
                            config
                          );
                          
                          // Update the local state
                          setGigs(gigs.map(g => g._id === gig._id ? { ...g, status: 'completed' } : g));
                        } catch (err) {
                          alert(err.response && err.response.data.message
                            ? err.response.data.message
                            : 'Error completing gig');
                        }
                      }}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigsPage;
