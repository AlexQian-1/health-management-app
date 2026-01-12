const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body } = require('express-validator');
const Diet = require('../models/Diet');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// GET - Get all diet records for current user (supports date filtering)
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { userId: req.userId };
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }
        
        const records = await Diet.find(query).sort({ date: -1, time: -1 });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Get a single diet record
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }

        const record = await Diet.findOne({ _id: req.params.id, userId: req.userId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Create a diet record
router.post('/', [
    body('meal')
        .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
        .withMessage('Meal must be breakfast, lunch, dinner, or snack'),
    body('food')
        .trim()
        .notEmpty()
        .withMessage('Food name is required')
        .isLength({ max: 200 })
        .withMessage('Food name too long'),
    body('calories')
        .isFloat({ min: 0, max: 10000 })
        .withMessage('Calories must be between 0 and 10000'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),
    body('time')
        .notEmpty()
        .withMessage('Time is required')
        .matches(/^\d{2}:\d{2}$/)
        .withMessage('Time must be in HH:MM format'),
    validate
], async (req, res) => {
    try {
        const record = new Diet({
            ...req.body,
            userId: req.userId
        });
        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT - Update a diet record
router.put('/:id', [
    body('meal')
        .optional()
        .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
        .withMessage('Meal must be breakfast, lunch, dinner, or snack'),
    body('food')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Food name cannot be empty')
        .isLength({ max: 200 })
        .withMessage('Food name too long'),
    body('calories')
        .optional()
        .isFloat({ min: 0, max: 10000 })
        .withMessage('Calories must be between 0 and 10000'),
    body('date')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),
    body('time')
        .optional()
        .matches(/^\d{2}:\d{2}$/)
        .withMessage('Time must be in HH:MM format'),
    validate
], async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }
        
        const record = await Diet.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE - Delete a diet record
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }
        
        const record = await Diet.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
