const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createReview, 
  getGigReviews, 
  getUserReviews 
} = require('../controllers/reviewController');

// Public routes
router.get('/gig/:gigId', getGigReviews);
router.get('/user/:userId', getUserReviews);

// Protected routes
router.post('/', protect, createReview);

module.exports = router;
