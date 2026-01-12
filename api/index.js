// Vercel serverless function entry point
// This file is used by Vercel to handle all requests

let app;
try {
    app = require('../backend/server');
} catch (error) {
    console.error('Failed to load server:', error);
    // Return error handler if server fails to load
    module.exports = (req, res) => {
        res.status(500).json({
            success: false,
            message: 'Server initialization failed',
            error: error.message
        });
    };
    return;
}

// Export as handler function for Vercel
// Vercel expects a function that receives (req, res)
module.exports = (req, res) => {
    try {
        // Delegate to Express app
        return app(req, res);
    } catch (error) {
        console.error('Request handler error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
};
