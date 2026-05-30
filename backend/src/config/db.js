'use strict';
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL in production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Execute a parameterized SQL query.
 * @param {string} text   SQL string with $1, $2 … placeholders
 * @param {Array}  params Values for the placeholders
 */
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
