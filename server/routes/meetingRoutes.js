import express from 'express';
import { getMeetings, scheduleMeeting, cancelMeeting } from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMeetings);
router.post('/', protect, scheduleMeeting);
router.delete('/:id', protect, cancelMeeting);

export default router;
