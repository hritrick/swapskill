const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');

// io is injected by server.js after Socket.IO is initialised
let io;
const setIo = (socketIo) => {
  io = socketIo;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/swaps
 * Protected. Body validated by createSwapSchema before this runs.
 * Creates a swap request and emits a real-time notification to the recipient.
 */
const createSwapRequest = async (req, res, next) => {
  try {
    const { toUser, skill, offeredSkill, hours } = req.body;

    // Prevent self-proposals
    if (toUser === req.user.id) {
      throw new ApiError(400, 'You cannot propose a swap to yourself');
    }

    // Confirm the target user and skill exist
    const [recipient, targetSkill] = await Promise.all([
      User.findById(toUser).select('name'),
      Skill.findById(skill).select('title owner'),
    ]);
    if (!recipient) throw new ApiError(404, 'Recipient user not found');
    if (!targetSkill) throw new ApiError(404, 'Skill not found');

    // The skill being requested must belong to the recipient
    if (targetSkill.owner.toString() !== toUser) {
      throw new ApiError(400, 'That skill does not belong to the specified user');
    }

    const swap = await SwapRequest.create({
      fromUser: req.user.id,
      toUser,
      skill,
      offeredSkill,
      hours,
    });

    const populated = await SwapRequest.findById(swap._id)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('skill', 'title cat');

    // Real-time notification to the recipient's private Socket.IO room
    if (io) {
      io.to(toUser).emit('swap:new', {
        _id: populated._id,
        from: populated.fromUser.name,
        fromId: populated.fromUser._id,
        skill: populated.skill.title,
        offeredSkill: populated.offeredSkill,
        hours: populated.hours,
        status: populated.status,
        createdAt: populated.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: `Swap proposal sent to ${recipient.name}`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/swaps/:id
 * Protected. Body validated by updateSwapSchema (status: accepted|declined).
 * Only the recipient (toUser) may accept/decline.
 * On acceptance: credits are transferred server-side.
 */
const updateSwapRequest = async (req, res, next) => {
  try {
    const swap = await SwapRequest.findById(req.params.id).populate('skill', 'title');
    if (!swap) throw new ApiError(404, 'Swap request not found');

    if (swap.toUser.toString() !== req.user.id) {
      throw new ApiError(403, 'Only the recipient can accept or decline this swap');
    }

    if (swap.status !== 'pending') {
      throw new ApiError(400, `Swap is already ${swap.status}`);
    }

    swap.status = req.body.status;
    await swap.save();

    // Credit transfer on acceptance
    if (req.body.status === 'accepted') {
      await User.findByIdAndUpdate(swap.toUser, { $inc: { credits: swap.hours } });
    }

    // Notify the proposer in real-time
    if (io) {
      io.to(swap.fromUser.toString()).emit('swap:updated', {
        _id: swap._id,
        status: swap.status,
        skill: swap.skill.title,
        hours: swap.hours,
        // Send updated credit info for the recipient (so their UI updates)
        ...(req.body.status === 'accepted' && {
          recipientCreditsAdded: swap.hours,
        }),
      });
    }

    res.status(200).json({
      success: true,
      message: `Swap ${swap.status}`,
      data: swap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/swaps/me
 * Protected. Returns all swaps where the user is the recipient (inbox)
 * or the proposer (sent), with optional ?status= filter.
 */
const getMySwapRequests = async (req, res, next) => {
  try {
    const { status, role: queryRole } = req.query;
    const userId = req.user.id;

    const filter = {};
    if (status) filter.status = status;

    if (queryRole === 'sent') {
      filter.fromUser = userId;
    } else if (queryRole === 'received') {
      filter.toUser = userId;
    } else {
      // Default: both sent and received
      filter.$or = [{ fromUser: userId }, { toUser: userId }];
    }

    const swaps = await SwapRequest.find(filter)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('skill', 'title cat')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: swaps });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSwapRequest, updateSwapRequest, getMySwapRequests, setIo };
