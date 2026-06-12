import express from 'express';
import { getMeetings, scheduleMeeting } from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMeetings);
router.post('/', protect, scheduleMeeting);

export default router;
