'use strict';
const express    = require('express');
const router     = express.Router();
const authenticate          = require('../middleware/auth');
const { validateRegister }  = require('../middleware/validate');
const { register, login, getMe } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

module.exports = router;
