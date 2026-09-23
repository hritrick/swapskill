const { z } = require('zod');

const VALID_CATEGORIES = ['craft', 'tech', 'language', 'wellness'];

const createSkillSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be 100 characters or fewer'),
  wants: z
    .string({ required_error: '"Wants" field is required' })
    .trim()
    .min(1, '"Wants" field cannot be empty')
    .max(100, '"Wants" must be 100 characters or fewer'),
  cat: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({
      message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    }),
  }),
});

// All fields optional for PATCH/PUT — at least one must be present
const updateSkillSchema = z
  .object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(100).optional(),
    wants: z.string().trim().min(1, '"Wants" cannot be empty').max(100).optional(),
    cat: z.enum(VALID_CATEGORIES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (title, wants, cat) must be provided to update',
  });

module.exports = { createSkillSchema, updateSkillSchema };
