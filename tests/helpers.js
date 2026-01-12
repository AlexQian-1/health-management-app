// Test helper functions
const User = require('../backend/models/User');
const { generateToken } = require('../backend/middleware/auth');

// Create a test user and return token
async function createTestUser() {
    // Check if test user already exists
    let user = await User.findOne({ username: 'testuser' });
    
    if (!user) {
        user = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpass123'
        });
        await user.save();
    }
    
    // Generate token for test user
    const token = generateToken(user._id);
    return { user, token };
}

// Get auth headers for test requests
async function getAuthHeaders() {
    const { token } = await createTestUser();
    return {
        'Authorization': `Bearer ${token}`
    };
}

module.exports = {
    createTestUser,
    getAuthHeaders
};
