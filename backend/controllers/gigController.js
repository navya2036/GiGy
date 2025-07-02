const Gig = require('../models/Gig');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

// @desc    Create a gig
// @route   POST /api/gigs
// @access  Private
const createGig = async (req, res) => {
  try {
    // Check if req.user exists (authentication middleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const { title, description, category, budget, location, duration, skills } = req.body;
    
    const gig = new Gig({
      title,
      description,
      category,
      budget: Number(budget),
      location,
      duration,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
      creator: req.user._id,
      images: []
    });
    
    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const results = await Promise.all(uploadPromises);
      gig.images = results.map(result => result.secure_url);
    }
    
    const createdGig = await gig.save();
    
    // Update user's posted gigs count
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { postedGigs: 1 } }
    );
    
    res.status(201).json(createdGig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
const getGigs = async (req, res) => {
  try {
    const { category, search, minBudget, maxBudget, status } = req.query;
    
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minBudget && !isNaN(Number(minBudget))) {
      filter.budget = { ...filter.budget, $gte: Number(minBudget) };
    }
    
    if (maxBudget && !isNaN(Number(maxBudget))) {
      filter.budget = { ...filter.budget, $lte: Number(maxBudget) };
    }
    
    if (status) {
      filter.status = status;
    }
    
    const gigs = await Gig.find(filter)
      .populate('creator', 'name email profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(gigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public
const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('creator', 'name email profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .populate({
        path: 'applications',
        populate: { path: 'applicant', select: 'name email profilePicture' }
      });
    
    if (gig) {
      res.json(gig);
    } else {
      res.status(404).json({ message: 'Gig not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private
const updateGig = async (req, res) => {
  try {
    const { title, description, category, budget, location, duration, skills, status } = req.body;
    
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this gig' });
    }
    
    if (gig.status !== 'open' && status === 'open') {
      return res.status(400).json({ message: 'Cannot change status back to open once assigned' });
    }
    
    gig.title = title || gig.title;
    gig.description = description || gig.description;
    gig.category = category || gig.category;
    gig.budget = budget ? Number(budget) : gig.budget;
    gig.location = location || gig.location;
    gig.duration = duration || gig.duration;
    gig.status = status || gig.status;
    
    if (skills) {
      gig.skills = skills.split(',').map(skill => skill.trim());
    }
    
    // Handle new image uploads if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const results = await Promise.all(uploadPromises);
      gig.images = [...gig.images, ...results.map(result => result.secure_url)];
    }
    
    const updatedGig = await gig.save();
    
    res.json(updatedGig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private
const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this gig' });
    }
    
    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete a gig that is already assigned or completed' });
    }
    
    await gig.remove();
    
    // Update user's posted gigs count
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { postedGigs: -1 } }
    );
    
    res.json({ message: 'Gig removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get gigs posted by the logged-in user
// @route   GET /api/gigs/mygigs
// @access  Private
const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ creator: req.user._id })
      .populate('creator', 'name email profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(gigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get gigs assigned to the logged-in user
// @route   GET /api/gigs/myassignments
// @access  Private
const getMyAssignments = async (req, res) => {
  try {
    const gigs = await Gig.find({ assignedTo: req.user._id })
      .populate('creator', 'name email profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(gigs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Mark a gig as completed
// @route   PUT /api/gigs/:id/complete
// @access  Private
const completeGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the gig creator can mark it as completed' });
    }
    
    if (gig.status !== 'assigned') {
      return res.status(400).json({ message: 'Only assigned gigs can be marked as completed' });
    }
    
    gig.status = 'completed';
    gig.completionDate = Date.now();
    
    const updatedGig = await gig.save();
    
    // Update user's completed gigs count
    await User.findByIdAndUpdate(
      gig.assignedTo,
      { $inc: { completedGigs: 1 } }
    );
    
    res.json(updatedGig);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  getMyGigs,
  getMyAssignments,
  completeGig
};
