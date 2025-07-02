import api from './api';

// Create a new review
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// Get reviews for a gig
export const getGigReviews = async (gigId) => {
  const response = await api.get(`/reviews/gig/${gigId}`);
  return response.data;
};

// Get reviews for a user
export const getUserReviews = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};
