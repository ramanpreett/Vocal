import express from 'express';
import { getConversation, sendMessage, getUnreadCounts } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread/count', protect, getUnreadCounts);
router.get('/:userId', protect, getConversation);
router.post('/:userId', protect, sendMessage);

export default router;
