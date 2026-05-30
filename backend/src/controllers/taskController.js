'use strict';
const db = require('../config/db');

// ──────────────────────────────────────────────────────────────
// GET /api/tasks
// Return all tasks for the authenticated user, newest first.
// ──────────────────────────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, title, description, stage, created_at, updated_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error('getTasks error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/tasks
// ──────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  const { title, description = null, stage = 'todo' } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO tasks (user_id, title, description, stage)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, title, description, stage, created_at, updated_at`,
      [req.user.id, title.trim(), description, stage]
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// PUT /api/tasks/:id
// Partial update — build SET clause dynamically.
// Verifies user_id ownership before updating.
// ──────────────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, stage } = req.body;

  try {
    // Verify ownership first
    const existing = await db.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Build dynamic SET clause
    const setClauses = [];
    const values     = [];
    let   idx        = 1;

    if (title !== undefined) {
      setClauses.push(`title = $${idx++}`);
      values.push(title.trim());
    }
    if (description !== undefined) {
      setClauses.push(`description = $${idx++}`);
      values.push(description);
    }
    if (stage !== undefined) {
      setClauses.push(`stage = $${idx++}`);
      values.push(stage);
    }

    values.push(id);        // for WHERE id = $N
    values.push(req.user.id); // for WHERE user_id = $N+1

    const result = await db.query(
      `UPDATE tasks
       SET ${setClauses.join(', ')}
       WHERE id = $${idx} AND user_id = $${idx + 1}
       RETURNING id, user_id, title, description, stage, created_at, updated_at`,
      values
    );

    return res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error('updateTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id
// Verifies user_id ownership before deleting.
// ──────────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    return res.status(200).json({ data: null, message: 'Task deleted.' });
  } catch (err) {
    console.error('deleteTask error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
