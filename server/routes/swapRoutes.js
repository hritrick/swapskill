const express = require('express');

const router = express.Router();
const {
  createSwapRequest,
  updateSwapRequest,
  getMySwapRequests,
} = require('../controllers/swapRequestController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createSwapSchema, updateSwapSchema } = require('../validators/swapValidators');

// All swap routes require authentication
router.use(protect);

router.route('/').post(validate(createSwapSchema), createSwapRequest);

router.route('/me').get(getMySwapRequests);

router.route('/:id').patch(validate(updateSwapSchema), updateSwapRequest);

module.exports = router;
