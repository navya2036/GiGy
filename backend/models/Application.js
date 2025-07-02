const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required']
  },
  proposedAmount: {
    type: Number,
    required: [true, 'Proposed amount is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
