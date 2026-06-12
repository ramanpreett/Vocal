import Skill from '../models/Skill.js';

export const createSkill = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name is required' });

    // Check if skill already exists (case-insensitive)
    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    const skill = await Skill.create({
      name,
      createdBy: req.user._id
    });
    
    res.status(201).json(skill);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Skill already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort('name');
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
