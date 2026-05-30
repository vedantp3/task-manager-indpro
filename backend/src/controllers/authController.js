'use strict';
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

const SALT_ROUNDS = 10;

/**
 * Sign a JWT for the given user.
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ──────────────────────────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for existing email
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email.trim().toLowerCase(), password_hash]
    );

    const user  = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      data: {
        token,
        user: { id: user.id, email: user.email },
      },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  // Generic message — never reveal which field is wrong
  const INVALID_MSG = 'Invalid credentials.';

  try {
    const result = await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: INVALID_MSG });
    }

    const user  = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: INVALID_MSG });
    }

    const token = signToken(user);

    return res.status(200).json({
      data: {
        token,
        user: { id: user.id, email: user.email },
      },
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ──────────────────────────────────────────────────────────────
const getMe = (req, res) => {
  // req.user is set by the auth middleware — no DB call needed
  return res.status(200).json({
    data: { user: req.user },
  });
};

module.exports = { register, login, getMe };
