const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body } = require('express-validator');
const Sleep = require('../models/Sleep');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// GET - Get all sleep records for current user
router.get('/', async (req, res) => {
    try {
        const records = await Sleep.find({ userId: req.userId }).sort({ date: -1 });
        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Get a single sleep record
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }

        const record = await Sleep.findOne({ _id: req.params.id, userId: req.userId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Create a sleep record
router.post('/', [
    body('bedtime')
        .notEmpty()
        .withMessage('Bedtime is required')
        .isISO8601()
        .withMessage('Bedtime must be a valid date'),
    body('waketime')
        .notEmpty()
        .withMessage('Wake time is required')
        .isISO8601()
        .withMessage('Wake time must be a valid date'),
    body('quality')
        .isIn(['excellent', 'good', 'fair', 'poor'])
        .withMessage('Quality must be excellent, good, fair, or poor'),
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes too long'),
    validate
], async (req, res) => {
    try {
        const record = new Sleep({
            ...req.body,
            userId: req.userId,
            bedtime: new Date(req.body.bedtime),
            waketime: new Date(req.body.waketime)
        });
        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// PUT - Update a sleep record
router.put('/:id', [
    body('bedtime')
        .optional()
        .isISO8601()
        .withMessage('Bedtime must be a valid date'),
    body('waketime')
        .optional()
        .isISO8601()
        .withMessage('Wake time must be a valid date'),
    body('quality')
        .optional()
        .isIn(['excellent', 'good', 'fair', 'poor'])
        .withMessage('Quality must be excellent, good, fair, or poor'),
    body('date')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes too long'),
    validate
], async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }

        const updateData = { ...req.body };
        if (updateData.bedtime) updateData.bedtime = new Date(updateData.bedtime);
        if (updateData.waketime) updateData.waketime = new Date(updateData.waketime);
        
        const record = await Sleep.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            updateData,
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

// DELETE - Delete a sleep record
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid record ID format' });
        }
        
        const record = await Sleep.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
