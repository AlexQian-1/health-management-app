const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 1,
        max: 150
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    height: {
        type: Number,
        required: true,
        min: 0
    },
    activityLevel: {
        type: String,
        required: true,
        enum: ['sedentary', 'light', 'moderate', 'active']
    }
}, {
    timestamps: true
});

// Get profile for a specific user
profileSchema.statics.getProfile = async function(userId) {
    let profile = await this.findOne({ userId });
    if (!profile) {
        profile = await this.create({
            userId,
            name: 'User',
            age: 25,
            gender: 'male',
            height: 170,
            activityLevel: 'moderate'
        });
    }
    return profile;
};

module.exports = mongoose.model('Profile', profileSchema);

