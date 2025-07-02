import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './GigDetailsPage.css';

const GigDetailsPage = () => {
  const { id } = useParams();
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/gigs/${id}`);
        setGig(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch gig details. Please try again.');
        setLoading(false);
      }
    };
    
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/reviews/gig/${id}`);
        setReviews(data);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    
    fetchGig();
    fetchReviews();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!userInfo) {
      navigate('/login');
      return;
    }
    
    setApplyError('');
    setApplySuccess('');
    
    if (!coverLetter || !proposedAmount) {
      setApplyError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/applications`,
        { 
          gigId: id, 
          coverLetter, 
          proposedAmount: parseFloat(proposedAmount) 
        },
        config
      );
      
      setApplySuccess('Application submitted successfully!');
      setCoverLetter('');
      setProposedAmount('');
    } catch (err) {
      setApplyError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="gig-details-page">
        <div className="main-content">
          <div className="loading-container">
            <p>Loading gig details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gig-details-page">
        <div className="main-content">
          <div className="error-container">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gig-details-page">
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">{gig.title}</h1>
        </div>

        <div className="gig-content">
          <p className="gig-description">{gig.description}</p>
          
          <div className="details-grid">
            <div className="details-section">
              <h2 className="section-title">Gig Details</h2>
              <div className="detail-item">
                <span className="detail-label">Budget:</span>
                <span className="detail-value">${gig.budget}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{gig.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{gig.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{gig.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${gig.status}`}>{gig.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Skills Required:</span>
                <div className="skills-list">
                  {gig.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="details-section">
              <h2 className="section-title">Poster Information</h2>
              <div className="detail-item">
                <span className="detail-label">Posted by:</span>
                <span className="detail-value">{gig.creator.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Posted on:</span>
                <span className="detail-value">
                  {new Date(gig.createdAt).toLocaleDateString()}
                </span>
              </div>
              {gig.assignedTo && (
                <div className="detail-item">
                  <span className="detail-label">Assigned to:</span>
                  <span className="detail-value">{gig.assignedTo.name}</span>
                </div>
              )}
              {gig.completionDate && (
                <div className="detail-item">
                  <span className="detail-label">Completed on:</span>
                  <span className="detail-value">
                    {new Date(gig.completionDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {gig.images && gig.images.length > 0 && (
            <div className="images-section">
              <h2 className="section-title">Gig Images</h2>
              <div className="images-grid">
                {gig.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Gig ${index + 1}`} 
                    className="gig-image"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            {userInfo && userInfo._id === gig.creator._id && gig.status === 'open' && (
              <Link to={`/gigs/edit/${gig._id}`}>
                <button className="btn edit-btn">Edit Gig</button>
              </Link>
            )}
            
            {userInfo && userInfo._id === gig.creator._id && gig.status === 'assigned' && (
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
                    window.location.reload();
                  } catch (err) {
                    console.error('Error completing gig:', err);
                    alert('Failed to mark gig as completed');
                  }
                }}
              >
                Mark as Completed
              </button>
            )}
            
            {userInfo && userInfo._id === gig.creator._id && gig.applications && 
             gig.applications.length > 0 && (
              <Link to={`/applications/${gig._id}`}>
                <button className="btn applications-btn">
                  View Applications ({gig.applications.length})
                </button>
              </Link>
            )}
          </div>

          {userInfo && gig.status === 'open' && userInfo._id !== gig.creator._id && (
            <div className="application-section">
              <h2 className="section-title">Apply for this Gig</h2>
              {applyError && <div className="error-message">{applyError}</div>}
              {applySuccess && <div className="success-message">{applySuccess}</div>}
              
              <form onSubmit={handleApply} className="application-form">
                <div className="form-group">
                  <label htmlFor="coverLetter">Cover Letter</label>
                  <textarea
                    id="coverLetter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Explain why you're a good fit for this gig"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="proposedAmount">Your Proposed Amount ($)</label>
                  <input
                    id="proposedAmount"
                    type="number"
                    min="1"
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}

          <div className="reviews-section">
            <h2 className="section-title">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet for this gig.</p>
            ) : (
              <div className="reviews-grid">
                {reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      {review.reviewer.profilePicture && (
                        <img 
                          src={review.reviewer.profilePicture} 
                          alt={review.reviewer.name} 
                          className="reviewer-image"
                        />
                      )}
                      <div className="reviewer-info">
                        <p className="reviewer-name">{review.reviewer.name}</p>
                        <p className="review-rating">Rating: {review.rating} / 5</p>
                        <p className="reviewer-role">
                          {review.reviewerRole === 'poster' ? 'Gig Poster' : 'Worker'}
                        </p>
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailsPage;
