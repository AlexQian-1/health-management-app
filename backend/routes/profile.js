const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// GET - Get user profile (includes user account info)
router.get('/', async (req, res) => {
    try {
        const profile = await Profile.getProfile(req.userId);
        // Get user account information
        const user = await User.findById(req.userId);
        
        // Combine profile and user data
        const profileData = profile.toObject();
        profileData.username = user.username;
        profileData.email = user.email;
        
        res.json({ success: true, data: profileData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Update user profile
router.put('/', [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Name cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Name too long'),
    body('age')
        .optional()
        .isInt({ min: 1, max: 150 })
        .withMessage('Age must be between 1 and 150'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
    body('height')
        .optional()
        .isFloat({ min: 0, max: 300 })
        .withMessage('Height must be between 0 and 300 cm'),
    body('activityLevel')
        .optional()
        .isIn(['sedentary', 'light', 'moderate', 'active'])
        .withMessage('Activity level must be sedentary, light, moderate, or active'),
    validate
], async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.userId });
        if (!profile) {
            profile = new Profile({
                ...req.body,
                userId: req.userId
            });
        } else {
            // Update only provided fields
            Object.keys(req.body).forEach(key => {
                if (req.body[key] !== undefined) {
                    profile[key] = req.body[key];
                }
            });
        }
        await profile.save();
        
        // Get user account information to include in response
        const user = await User.findById(req.userId);
        const profileData = profile.toObject();
        profileData.username = user.username;
        profileData.email = user.email;
        
        res.json({ success: true, data: profileData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
