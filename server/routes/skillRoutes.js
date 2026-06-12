import express from 'express';
import { createSkill, getAllSkills } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSkill);
router.get('/', protect, getAllSkills);

export default router;
