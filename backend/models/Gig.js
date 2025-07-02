const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required']
  },
  location: {
    type: String,
    default: 'Remote'
  },
  duration: {
    type: String,
    required: [true, 'Duration is required']
  },
  images: [String],
  skills: [String],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed', 'cancelled'],
    default: 'open'
  },
  applications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }
  ],
  completionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Gig = mongoose.model('Gig', gigSchema);
module.exports = Gig;
