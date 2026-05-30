'use strict';

const VALID_STAGES = ['todo', 'in_progress', 'done'];

/**
 * Simple email format check (RFC-compliant enough for this scope).
 */
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validate POST /api/auth/register
 * Rules:
 *   - email: required, valid format
 *   - password: required, ≥ 6 characters
 */
const validateRegister = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  next();
};

/**
 * Validate POST /api/tasks
 * Rules:
 *   - title: required, max 120 chars
 *   - stage: optional, must be one of VALID_STAGES
 */
const validateCreateTask = (req, res, next) => {
  const { title, stage } = req.body;
  const errors = {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.title = 'Title is required.';
  } else if (title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or fewer.';
  }

  if (stage !== undefined && !VALID_STAGES.includes(stage)) {
    errors.stage = `Stage must be one of: ${VALID_STAGES.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  next();
};

/**
 * Validate PUT /api/tasks/:id
 * Rules:
 *   - At least one of { title, description, stage } must be present
 *   - title: max 120 chars if provided
 *   - stage: must be valid if provided
 */
const validateUpdateTask = (req, res, next) => {
  const { title, description, stage } = req.body;
  const errors = {};

  const hasTitle       = title !== undefined;
  const hasDescription = description !== undefined;
  const hasStage       = stage !== undefined;

  if (!hasTitle && !hasDescription && !hasStage) {
    return res
      .status(400)
      .json({ error: 'Provide at least one field to update (title, description, or stage).' });
  }

  if (hasTitle) {
    if (typeof title !== 'string' || !title.trim()) {
      errors.title = 'Title cannot be empty.';
    } else if (title.trim().length > 120) {
      errors.title = 'Title must be 120 characters or fewer.';
    }
  }

  if (hasStage && !VALID_STAGES.includes(stage)) {
    errors.stage = `Stage must be one of: ${VALID_STAGES.join(', ')}.`;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', fields: errors });
  }

  next();
};

module.exports = { validateRegister, validateCreateTask, validateUpdateTask };
