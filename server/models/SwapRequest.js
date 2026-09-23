const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    offeredSkill: {
      type: String,
      required: true,
      trim: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 10,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Index for fast inbox queries: "all pending swaps where I am the recipient"
swapRequestSchema.index({ toUser: 1, status: 1 });
// Index for "all swaps I have sent"
swapRequestSchema.index({ fromUser: 1 });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
