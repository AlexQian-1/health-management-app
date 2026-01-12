const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body } = require('express-validator');
const Exercise = require('../models/Exercise');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// GET - Get all exercise records for current user
router.get('/', async (req, res) => {
    try {
        const records = await Exercise.find({ userId: req.userId }).sort({ date: -1, time: -1 });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Get a single exercise record
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }

        const record = await Exercise.findOne({ _id: req.params.id, userId: req.userId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Create an exercise record
router.post('/', [
    body('type')
        .isIn(['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'other'])
        .withMessage('Invalid exercise type'),
    body('duration')
        .isInt({ min: 1, max: 1440 })
        .withMessage('Duration must be between 1 and 1440 minutes'),
    body('intensity')
        .isIn(['low', 'medium', 'high'])
        .withMessage('Intensity must be low, medium, or high'),
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
        const record = new Exercise({
            ...req.body,
            userId: req.userId
        });
        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT - Update an exercise record
router.put('/:id', [
    body('type')
        .optional()
        .isIn(['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'other'])
        .withMessage('Invalid exercise type'),
    body('duration')
        .optional()
        .isInt({ min: 1, max: 1440 })
        .withMessage('Duration must be between 1 and 1440 minutes'),
    body('intensity')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Intensity must be low, medium, or high'),
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
        
        const record = await Exercise.findOneAndUpdate(
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

// DELETE - Delete an exercise record
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }
        
        const record = await Exercise.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
