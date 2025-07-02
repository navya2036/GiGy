const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required']
  },
  reviewerRole: {
    type: String,
    enum: ['poster', 'worker'],
    required: true
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
