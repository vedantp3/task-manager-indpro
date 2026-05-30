'use strict';
const express    = require('express');
const router     = express.Router();
const authenticate = require('../middleware/auth');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validate');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks
router.get('/', getTasks);

// POST /api/tasks
router.post('/', validateCreateTask, createTask);

// PUT /api/tasks/:id
router.put('/:id', validateUpdateTask, updateTask);

// DELETE /api/tasks/:id
router.delete('/:id', deleteTask);

module.exports = router;
