const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body } = require('express-validator');
const Goal = require('../models/Goal');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// GET - Get all health goals for current user
router.get('/', async (req, res) => {
    try {
        const { completed } = req.query;
        const query = { userId: req.userId };
        
        if (completed !== undefined) {
            query.completed = completed === 'true';
        }
        
        const goals = await Goal.find(query).sort({ deadline: 1 });
        res.json({ success: true, data: goals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Get a single health goal
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid goal ID format' });
        }

        const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }
        res.json({ success: true, data: goal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Create a health goal
router.post('/', [
    body('type')
        .isIn(['weight', 'calories', 'exercise', 'sleep'])
        .withMessage('Goal type must be weight, calories, exercise, or sleep'),
    body('target')
        .isFloat({ min: 0.1 })
        .withMessage('Target must be a positive number'),
    body('deadline')
        .notEmpty()
        .withMessage('Deadline is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Deadline must be in YYYY-MM-DD format'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description too long'),
    validate
], async (req, res) => {
    try {
        const goal = new Goal({
            ...req.body,
            userId: req.userId
        });
        await goal.save();
        res.status(201).json({ success: true, data: goal });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT - Update a health goal
router.put('/:id', [
    body('type')
        .optional()
        .isIn(['weight', 'calories', 'exercise', 'sleep'])
        .withMessage('Goal type must be weight, calories, exercise, or sleep'),
    body('target')
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage('Target must be a positive number'),
    body('deadline')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Deadline must be in YYYY-MM-DD format'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description too long'),
    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean'),
    validate
], async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid goal ID format' });
        }
        
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }
        res.json({ success: true, data: goal });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE - Delete a health goal
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid goal ID format' });
        }
        
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }
        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
