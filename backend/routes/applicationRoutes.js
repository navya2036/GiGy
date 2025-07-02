const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createApplication, 
  getGigApplications, 
  getMyApplications,
  acceptApplication,
  rejectApplication
} = require('../controllers/applicationController');

// All routes are protected
router.post('/', protect, createApplication);
router.get('/gig/:gigId', protect, getGigApplications);
router.get('/myapplications', protect, getMyApplications);
router.put('/:id/accept', protect, acceptApplication);
router.put('/:id/reject', protect, rejectApplication);

module.exports = router;
