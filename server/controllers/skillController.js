const Skill = require('../models/Skill');

const getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().populate('owner', 'name email');
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('owner', 'name email');
    if (!skill) {
      res.status(404);
      throw new Error('Skill not found');
    }
    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    next(error);
  }
};

const createSkill = async (req, res, next) => {
  try {
    const { title, wants, cat } = req.body;
    
    if (!title || !wants || !cat) {
      res.status(400);
      throw new Error('Please add all required fields (title, wants, cat)');
    }

    const skill = await Skill.create({
      title,
      wants,
      cat,
      owner: req.user.id
    });

    const populatedSkill = await skill.populate('owner', 'name email');

    res.status(201).json({ success: true, message: 'Skill created successfully', data: populatedSkill });
  } catch (error) {
    next(error);
  }
};

const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404);
      throw new Error('Skill not found');
    }

    if (skill.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this skill');
    }

    const updatedSkill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('owner', 'name email');

    res.status(200).json({ success: true, message: 'Skill updated successfully', data: updatedSkill });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      res.status(404);
      throw new Error('Skill not found');
    }

    if (skill.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this skill');
    }

    await skill.deleteOne();
    res.status(200).json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSkills, getSkillById, createSkill, updateSkill, deleteSkill };
