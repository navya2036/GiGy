import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ReviewForm = ({ gigId, revieweeId, reviewerRole, onReviewSubmitted }) => {
  const { userInfo } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }
    
    if (!comment) {
      setError('Please provide a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/reviews`,
        { 
          gigId, 
          revieweeId, 
          rating: parseInt(rating), 
          comment,
          reviewerRole
        },
        config
      );
      
      setSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '15px', 
      borderRadius: '5px', 
      marginBottom: '20px' 
    }}>
      <h3>Leave a Review</h3>
      
      {error && <div className="error">{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="rating">Rating (1-5 stars) *</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="comment">Comment *</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            placeholder="Share your experience..."
            required
          ></textarea>
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
