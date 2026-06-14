/**
 * Vercel Serverless Entry Point — MeCHAT API
 *
 * Wraps the Express app so it runs as a Vercel serverless function.
 *
 * Socket.IO note: Vercel serverless functions do not support persistent
 * WebSocket connections. Socket.IO will automatically fall back to HTTP
 * long-polling, which works but means real-time events (typing, presence)
 * may have slightly higher latency. For full WebSocket support deploy the
 * backend separately (Railway / Render / Fly.io) and set VITE_SOCKET_URL
 * in the frontend Vercel environment variables.
 */

'use strict';

const path     = require('path');
const mongoose = require('mongoose');

// Load .env only in local testing; on Vercel the env vars come from the dashboard.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
}

const createApp = require('../backend/app');

// ─── MongoDB connection cache ─────────────────────────────────────────────────
// Vercel may re-use a warm Lambda container, so we cache the connection to
// avoid opening a new one on every request.
let cachedApp = null;
let dbConnected = false;

async function getHandler() {
  // Re-use existing connection if still open
  if (dbConnected && mongoose.connection.readyState === 1 && cachedApp) {
    return cachedApp;
  }

  // Connect (or re-connect) to MongoDB
  if (!dbConnected || mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    dbConnected = true;
  }

  // Build the Express app once per warm container
  if (!cachedApp) {
    cachedApp = createApp();
  }

  return cachedApp;
}

// ─── Vercel handler ───────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  try {
    const app = await getHandler();
    return app(req, res);
  } catch (err) {
    console.error('[api/index] startup error:', err);
    res.status(500).json({ success: false, message: 'Server initialisation failed' });
  }
};
