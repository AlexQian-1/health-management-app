// Data manager class
import { ChartRenderer } from './ChartRenderer.js';

export class DataManager {
    constructor(apiClient, messageManager) {
        this.apiClient = apiClient;
        this.messageManager = messageManager;
        this.cache = new Map();
        this.chartRenderer = new ChartRenderer();
    }

    // Load dashboard data
    async loadDashboardData() {
        try {
            const response = await this.apiClient.getDashboardData();
            // API response format may be { success: true, data: {...} } or directly data
            const data = response.data || response;
            this.updateDashboard(data);
        } catch (error) {
            this.messageManager.show('Failed to load dashboard data', 'error');
        }
    }

    // Update dashboard display
    updateDashboard(data) {
        // Ensure data is an object, extract data field if it's a response object
        const dashboardData = data.data || data;
        
        const caloriesEl = document.getElementById('calories-today');
        const exerciseEl = document.getElementById('exercise-today');
        const sleepEl = document.getElementById('sleep-today');
        const weightEl = document.getElementById('weight-current');

        if (caloriesEl) caloriesEl.textContent = dashboardData.calories || 0;
        if (exerciseEl) exerciseEl.textContent = dashboardData.exercise || 0;
        if (sleepEl) sleepEl.textContent = dashboardData.sleep || 0;
        if (weightEl) weightEl.textContent = dashboardData.weight || '--';

        // Update recent activities
        this.updateRecentActivities(dashboardData.recentActivities || []);
    }

    // Update recent activities list
    updateRecentActivities(activities) {
        const listEl = document.getElementById('recent-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        activities.forEach(activity => {
            const li = document.createElement('li');
            li.className = 'activity-item';
            li.innerHTML = `
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            `;
            listEl.appendChild(li);
        });
    }

    // Load diet records
    async loadDietRecords(startDate, endDate) {
        try {
            const records = await this.apiClient.getDietRecords(startDate, endDate);
            this.renderDietRecords(records);
        } catch (error) {
            this.messageManager.show('Failed to load diet records', 'error');
        }
    }

    // Render diet records
    renderDietRecords(records) {
        const listEl = document.getElementById('diet-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        records.forEach(record => {
            const li = document.createElement('li');
            li.className = 'record-item';
            li.innerHTML = `
                <div class="record-info">
                    <div class="record-title">${record.food} - ${this.getMealName(record.meal)}</div>
                    <div class="record-meta">${record.calories} kcal | ${record.date} ${record.time}</div>
                </div>
                <div class="record-actions">
                    <button class="btn btn-secondary btn-small edit-diet" data-id="${record._id}">Edit</button>
                    <button class="btn btn-danger btn-small delete-diet" data-id="${record._id}">Delete</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    // Load exercise records
    async loadExerciseRecords() {
        try {
            const records = await this.apiClient.getExerciseRecords();
            this.renderExerciseRecords(records);
        } catch (error) {
            this.messageManager.show('Failed to load exercise records', 'error');
        }
    }

    // Render exercise records
    renderExerciseRecords(records) {
        const listEl = document.getElementById('exercise-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        records.forEach(record => {
            const li = document.createElement('li');
            li.className = 'record-item';
            li.innerHTML = `
                <div class="record-info">
                    <div class="record-title">${this.getExerciseTypeName(record.type)}</div>
                    <div class="record-meta">${record.duration} min | ${this.getIntensityName(record.intensity)} | ${record.date} ${record.time}</div>
                </div>
                <div class="record-actions">
                    <button class="btn btn-secondary btn-small edit-exercise" data-id="${record._id}">Edit</button>
                    <button class="btn btn-danger btn-small delete-exercise" data-id="${record._id}">Delete</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    // Load sleep records
    async loadSleepRecords() {
        try {
            const records = await this.apiClient.getSleepRecords();
            this.renderSleepRecords(records);
        } catch (error) {
            this.messageManager.show('Failed to load sleep records', 'error');
        }
    }

    // Render sleep records
    renderSleepRecords(records) {
        const listEl = document.getElementById('sleep-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        records.forEach(record => {
            const hours = this.calculateSleepHours(record.bedtime, record.waketime);
            const li = document.createElement('li');
            li.className = 'record-item';
            li.innerHTML = `
                <div class="record-info">
                    <div class="record-title">Sleep Duration: ${hours.toFixed(1)} hours</div>
                    <div class="record-meta">${this.getQualityName(record.quality)} | ${record.date}</div>
                </div>
                <div class="record-actions">
                    <button class="btn btn-secondary btn-small edit-sleep" data-id="${record._id}">Edit</button>
                    <button class="btn btn-danger btn-small delete-sleep" data-id="${record._id}">Delete</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    // Load weight records
    async loadWeightRecords() {
        try {
            const records = await this.apiClient.getWeightRecords();
            this.renderWeightRecords(records);
        } catch (error) {
            this.messageManager.show('Failed to load weight records', 'error');
        }
    }

    // Render weight records
    renderWeightRecords(records) {
        const listEl = document.getElementById('weight-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        records.forEach(record => {
            const li = document.createElement('li');
            li.className = 'record-item';
            li.innerHTML = `
                <div class="record-info">
                    <div class="record-title">${record.weight} kg</div>
                    <div class="record-meta">${record.date} ${record.time}</div>
                </div>
                <div class="record-actions">
                    <button class="btn btn-secondary btn-small edit-weight" data-id="${record._id}">Edit</button>
                    <button class="btn btn-danger btn-small delete-weight" data-id="${record._id}">Delete</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }


    // Load health goals
    async loadGoals() {
        try {
            const goals = await this.apiClient.getGoals();
            await this.renderGoals(goals);
        } catch (error) {
            this.messageManager.show('Failed to load health goals', 'error');
        }
    }

    // Render health goals
    async renderGoals(goals) {
        const listEl = document.getElementById('goals-list');
        if (!listEl) return;

        listEl.innerHTML = '';
        
        if (!goals || goals.length === 0) {
            listEl.innerHTML = '<li class="record-item"><div class="record-info"><div class="record-title">No health goals</div><div class="record-meta">Please create a health goal</div></div></li>';
            return;
        }

        // Asynchronously calculate progress for each goal
        const goalsWithProgress = await Promise.all(
            goals.map(async (goal) => {
                const progress = await this.calculateGoalProgress(goal);
                return { ...goal, progress };
            })
        );

        goalsWithProgress.forEach(goal => {
            const li = document.createElement('li');
            li.className = 'record-item';
            const progressBar = this.createProgressBar(goal.progress);
            li.innerHTML = `
                <div class="record-info">
                    <div class="record-title">${this.getGoalTypeName(goal.type)}: ${goal.target} ${this.getGoalUnit(goal.type)}</div>
                    <div class="record-meta">Progress: ${goal.progress}% | Deadline: ${goal.deadline}</div>
                    ${progressBar}
                </div>
                <div class="record-actions">
                    <button class="btn btn-secondary btn-small edit-goal" data-id="${goal._id}">Edit</button>
                    <button class="btn btn-danger btn-small delete-goal" data-id="${goal._id}">Delete</button>
                </div>
            `;
            listEl.appendChild(li);
        });
    }

    // Create progress bar
    createProgressBar(progress) {
        return `
            <div class="goal-progress-bar" style="margin-top: 0.5rem; width: 100%; height: 8px; background: rgba(0, 212, 255, 0.1); border-radius: 4px; overflow: hidden;">
                <div class="goal-progress-fill" style="width: ${Math.min(100, Math.max(0, progress))}%; height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff88); transition: width 0.3s; box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);"></div>
            </div>
        `;
    }

    // Load user profile
    async loadProfile() {
        try {
            const profile = await this.apiClient.getProfile();
            this.populateProfileForm(profile);
        } catch (error) {
            this.messageManager.show('Failed to load user profile', 'error');
        }
    }

    // Fill profile form
    populateProfileForm(profile) {
        if (profile.name) document.getElementById('profile-name').value = profile.name;
        if (profile.age) document.getElementById('profile-age').value = profile.age;
        if (profile.gender) document.getElementById('profile-gender').value = profile.gender;
        if (profile.height) document.getElementById('profile-height').value = profile.height;
        if (profile.activityLevel) document.getElementById('profile-activity').value = profile.activityLevel;
    }

    // Load statistics data
    async loadStatistics(period = 'month') {
        try {
            // Show loading state
            this.showLoadingState();
            
            const stats = await this.apiClient.getStatistics(period);
            
            // Render statistics data
            this.renderStatistics(stats);
            
            // Hide loading state
            this.hideLoadingState();
        } catch (error) {
            this.hideLoadingState();
            this.messageManager.show('Failed to load statistics data: ' + error.message, 'error');
        }
    }

    // Show loading state
    showLoadingState() {
        const containers = ['calories-chart', 'exercise-chart', 'sleep-chart'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">Loading...</div>';
            }
        });
    }

    // Hide loading state
    hideLoadingState() {
        // Loading state will be replaced in renderStatistics, no additional action needed here
    }

    // Render statistics data
    renderStatistics(stats) {
        // ApiClient.get() already returns response.data, so stats is the data object
        if (!stats) {
            this.showNoDataMessage('calories-chart');
            this.showNoDataMessage('exercise-chart');
            this.showNoDataMessage('sleep-chart');
            return;
        }

        // Render calories statistics (bar chart)
        if (stats.calories) {
            const caloriesData = this.prepareCaloriesChartData(stats.calories);
            if (caloriesData && caloriesData.length > 0) {
                this.chartRenderer.renderBarChart('calories-chart', caloriesData, {
                    title: 'Calories Statistics',
                    color: this.chartRenderer.colors.primary
                });
            } else {
                this.showNoDataMessage('calories-chart');
            }
        } else {
            this.showNoDataMessage('calories-chart');
        }

        // Render exercise statistics (bar chart)
        if (stats.exercise) {
            const exerciseData = this.prepareExerciseChartData(stats.exercise);
            if (exerciseData && exerciseData.length > 0) {
                this.chartRenderer.renderBarChart('exercise-chart', exerciseData, {
                    title: 'Exercise Statistics',
                    color: this.chartRenderer.colors.secondary
                });
            } else {
                this.showNoDataMessage('exercise-chart');
            }
        } else {
            this.showNoDataMessage('exercise-chart');
        }

        // Render sleep statistics (line chart)
        if (stats.sleep) {
            const sleepData = this.prepareSleepChartData(stats.sleep);
            if (sleepData && sleepData.length > 0) {
                this.chartRenderer.renderLineChart('sleep-chart', sleepData, {
                    title: 'Sleep Statistics',
                    color: this.chartRenderer.colors.warning
                });
            } else {
                this.showNoDataMessage('sleep-chart');
            }
        } else {
            this.showNoDataMessage('sleep-chart');
        }
    }

    // Show no data message
    showNoDataMessage(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <p>No data</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Please add some records first</p>
            </div>
        `;
    }

    // Prepare calories chart data
    prepareCaloriesChartData(caloriesData) {
        if (!caloriesData) {
            return [];
        }
        
        if (caloriesData.chartData && Array.isArray(caloriesData.chartData) && caloriesData.chartData.length > 0) {
            // Use chart data provided by backend
            return caloriesData.chartData.map(item => ({
                label: item.label || '',
                value: Number(item.value) || 0,
                color: '#4a90e2'
            }));
        }
        
        // If no chart data, show summary data
        const summaryData = [];
        if (caloriesData.total !== undefined) {
            summaryData.push({ label: 'Total Calories', value: Math.round(caloriesData.total), color: '#4a90e2' });
        }
        if (caloriesData.average !== undefined) {
            summaryData.push({ label: 'Average Calories', value: Math.round(caloriesData.average), color: '#50c878' });
        }
        if (caloriesData.count !== undefined) {
            summaryData.push({ label: 'Record Count', value: caloriesData.count, color: '#f39c12' });
        }
        
        return summaryData.length > 0 ? summaryData : [];
    }

    // Prepare exercise chart data
    prepareExerciseChartData(exerciseData) {
        if (!exerciseData) {
            return [];
        }
        
        if (exerciseData.chartData && Array.isArray(exerciseData.chartData) && exerciseData.chartData.length > 0) {
            return exerciseData.chartData.map(item => ({
                label: item.label || '',
                value: Number(item.value) || 0,
                color: '#50c878'
            }));
        }
        
        const summaryData = [];
        if (exerciseData.total !== undefined) {
            summaryData.push({ label: 'Total Duration', value: Math.round(exerciseData.total), color: '#50c878' });
        }
        if (exerciseData.average !== undefined) {
            summaryData.push({ label: 'Average Duration', value: Math.round(exerciseData.average), color: '#4a90e2' });
        }
        if (exerciseData.count !== undefined) {
            summaryData.push({ label: 'Record Count', value: exerciseData.count, color: '#f39c12' });
        }
        
        return summaryData.length > 0 ? summaryData : [];
    }

    // Prepare sleep chart data
    prepareSleepChartData(sleepData) {
        if (!sleepData) {
            return [];
        }
        
        if (sleepData.chartData && Array.isArray(sleepData.chartData) && sleepData.chartData.length > 0) {
            return sleepData.chartData.map(item => ({
                label: item.label || '',
                value: Number(item.value) || 0,
                color: '#f39c12'
            }));
        }
        
        const summaryData = [];
        if (sleepData.average !== undefined) {
            summaryData.push({ label: 'Average Sleep', value: Number(sleepData.average), color: '#f39c12' });
        }
        if (sleepData.count !== undefined) {
            summaryData.push({ label: 'Record Count', value: sleepData.count, color: '#4a90e2' });
        }
        
        return summaryData.length > 0 ? summaryData : [];
    }

    // Utility methods
    getMealName(meal) {
        const meals = {
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            snack: 'Snack'
        };
        return meals[meal] || meal;
    }

    getExerciseTypeName(type) {
        const types = {
            running: 'Running',
            walking: 'Walking',
            cycling: 'Cycling',
            swimming: 'Swimming',
            gym: 'Gym',
            yoga: 'Yoga',
            other: 'Other'
        };
        return types[type] || type;
    }

    getIntensityName(intensity) {
        const intensities = {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
        };
        return intensities[intensity] || intensity;
    }

    getQualityName(quality) {
        const qualities = {
            excellent: 'Excellent',
            good: 'Good',
            fair: 'Fair',
            poor: 'Poor'
        };
        return qualities[quality] || quality;
    }


    getGoalTypeName(type) {
        const types = {
            weight: 'Weight',
            calories: 'Calories',
            exercise: 'Exercise',
            sleep: 'Sleep'
        };
        return types[type] || type;
    }

    getGoalUnit(type) {
        const units = {
            weight: 'kg',
            calories: 'kcal',
            exercise: 'min',
            sleep: 'hours'
        };
        return units[type] || '';
    }

    calculateSleepHours(bedtime, waketime) {
        const bed = new Date(bedtime);
        const wake = new Date(waketime);
        const diff = wake - bed;
        return diff / (1000 * 60 * 60);
    }

    // Calculate goal progress
    async calculateGoalProgress(goal) {
        if (!goal || !goal.type || !goal.target) {
            return 0;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            const deadline = new Date(goal.deadline);
            // Use createdAt or 30 days ago as start date (if goal has no creation time)
            let startDate;
            if (goal.createdAt) {
                startDate = new Date(goal.createdAt).toISOString().split('T')[0];
            } else {
                // Default to start calculating from 30 days ago
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                startDate = thirtyDaysAgo.toISOString().split('T')[0];
            }
            const endDate = deadline < new Date() ? deadline.toISOString().split('T')[0] : today;

            let currentValue = 0;
            let progress = 0;

            switch (goal.type) {
                case 'weight':
                    // Weight goal: calculate weight change from start to now
                    const weightRecords = await this.apiClient.getWeightRecords();
                    const relevantWeights = weightRecords.filter(w => 
                        w.date >= startDate && w.date <= endDate
                    );
                    if (relevantWeights.length > 0) {
                        const latestWeight = relevantWeights[relevantWeights.length - 1].weight;
                        const initialWeight = relevantWeights[0].weight;
                        const weightChange = Math.abs(latestWeight - initialWeight);
                        const targetChange = Math.abs(goal.target - initialWeight);
                        if (targetChange > 0) {
                            progress = Math.min(100, Math.round((weightChange / targetChange) * 100));
                        }
                    }
                    break;

                case 'calories':
                    // Calories goal: calculate cumulative calories from start to now
                    const dietRecords = await this.apiClient.getDietRecords(startDate, endDate);
                    currentValue = dietRecords.reduce((sum, r) => sum + (r.calories || 0), 0);
                    if (goal.target > 0) {
                        progress = Math.min(100, Math.round((currentValue / goal.target) * 100));
                    }
                    break;

                case 'exercise':
                    // Exercise goal: calculate cumulative exercise duration from start to now
                    const exerciseRecords = await this.apiClient.getExerciseRecords();
                    const relevantExercise = exerciseRecords.filter(e => 
                        e.date >= startDate && e.date <= endDate
                    );
                    currentValue = relevantExercise.reduce((sum, r) => sum + (r.duration || 0), 0);
                    if (goal.target > 0) {
                        progress = Math.min(100, Math.round((currentValue / goal.target) * 100));
                    }
                    break;

                case 'sleep':
                    // Sleep goal: calculate average sleep duration from start to now
                    const sleepRecords = await this.apiClient.getSleepRecords();
                    const relevantSleep = sleepRecords.filter(s => 
                        s.date >= startDate && s.date <= endDate
                    );
                    if (relevantSleep.length > 0) {
                        const totalHours = relevantSleep.reduce((sum, r) => {
                            const hours = this.calculateSleepHours(r.bedtime, r.waketime);
                            return sum + hours;
                        }, 0);
                        currentValue = totalHours / relevantSleep.length;
                        if (goal.target > 0) {
                            progress = Math.min(100, Math.round((currentValue / goal.target) * 100));
                        }
                    }
                    break;

                default:
                    progress = 0;
            }

            // If deadline has passed and progress hasn't reached 100%, check if completed
            if (deadline < new Date() && progress >= 100) {
                return 100;
            }

            return Math.max(0, Math.min(100, progress));
        } catch (error) {
            return 0;
        }
    }
}

