// Vercel serverless function entry point
// This file is used by Vercel to handle all requests

const app = require('../backend/server');

// Export as handler function for Vercel
// Vercel expects a function that receives (req, res)
module.exports = (req, res) => {
    // Delegate to Express app
    return app(req, res);
};
