const express = require('express');
const router = express.Router();
const Diet = require('../models/Diet');
const Exercise = require('../models/Exercise');
const Sleep = require('../models/Sleep');
const Weight = require('../models/Weight');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET - Get dashboard data for current user
router.get('/', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const userId = req.userId;
        
        // Get today's data for current user
        const [todayDiet, todayExercise, todaySleep, latestWeight] = await Promise.all([
            Diet.find({ userId, date: today }),
            Exercise.find({ userId, date: today }),
            Sleep.find({ userId, date: today }),
            Weight.findOne({ userId }).sort({ date: -1, time: -1 })
        ]);

        // Calculate today's calories
        const calories = todayDiet.reduce((sum, r) => sum + r.calories, 0);
        
        // Calculate today's exercise duration
        const exercise = todayExercise.reduce((sum, r) => sum + r.duration, 0);
        
        // Calculate today's sleep duration
        let sleep = 0;
        if (todaySleep.length > 0) {
            const latestSleep = todaySleep[todaySleep.length - 1];
            const hours = (new Date(latestSleep.waketime) - new Date(latestSleep.bedtime)) / (1000 * 60 * 60);
            sleep = hours;
        }

        // Get recent activities for current user
        const recentActivities = [];
        
        // Add recent diet records
        const recentDiet = await Diet.find({ userId }).sort({ createdAt: -1 }).limit(3);
        recentDiet.forEach(r => {
            recentActivities.push({
                title: `${r.food} - ${r.calories} kcal`,
                time: `${r.date} ${r.time}`,
                type: 'diet'
            });
        });

        // Add recent exercise records
        const recentExercise = await Exercise.find({ userId }).sort({ createdAt: -1 }).limit(2);
        recentExercise.forEach(r => {
            recentActivities.push({
                title: `${r.type} - ${r.duration} min`,
                time: `${r.date} ${r.time}`,
                type: 'exercise'
            });
        });

        recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
        recentActivities.splice(5); // Keep only the latest 5 records

        res.json({
            success: true,
            data: {
                calories,
                exercise,
                sleep: sleep.toFixed(1),
                weight: latestWeight ? latestWeight.weight : null,
                recentActivities: recentActivities.slice(0, 5)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
