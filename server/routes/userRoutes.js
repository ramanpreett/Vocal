import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import { getUserProfile, getAllEducators, checkUsername, updateProfilePhoto, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage });

router.get('/profile/:username', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile-photo', protect, upload.single('photo'), updateProfilePhoto);
router.get('/', protect, getAllEducators);
router.get('/check-username/:username', checkUsername);

export default router;
