const { z } = require('zod');

// Loose ObjectId string check — Mongoose will do a strict parse
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectId = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .regex(objectIdRegex, `${label} must be a valid ID`);

const createSwapSchema = z.object({
  toUser: objectId('toUser'),
  skill: objectId('skill'),
  offeredSkill: z
    .string({ required_error: 'offeredSkill is required' })
    .min(2, 'Offered skill name must be at least 2 characters')
    .max(100)
    .trim(),
  hours: z
    .number({ required_error: 'hours is required' })
    .positive('Hours must be a positive number')
    .max(10, 'Hours cannot exceed 10 per swap'),
});

const updateSwapSchema = z.object({
  status: z.enum(['accepted', 'declined'], {
    errorMap: () => ({ message: 'Status must be "accepted" or "declined"' }),
  }),
});

module.exports = { createSwapSchema, updateSwapSchema };
