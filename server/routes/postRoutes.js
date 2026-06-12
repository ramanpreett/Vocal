import express from 'express';
import { storage } from '../config/cloudinary.js';
import multer from 'multer';
import { createPost, getFeed, toggleLike, addComment, getStats, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({ storage });

router.get('/stats', protect, getStats);
router.post('/', protect, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createPost);
router.get('/feed', protect, getFeed);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

export default router;
