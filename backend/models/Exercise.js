const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['running', 'walking', 'cycling', 'swimming', 'gym', 'yoga', 'other']
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    intensity: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high']
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);

