const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');

let io;
const setIo = (socketIo) => {
  io = socketIo;
};

// ─── Pagination defaults ─────────────────────────────────────────────────────
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/skills
 * Supports: ?page=1&limit=9&category=tech&q=guitar
 * Returns: { success, data, page, totalPages, totalCount }
 */
const getSkills = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.category && req.query.category !== 'all') {
      filter.cat = req.query.category;
    }
    if (req.query.q && req.query.q.trim()) {
      const q = req.query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { wants: { $regex: q, $options: 'i' } },
      ];
    }

    const [skills, totalCount] = await Promise.all([
      Skill.find(filter).populate('owner', 'name email').skip(skip).limit(limit).lean(),
      Skill.countDocuments(filter),
    ]);

    const transformedSkills = skills.map((skill) => {
      const { __v, ...rest } = skill;
      return {
        ...rest,
        by: skill.owner ? (skill.owner.name || 'Unknown') : 'Unknown',
        ownerId: skill.owner ? (skill.owner._id || skill.owner).toString() : null,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: transformedSkills,
      page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/skills/:id
 */
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).populate('owner', 'name email');
    if (!skill) throw new ApiError(404, 'Skill not found');
    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/skills
 * Protected. Body validated by createSkillSchema before this runs.
 */
const createSkill = async (req, res, next) => {
  try {
    const { title, wants, cat } = req.body;

    const skill = await Skill.create({ title, wants, cat, owner: req.user.id });
    const populatedSkill = await skill.populate('owner', 'name email');

    const skillObj = populatedSkill.toObject();
    const transformed = {
      ...skillObj,
      by: populatedSkill.owner ? (populatedSkill.owner.name || 'Unknown') : 'Unknown',
      ownerId: populatedSkill.owner ? (populatedSkill.owner._id || populatedSkill.owner).toString() : null,
    };

    if (io) {
      io.emit('skill:new', transformed);
    }

    res.status(201).json({
      success: true,
      message: 'Skill listed successfully',
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/skills/:id
 * Protected. Only the owner (or admin) may update.
 * Body validated by updateSkillSchema — only title/wants/cat are accepted.
 */
const updateSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) throw new ApiError(404, 'Skill not found');

    if (skill.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorised to update this skill');
    }

    // Whitelist: only allow the validated fields through
    const { title, wants, cat } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (wants !== undefined) update.wants = wants;
    if (cat !== undefined) update.cat = cat;

    const updatedSkill = await Skill.findByIdAndUpdate(req.params.id, update, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('owner', 'name email');

    const skillObj = updatedSkill.toObject();
    const transformed = {
      ...skillObj,
      by: updatedSkill.owner ? (updatedSkill.owner.name || 'Unknown') : 'Unknown',
      ownerId: updatedSkill.owner ? (updatedSkill.owner._id || updatedSkill.owner).toString() : null,
    };

    if (io) {
      io.emit('skill:updated', transformed);
    }

    res.status(200).json({ success: true, message: 'Skill updated', data: transformed });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/skills/:id
 * Protected. Only the owner (or admin) may delete.
 */
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) throw new ApiError(404, 'Skill not found');

    if (skill.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorised to delete this skill');
    }

    await skill.deleteOne();

    if (io) {
      io.emit('skill:deleted', { _id: req.params.id });
    }

    res.status(200).json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSkills, getSkillById, createSkill, updateSkill, deleteSkill, setIo };
