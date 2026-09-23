const express = require('express');

const router = express.Router();
const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createSkillSchema, updateSkillSchema } = require('../validators/skillValidators');

router.route('/').get(getSkills).post(protect, validate(createSkillSchema), createSkill);

router
  .route('/:id')
  .get(getSkillById)
  .put(protect, validate(updateSkillSchema), updateSkill)
  .delete(protect, deleteSkill);

module.exports = router;
