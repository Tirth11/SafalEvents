// Vercel serverless entry point for backend
// This re-exports the Express app for Vercel's serverless functions

import app from '../backend/src/index';

export default app;
