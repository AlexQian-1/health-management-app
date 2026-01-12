const express = require('express');
const router = express.Router();
const Diet = require('../models/Diet');
const Exercise = require('../models/Exercise');
const Sleep = require('../models/Sleep');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET - Get statistics data for current user
router.get('/', async (req, res) => {
    try {
        const { period } = req.query; // week, month, quarter, year
        const userId = req.userId;
        const now = new Date();
        let startDate;

        switch(period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                // Quarter is 4 months: current month and previous 3 months
                const currentMonth = now.getMonth();
                const quarterStartMonth = currentMonth >= 3 ? currentMonth - 3 : 0;
                const quarterStartYear = currentMonth >= 3 ? now.getFullYear() : now.getFullYear();
                startDate = new Date(quarterStartYear, quarterStartMonth, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = now.toISOString().split('T')[0];

        // Get data for current user
        const [dietRecords, exerciseRecords, sleepRecords] = await Promise.all([
            Diet.find({ userId, date: { $gte: startDateStr, $lte: endDateStr } }),
            Exercise.find({ userId, date: { $gte: startDateStr, $lte: endDateStr } }),
            Sleep.find({ userId, date: { $gte: startDateStr, $lte: endDateStr } })
        ]);

        // Calculate statistics
        const totalCalories = dietRecords.reduce((sum, r) => sum + r.calories, 0);
        const totalExercise = exerciseRecords.reduce((sum, r) => sum + r.duration, 0);
        const avgSleep = sleepRecords.length > 0 
            ? sleepRecords.reduce((sum, r) => {
                const hours = (new Date(r.waketime) - new Date(r.bedtime)) / (1000 * 60 * 60);
                return sum + hours;
            }, 0) / sleepRecords.length 
            : 0;

        // Prepare chart data based on time range
        let caloriesChartData, exerciseChartData, sleepChartData;

        if (period === 'year') {
            // Group by month (January to December)
            const caloriesByMonth = {};
            const exerciseByMonth = {};
            const sleepByMonth = {};

            dietRecords.forEach(r => {
                const month = new Date(r.date).getMonth();
                caloriesByMonth[month] = (caloriesByMonth[month] || 0) + r.calories;
            });

            exerciseRecords.forEach(r => {
                const month = new Date(r.date).getMonth();
                exerciseByMonth[month] = (exerciseByMonth[month] || 0) + r.duration;
            });

            sleepRecords.forEach(r => {
                const month = new Date(r.date).getMonth();
                const hours = (new Date(r.waketime) - new Date(r.bedtime)) / (1000 * 60 * 60);
                if (!sleepByMonth[month]) sleepByMonth[month] = { total: 0, count: 0 };
                sleepByMonth[month].total += hours;
                sleepByMonth[month].count += 1;
            });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            caloriesChartData = monthNames.map((name, month) => ({
                label: name,
                value: caloriesByMonth[month] || 0
            }));

            exerciseChartData = monthNames.map((name, month) => ({
                label: name,
                value: exerciseByMonth[month] || 0
            }));

            sleepChartData = monthNames.map((name, month) => ({
                label: name,
                value: sleepByMonth[month] ? (sleepByMonth[month].total / sleepByMonth[month].count) : 0
            }));

        } else if (period === 'quarter') {
            // Group by month (quarter is 4 months: current month and previous 3 months)
            const currentMonth = now.getMonth();
            const quarterStartMonth = currentMonth >= 3 ? currentMonth - 3 : 0;
            const monthCount = 4;
            
            const caloriesByMonth = {};
            const exerciseByMonth = {};
            const sleepByMonth = {};

            dietRecords.forEach(r => {
                const recordDate = new Date(r.date);
                const recordMonth = recordDate.getMonth();
                const recordYear = recordDate.getFullYear();
                // Check if within quarter range
                if (recordYear === now.getFullYear() && recordMonth >= quarterStartMonth && recordMonth <= currentMonth) {
                    caloriesByMonth[recordMonth] = (caloriesByMonth[recordMonth] || 0) + r.calories;
                }
            });

            exerciseRecords.forEach(r => {
                const recordDate = new Date(r.date);
                const recordMonth = recordDate.getMonth();
                const recordYear = recordDate.getFullYear();
                if (recordYear === now.getFullYear() && recordMonth >= quarterStartMonth && recordMonth <= currentMonth) {
                    exerciseByMonth[recordMonth] = (exerciseByMonth[recordMonth] || 0) + r.duration;
                }
            });

            sleepRecords.forEach(r => {
                const recordDate = new Date(r.date);
                const recordMonth = recordDate.getMonth();
                const recordYear = recordDate.getFullYear();
                if (recordYear === now.getFullYear() && recordMonth >= quarterStartMonth && recordMonth <= currentMonth) {
                    const hours = (new Date(r.waketime) - new Date(r.bedtime)) / (1000 * 60 * 60);
                    if (!sleepByMonth[recordMonth]) sleepByMonth[recordMonth] = { total: 0, count: 0 };
                    sleepByMonth[recordMonth].total += hours;
                    sleepByMonth[recordMonth].count += 1;
                }
            });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            caloriesChartData = [];
            exerciseChartData = [];
            sleepChartData = [];

            for (let i = 0; i < monthCount; i++) {
                const month = quarterStartMonth + i;
                if (month <= currentMonth) {
                    caloriesChartData.push({
                        label: monthNames[month],
                        value: caloriesByMonth[month] || 0
                    });
                    exerciseChartData.push({
                        label: monthNames[month],
                        value: exerciseByMonth[month] || 0
                    });
                    sleepChartData.push({
                        label: monthNames[month],
                        value: sleepByMonth[month] ? (sleepByMonth[month].total / sleepByMonth[month].count) : 0
                    });
                }
            }

        } else {
            // week and month: group by date
            const caloriesByDate = {};
            const exerciseByDate = {};
            const sleepByDate = {};

            dietRecords.forEach(r => {
                caloriesByDate[r.date] = (caloriesByDate[r.date] || 0) + r.calories;
            });

            exerciseRecords.forEach(r => {
                exerciseByDate[r.date] = (exerciseByDate[r.date] || 0) + r.duration;
            });

            sleepRecords.forEach(r => {
                const hours = (new Date(r.waketime) - new Date(r.bedtime)) / (1000 * 60 * 60);
                sleepByDate[r.date] = hours;
            });

            // Generate date array
            const dates = [];
            const currentDate = new Date(startDate);
            while (currentDate <= now) {
                dates.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Determine how many days of data to display based on time range
            const displayDates = period === 'week' ? dates.slice(-7) : dates;

            caloriesChartData = displayDates.map(date => ({
                label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: caloriesByDate[date] || 0
            }));

            exerciseChartData = displayDates.map(date => ({
                label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: exerciseByDate[date] || 0
            }));

            sleepChartData = displayDates.map(date => ({
                label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: sleepByDate[date] || 0
            }));
        }

        res.json({
            success: true,
            data: {
                period,
                calories: {
                    total: totalCalories,
                    average: dietRecords.length > 0 ? totalCalories / dietRecords.length : 0,
                    count: dietRecords.length,
                    chartData: caloriesChartData
                },
                exercise: {
                    total: totalExercise,
                    average: exerciseRecords.length > 0 ? totalExercise / exerciseRecords.length : 0,
                    count: exerciseRecords.length,
                    chartData: exerciseChartData
                },
                sleep: {
                    average: avgSleep,
                    count: sleepRecords.length,
                    chartData: sleepChartData
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
