const Review = require('../models/Review');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { gigId, revieweeId, rating, comment, reviewerRole } = req.body;
    
    // Validate input
    if (!gigId || !revieweeId || !rating || !comment || !reviewerRole) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if gig exists and is completed
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed gigs' });
    }
    
    // Check if user is authorized to leave review
    if (reviewerRole === 'poster' && gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the gig creator can leave a review as a poster' });
    }
    
    if (reviewerRole === 'worker' && gig.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned worker can leave a review as a worker' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({
      gig: gigId,
      reviewer: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this gig' });
    }
    
    const review = new Review({
      gig: gigId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: Number(rating),
      comment,
      reviewerRole
    });
    
    const createdReview = await review.save();
    
    // Update user's rating
    const reviewee = await User.findById(revieweeId);
    const allReviews = await Review.find({ reviewee: revieweeId });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    reviewee.rating = averageRating;
    await reviewee.save();
    
    res.status(201).json(createdReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get reviews for a gig
// @route   GET /api/reviews/gig/:gigId
// @access  Public
const getGigReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate('reviewer', 'name email profilePicture')
      .populate('reviewee', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name email profilePicture')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createReview,
  getGigReviews,
  getUserReviews
};
