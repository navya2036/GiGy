const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getUserById,
  updateUserProfile,
  uploadProfilePicture
} = require('../controllers/userController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUserById);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/picture', protect, uploadMiddleware.single('image'), uploadProfilePicture);

module.exports = router;
