const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    bedtime: {
        type: Date,
        required: true
    },
    waketime: {
        type: Date,
        required: true
    },
    quality: {
        type: String,
        required: true,
        enum: ['excellent', 'good', 'fair', 'poor']
    },
    notes: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sleep', sleepSchema);

