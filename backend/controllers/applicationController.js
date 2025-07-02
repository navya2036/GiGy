const Application = require('../models/Application');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res) => {
  try {
    const { gigId, coverLetter, proposedAmount } = req.body;
    
    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    // Check if gig is still open
    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is no longer accepting applications' });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      gig: gigId,
      applicant: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this gig' });
    }
    
    // Check if user is trying to apply for their own gig
    if (gig.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot apply for your own gig' });
    }
    
    const application = new Application({
      gig: gigId,
      applicant: req.user._id,
      coverLetter,
      proposedAmount: Number(proposedAmount),
    });
    
    const createdApplication = await application.save();
    
    // Add application to gig's applications array
    gig.applications.push(createdApplication._id);
    await gig.save();
    
    // Populate applicant details
    await createdApplication.populate('applicant', 'name email profilePicture');
    
    res.status(201).json(createdApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get applications for a gig
// @route   GET /api/applications/gig/:gigId
// @access  Private
const getGigApplications = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view these applications' });
    }
    
    const applications = await Application.find({ gig: req.params.gigId })
      .populate('applicant', 'name email profilePicture bio skills rating completedGigs')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get applications submitted by current user
// @route   GET /api/applications/myapplications
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('gig', 'title budget status creator')
      .populate('gig.creator', 'name email profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Accept an application
// @route   PUT /api/applications/:id/accept
// @access  Private
const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const gig = await Gig.findById(application.gig);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to accept this application' });
    }
    
    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is no longer open for applications' });
    }
    
    application.status = 'accepted';
    await application.save();
    
    gig.status = 'assigned';
    gig.assignedTo = application.applicant;
    await gig.save();
    
    // Reject all other applications for this gig
    await Application.updateMany(
      { gig: gig._id, _id: { $ne: application._id } },
      { status: 'rejected' }
    );
    
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reject an application
// @route   PUT /api/applications/:id/reject
// @access  Private
const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const gig = await Gig.findById(application.gig);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    
    if (gig.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to reject this application' });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending applications' });
    }
    
    application.status = 'rejected';
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createApplication,
  getGigApplications,
  getMyApplications,
  acceptApplication,
  rejectApplication,
};
