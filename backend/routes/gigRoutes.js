const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createGig, 
  getGigs, 
  getGigById, 
  updateGig, 
  deleteGig,
  getMyGigs,
  getMyAssignments,
  completeGig
} = require('../controllers/gigController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getGigs);

// Protected routes (static routes first)
router.get('/user/mygigs', protect, getMyGigs);
router.get('/user/myassignments', protect, getMyAssignments);
router.put('/:id/complete', protect, completeGig);
router.post('/', protect, uploadMiddleware.array('images', 5), createGig);
router.put('/:id', protect, uploadMiddleware.array('images', 5), updateGig);
router.delete('/:id', protect, deleteGig);

// Dynamic route LAST
router.get('/:id', getGigById);

module.exports = router;
