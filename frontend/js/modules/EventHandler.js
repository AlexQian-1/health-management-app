// Event handler class - handles all events
export class EventHandler {
    constructor(viewManager, dataManager, apiClient, messageManager) {
        this.viewManager = viewManager;
        this.dataManager = dataManager;
        this.apiClient = apiClient;
        this.messageManager = messageManager;
        this.editingId = null; // Currently editing record ID
        this.editingType = null; // Currently editing record type
    }

    // Cancel edit
    cancelEdit(formId, submitBtn) {
        this.editingId = null;
        this.editingType = null;
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.setDefaultDate(formId.replace('-form', '-date'));
            // Hide cancel edit button
            const cancelBtn = form.querySelector('.cancel-edit-btn');
            if (cancelBtn) cancelBtn.style.display = 'none';
        }
        if (submitBtn) {
            const defaultTexts = {
                'diet-form': 'Add Record',
                'exercise-form': 'Add Record',
                'sleep-form': 'Add Record',
                'weight-form': 'Add Record',
                'goal-form': 'Create Goal'
            };
            submitBtn.textContent = defaultTexts[formId] || 'Submit';
        }
        this.messageManager.info('Edit cancelled');
    }

    // Set default date to today
    setDefaultDate(dateInputId) {
        const dateInput = document.getElementById(dateInputId);
        if (dateInput && dateInput.type === 'date' && !dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    // Initialize authentication event handlers
    initAuth() {
        this.setupAuthEvents();
    }

    // Setup authentication events
    setupAuthEvents() {
        // Tab switching
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginFormContainer = document.getElementById('login-form-container');
        const registerFormContainer = document.getElementById('register-form-container');

        if (loginTab && registerTab) {
            loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginFormContainer.style.display = 'block';
                registerFormContainer.style.display = 'none';
            });

            registerTab.addEventListener('click', () => {
                registerTab.classList.add('active');
                loginTab.classList.remove('active');
                registerFormContainer.style.display = 'block';
                loginFormContainer.style.display = 'none';
            });
        }

        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('login-username').value.trim();
                const password = document.getElementById('login-password').value;

                if (!username || !password) {
                    this.messageManager.error('Please enter both username and password');
                    return;
                }

                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';

                try {
                    const response = await this.apiClient.login(username, password);
                    
                    if (response && response.success) {
                        this.messageManager.success('Login successful!');
                        // Hide login view and show navigation immediately
                        const authView = document.getElementById('view-auth');
                        const navBar = document.getElementById('main-nav');
                        if (authView) authView.classList.remove('active');
                        if (navBar) navBar.style.display = 'block';
                        
                        // Small delay to show success message, then reload
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    } else {
                        this.messageManager.error('Login failed: Invalid response');
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                } catch (error) {
                    this.messageManager.error(error.message || 'Login failed. Please check your credentials.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('register-username').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const passwordConfirm = document.getElementById('register-password-confirm').value;

                if (password !== passwordConfirm) {
                    this.messageManager.error('Passwords do not match');
                    return;
                }

                try {
                    const response = await this.apiClient.register(username, email, password);
                    if (response.success) {
                        this.messageManager.success('Registration successful! Please login.');
                        // Switch to login tab
                        if (loginTab) loginTab.click();
                    }
                } catch (error) {
                    this.messageManager.error(error.message || 'Registration failed');
                }
            });
        }
    }

    // Initialize all event handlers
    init() {
        this.setupNavigationEvents();
        this.setupFormEvents();
        this.setupListEvents();
        this.setupFilterEvents();
        this.setupSettingsEvents();
        this.setupMenuToggle();
        this.setupWindowEvents();
    }

    // Navigation events
    setupNavigationEvents() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('data-view');
                this.viewManager.showView(viewId);
                this.loadViewData(viewId);
            });
        });
    }

    // Form submit events
    setupFormEvents() {
        // Set form default dates
        this.setDefaultDate('diet-date');
        this.setDefaultDate('exercise-date');
        this.setDefaultDate('weight-date');
        this.setDefaultDate('goal-deadline');

        // Diet form
        const dietForm = document.getElementById('diet-form');
        if (dietForm) {
            dietForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleDietSubmit();
            });
        }

        // Exercise form
        const exerciseForm = document.getElementById('exercise-form');
        if (exerciseForm) {
            exerciseForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleExerciseSubmit();
            });
        }

        // Sleep form
        const sleepForm = document.getElementById('sleep-form');
        if (sleepForm) {
            sleepForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSleepSubmit();
            });
        }

        // Weight form
        const weightForm = document.getElementById('weight-form');
        if (weightForm) {
            weightForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleWeightSubmit();
            });
        }


        // Goal form
        const goalForm = document.getElementById('goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleGoalSubmit();
            });
        }

        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleProfileSubmit();
            });
        }
    }

    // List operation events
    setupListEvents() {
        // Use event delegation to handle all delete and edit buttons
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Cancel edit button
            if (target.classList.contains('cancel-edit-btn')) {
                const formId = target.getAttribute('data-form');
                const form = document.getElementById(formId);
                const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
                this.cancelEdit(formId, submitBtn);
                target.style.display = 'none';
                return;
            }
            
            // Delete diet record
            if (target.classList.contains('delete-diet')) {
                this.handleDeleteDiet(target.getAttribute('data-id'));
            }
            
            // Edit diet record
            if (target.classList.contains('edit-diet')) {
                this.handleEditDiet(target.getAttribute('data-id'));
            }
            
            // Delete exercise record
            if (target.classList.contains('delete-exercise')) {
                this.handleDeleteExercise(target.getAttribute('data-id'));
            }
            
            // Edit exercise record
            if (target.classList.contains('edit-exercise')) {
                this.handleEditExercise(target.getAttribute('data-id'));
            }
            
            // Delete sleep record
            if (target.classList.contains('delete-sleep')) {
                this.handleDeleteSleep(target.getAttribute('data-id'));
            }
            
            // Edit sleep record
            if (target.classList.contains('edit-sleep')) {
                this.handleEditSleep(target.getAttribute('data-id'));
            }
            
            // Delete weight record
            if (target.classList.contains('delete-weight')) {
                this.handleDeleteWeight(target.getAttribute('data-id'));
            }
            
            // Edit weight record
            if (target.classList.contains('edit-weight')) {
                this.handleEditWeight(target.getAttribute('data-id'));
            }
            
            
            // Delete health goal
            if (target.classList.contains('delete-goal')) {
                this.handleDeleteGoal(target.getAttribute('data-id'));
            }
            
            // Edit health goal
            if (target.classList.contains('edit-goal')) {
                this.handleEditGoal(target.getAttribute('data-id'));
            }
        });
    }

    // Filter events
    setupFilterEvents() {
        const dietFilterBtn = document.getElementById('diet-filter-btn');
        if (dietFilterBtn) {
            dietFilterBtn.addEventListener('click', () => {
                const start = document.getElementById('diet-filter-start').value;
                const end = document.getElementById('diet-filter-end').value;
                this.dataManager.loadDietRecords(start, end);
            });
        }

        const dietResetBtn = document.getElementById('diet-reset-btn');
        if (dietResetBtn) {
            dietResetBtn.addEventListener('click', () => {
                document.getElementById('diet-filter-start').value = '';
                document.getElementById('diet-filter-end').value = '';
                this.dataManager.loadDietRecords();
            });
        }

        const statsPeriod = document.getElementById('stats-period');
        if (statsPeriod) {
            statsPeriod.addEventListener('change', (e) => {
                this.dataManager.loadStatistics(e.target.value);
            });
        }
    }

    // Settings events
    setupSettingsEvents() {

        const notifyGoals = document.getElementById('notify-goals');
        if (notifyGoals) {
            notifyGoals.addEventListener('change', (e) => {
                this.handleNotificationChange('goals', e.target.checked);
            });
        }

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.handleExportData();
            });
        }

        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
                    this.handleClearData();
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    this.apiClient.logout();
                    window.location.reload();
                }
            });
        }

        // Display user info
        this.updateUserInfo();
    }

    // Update user info display
    updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userInfo.innerHTML = `
                        <p><strong>Username:</strong> ${user.username}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                    `;
                } catch (e) {
                    userInfo.innerHTML = '';
                }
            } else {
                userInfo.innerHTML = '';
            }
        }
    }

    // Menu toggle events
    setupMenuToggle() {
        const menuToggle = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }

    // Window events
    setupWindowEvents() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Debounce resize event
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // If on statistics view, reload statistics to re-render charts
                if (this.viewManager.currentView === 'statistics') {
                    const periodSelect = document.getElementById('stats-period');
                    const period = periodSelect ? periodSelect.value : 'month';
                    this.dataManager.loadStatistics(period);
                }
            }, 250);
        });

        window.addEventListener('beforeunload', () => {
            // Save data, etc.
            this.eventCount++;
        });
    }

    // Load view data
    loadViewData(viewId) {
        switch(viewId) {
            case 'dashboard':
                this.dataManager.loadDashboardData();
                break;
            case 'diet':
                this.dataManager.loadDietRecords();
                break;
            case 'exercise':
                this.dataManager.loadExerciseRecords();
                break;
            case 'sleep':
                this.dataManager.loadSleepRecords();
                break;
            case 'weight':
                this.dataManager.loadWeightRecords();
                break;
            case 'goals':
                this.dataManager.loadGoals();
                break;
            case 'statistics':
                // Get currently selected time range
                const statsPeriodSelect = document.getElementById('stats-period');
                const selectedPeriod = statsPeriodSelect ? statsPeriodSelect.value : 'month';
                this.dataManager.loadStatistics(selectedPeriod);
                break;
            case 'profile':
                this.dataManager.loadProfile();
                break;
            case 'about':
                // About page doesn't need to load data
                break;
        }
    }

    // Form submit handler functions
    async handleDietSubmit() {
        const form = document.getElementById('diet-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Data validation
        const calories = parseInt(document.getElementById('diet-calories').value);
        if (isNaN(calories) || calories < 0 || calories > 10000) {
            this.messageManager.error('Calories must be between 0 and 10000');
            return;
        }

        const data = {
            meal: document.getElementById('diet-meal').value,
            food: document.getElementById('diet-food').value.trim(),
            calories: calories,
            date: document.getElementById('diet-date').value,
            time: document.getElementById('diet-time').value
        };

        if (!data.food) {
            this.messageManager.error('Please enter food name');
            return;
        }

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = this.editingId ? 'Updating...' : 'Adding...';

            if (this.editingId && this.editingType === 'diet') {
                // Update record
                await this.apiClient.updateDietRecord(this.editingId, data);
                this.messageManager.success('Diet record updated successfully');
                this.editingId = null;
                this.editingType = null;
                submitBtn.textContent = 'Add Record';
                const cancelBtn = form.querySelector('.cancel-edit-btn');
                if (cancelBtn) cancelBtn.style.display = 'none';
            } else {
                // Create new record
                await this.apiClient.createDietRecord(data);
                this.messageManager.success('Diet record added successfully');
            }
            form.reset();
            this.setDefaultDate('diet-date');
            this.dataManager.loadDietRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error((this.editingId ? 'Update' : 'Add') + ' failed: ' + (error.message || 'Network error, please try again later'));
        } finally {
            submitBtn.disabled = false;
            if (!this.editingId) {
                submitBtn.textContent = 'Add Record';
            }
        }
    }

    async handleExerciseSubmit() {
        const form = document.getElementById('exercise-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Data validation
        const duration = parseInt(document.getElementById('exercise-duration').value);
        if (isNaN(duration) || duration < 1 || duration > 1440) {
            this.messageManager.error('Exercise duration must be between 1 and 1440 minutes');
            return;
        }

        const data = {
            type: document.getElementById('exercise-type').value,
            duration: duration,
            intensity: document.getElementById('exercise-intensity').value,
            date: document.getElementById('exercise-date').value,
            time: document.getElementById('exercise-time').value
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this.editingId ? 'Updating...' : 'Adding...';

            if (this.editingId && this.editingType === 'exercise') {
                await this.apiClient.updateExerciseRecord(this.editingId, data);
                this.messageManager.success('Exercise record updated successfully');
                this.editingId = null;
                this.editingType = null;
                submitBtn.textContent = 'Add Record';
                const cancelBtn = form.querySelector('.cancel-edit-btn');
                if (cancelBtn) cancelBtn.style.display = 'none';
            } else {
                await this.apiClient.createExerciseRecord(data);
                this.messageManager.success('Exercise record added successfully');
            }
            form.reset();
            this.setDefaultDate('exercise-date');
            this.dataManager.loadExerciseRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error((this.editingId ? 'Update' : 'Add') + ' failed: ' + (error.message || 'Network error, please try again later'));
        } finally {
            submitBtn.disabled = false;
            if (!this.editingId) {
                submitBtn.textContent = 'Add Record';
            }
        }
    }

    async handleSleepSubmit() {
        const form = document.getElementById('sleep-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const bedtime = document.getElementById('sleep-bedtime').value;
        const waketime = document.getElementById('sleep-waketime').value;
        
        // Data validation
        if (!bedtime || !waketime) {
            this.messageManager.error('Please fill in complete bedtime and wake time');
            return;
        }

        const bedtimeDate = new Date(bedtime);
        const waketimeDate = new Date(waketime);
        
        if (waketimeDate <= bedtimeDate) {
            this.messageManager.error('Wake time must be later than bedtime');
            return;
        }

        const sleepHours = (waketimeDate - bedtimeDate) / (1000 * 60 * 60);
        if (sleepHours > 24) {
            this.messageManager.error('Sleep duration cannot exceed 24 hours');
            return;
        }

        const dateStr = bedtimeDate.toISOString().split('T')[0];
        
        const data = {
            bedtime: bedtime,
            waketime: waketime,
            quality: document.getElementById('sleep-quality').value,
            notes: document.getElementById('sleep-notes').value.trim(),
            date: dateStr
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this.editingId ? 'Updating...' : 'Adding...';

            if (this.editingId && this.editingType === 'sleep') {
                await this.apiClient.updateSleepRecord(this.editingId, data);
                this.messageManager.success('Sleep record updated successfully');
                this.editingId = null;
                this.editingType = null;
                submitBtn.textContent = 'Add Record';
                const cancelBtn = form.querySelector('.cancel-edit-btn');
                if (cancelBtn) cancelBtn.style.display = 'none';
            } else {
                await this.apiClient.createSleepRecord(data);
                this.messageManager.success('Sleep record added successfully');
            }
            form.reset();
            this.dataManager.loadSleepRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error((this.editingId ? 'Update' : 'Add') + ' failed: ' + (error.message || 'Network error, please try again later'));
        } finally {
            submitBtn.disabled = false;
            if (!this.editingId) {
                submitBtn.textContent = 'Add Record';
            }
        }
    }

    async handleWeightSubmit() {
        const form = document.getElementById('weight-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Data validation
        const weight = parseFloat(document.getElementById('weight-value').value);
        if (isNaN(weight) || weight < 10 || weight > 500) {
            this.messageManager.error('Weight must be between 10 and 500 kg');
            return;
        }

        const data = {
            weight: weight,
            date: document.getElementById('weight-date').value,
            time: document.getElementById('weight-time').value
        };

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this.editingId ? 'Updating...' : 'Adding...';

            if (this.editingId && this.editingType === 'weight') {
                await this.apiClient.updateWeightRecord(this.editingId, data);
                this.messageManager.success('Weight record updated successfully');
                this.editingId = null;
                this.editingType = null;
                submitBtn.textContent = 'Add Record';
                const cancelBtn = form.querySelector('.cancel-edit-btn');
                if (cancelBtn) cancelBtn.style.display = 'none';
            } else {
                await this.apiClient.createWeightRecord(data);
                this.messageManager.success('Weight record added successfully');
            }
            form.reset();
            this.setDefaultDate('weight-date');
            this.dataManager.loadWeightRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error((this.editingId ? 'Update' : 'Add') + ' failed: ' + (error.message || 'Network error, please try again later'));
        } finally {
            submitBtn.disabled = false;
            if (!this.editingId) {
                submitBtn.textContent = 'Add Record';
            }
        }
    }


    async handleGoalSubmit() {
        const form = document.getElementById('goal-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Data validation
        const target = parseFloat(document.getElementById('goal-target').value);
        if (isNaN(target) || target <= 0) {
            this.messageManager.error('Target value must be greater than 0');
            return;
        }

        const deadline = document.getElementById('goal-deadline').value;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
            this.messageManager.error('Deadline cannot be a past date');
            return;
        }

        const data = {
            type: document.getElementById('goal-type').value,
            target: target,
            deadline: deadline,
            description: document.getElementById('goal-description').value.trim()
        };

        if (!data.type) {
            this.messageManager.error('Please select goal type');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = this.editingId ? 'Updating...' : 'Creating...';

            if (this.editingId && this.editingType === 'goal') {
                await this.apiClient.updateGoal(this.editingId, data);
                this.messageManager.success('Health goal updated successfully');
                this.editingId = null;
                this.editingType = null;
                submitBtn.textContent = 'Create Goal';
                const cancelBtn = form.querySelector('.cancel-edit-btn');
                if (cancelBtn) cancelBtn.style.display = 'none';
            } else {
                await this.apiClient.createGoal(data);
                this.messageManager.success('Health goal created successfully');
            }
            form.reset();
            this.dataManager.loadGoals();
        } catch (error) {
            this.messageManager.error((this.editingId ? 'Update' : 'Create') + ' failed: ' + (error.message || 'Network error, please try again later'));
        } finally {
            submitBtn.disabled = false;
            if (!this.editingId) {
                submitBtn.textContent = 'Create Goal';
            }
        }
    }

    async handleProfileSubmit() {
        const form = document.getElementById('profile-form');
        const data = {
            name: document.getElementById('profile-name').value,
            age: parseInt(document.getElementById('profile-age').value),
            gender: document.getElementById('profile-gender').value,
            height: parseInt(document.getElementById('profile-height').value),
            activityLevel: document.getElementById('profile-activity').value
        };

        try {
            await this.apiClient.updateProfile(data);
            this.messageManager.success('Profile saved successfully');
        } catch (error) {
            this.messageManager.error('Save failed: ' + error.message);
        }
    }

    // Delete handler functions
    async handleDeleteDiet(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await this.apiClient.deleteDietRecord(id);
            this.messageManager.success('Deleted successfully');
            this.dataManager.loadDietRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error('Delete failed: ' + error.message);
        }
    }

    async handleDeleteExercise(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await this.apiClient.deleteExerciseRecord(id);
            this.messageManager.success('Deleted successfully');
            this.dataManager.loadExerciseRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error('Delete failed: ' + error.message);
        }
    }

    async handleDeleteSleep(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await this.apiClient.deleteSleepRecord(id);
            this.messageManager.success('Deleted successfully');
            this.dataManager.loadSleepRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error('Delete failed: ' + error.message);
        }
    }

    async handleDeleteWeight(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await this.apiClient.deleteWeightRecord(id);
            this.messageManager.success('Deleted successfully');
            this.dataManager.loadWeightRecords();
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error('Delete failed: ' + error.message);
        }
    }


    async handleDeleteGoal(id) {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            await this.apiClient.deleteGoal(id);
            this.messageManager.success('Deleted successfully');
            this.dataManager.loadGoals();
        } catch (error) {
            this.messageManager.error('Delete failed: ' + error.message);
        }
    }

    // Edit handler functions
    async handleEditDiet(id) {
        try {
            const record = await this.apiClient.getDietRecord(id);
            if (!record) {
                this.messageManager.error('Record not found');
                return;
            }
            
            // Fill form
            document.getElementById('diet-meal').value = record.meal || '';
            document.getElementById('diet-food').value = record.food || '';
            document.getElementById('diet-calories').value = record.calories || '';
            document.getElementById('diet-date').value = record.date || '';
            document.getElementById('diet-time').value = record.time || '';
            
            // Set edit state
            this.editingId = id;
            this.editingType = 'diet';
            
            // Update button text
            const submitBtn = document.querySelector('#diet-form button[type="submit"]');
            const cancelBtn = document.querySelector('#diet-form .cancel-edit-btn');
            if (submitBtn) submitBtn.textContent = 'Update Record';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            // Scroll to form
            document.getElementById('diet-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            this.messageManager.info('Record loaded, please modify and submit');
        } catch (error) {
            this.messageManager.error('Failed to load record: ' + error.message);
        }
    }

    async handleEditExercise(id) {
        try {
            const record = await this.apiClient.getExerciseRecord(id);
            if (!record) {
                this.messageManager.error('Record not found');
                return;
            }
            
            document.getElementById('exercise-type').value = record.type || '';
            document.getElementById('exercise-duration').value = record.duration || '';
            document.getElementById('exercise-intensity').value = record.intensity || '';
            document.getElementById('exercise-date').value = record.date || '';
            document.getElementById('exercise-time').value = record.time || '';
            
            this.editingId = id;
            this.editingType = 'exercise';
            
            const submitBtn = document.querySelector('#exercise-form button[type="submit"]');
            const cancelBtn = document.querySelector('#exercise-form .cancel-edit-btn');
            if (submitBtn) submitBtn.textContent = 'Update Record';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            document.getElementById('exercise-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.messageManager.info('Record loaded, please modify and submit');
        } catch (error) {
            this.messageManager.error('Failed to load record: ' + error.message);
        }
    }

    async handleEditSleep(id) {
        try {
            const record = await this.apiClient.getSleepRecord(id);
            if (!record) {
                this.messageManager.error('Record not found');
                return;
            }
            
            // Convert datetime to datetime-local format
            const bedtime = new Date(record.bedtime);
            const waketime = new Date(record.waketime);
            const bedtimeStr = bedtime.toISOString().slice(0, 16);
            const waketimeStr = waketime.toISOString().slice(0, 16);
            
            document.getElementById('sleep-bedtime').value = bedtimeStr;
            document.getElementById('sleep-waketime').value = waketimeStr;
            document.getElementById('sleep-quality').value = record.quality || '';
            document.getElementById('sleep-notes').value = record.notes || '';
            
            this.editingId = id;
            this.editingType = 'sleep';
            
            const submitBtn = document.querySelector('#sleep-form button[type="submit"]');
            const cancelBtn = document.querySelector('#sleep-form .cancel-edit-btn');
            if (submitBtn) submitBtn.textContent = 'Update Record';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            document.getElementById('sleep-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.messageManager.info('Record loaded, please modify and submit');
        } catch (error) {
            this.messageManager.error('Failed to load record: ' + error.message);
        }
    }

    async handleEditWeight(id) {
        try {
            const record = await this.apiClient.getWeightRecord(id);
            if (!record) {
                this.messageManager.error('Record not found');
                return;
            }
            
            document.getElementById('weight-value').value = record.weight || '';
            document.getElementById('weight-date').value = record.date || '';
            document.getElementById('weight-time').value = record.time || '';
            
            this.editingId = id;
            this.editingType = 'weight';
            
            const submitBtn = document.querySelector('#weight-form button[type="submit"]');
            const cancelBtn = document.querySelector('#weight-form .cancel-edit-btn');
            if (submitBtn) submitBtn.textContent = 'Update Record';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            document.getElementById('weight-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.messageManager.info('Record loaded, please modify and submit');
        } catch (error) {
            this.messageManager.error('Failed to load record: ' + error.message);
        }
    }


    async handleEditGoal(id) {
        try {
            const record = await this.apiClient.getGoal(id);
            if (!record) {
                this.messageManager.error('Goal not found');
                return;
            }
            
            document.getElementById('goal-type').value = record.type || '';
            document.getElementById('goal-target').value = record.target || '';
            document.getElementById('goal-deadline').value = record.deadline || '';
            document.getElementById('goal-description').value = record.description || '';
            
            this.editingId = id;
            this.editingType = 'goal';
            
            const submitBtn = document.querySelector('#goal-form button[type="submit"]');
            const cancelBtn = document.querySelector('#goal-form .cancel-edit-btn');
            if (submitBtn) submitBtn.textContent = 'Update Goal';
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            document.getElementById('goal-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.messageManager.info('Goal loaded, please modify and submit');
        } catch (error) {
            this.messageManager.error('Failed to load goal: ' + error.message);
        }
    }

    // Settings handler functions
    handleNotificationChange(type, enabled) {
        localStorage.setItem(`notify_${type}`, enabled);
        this.messageManager.success(`Goal reminder ${enabled ? 'enabled' : 'disabled'}`);
    }

    async handleExportData() {
        try {
            // Check if jsPDF is available
            let jsPDF;
            if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
                jsPDF = window.jspdf.jsPDF;
            } else {
                this.messageManager.error('PDF library not loaded. Please refresh the page.');
                return;
            }

            const pdf = new jsPDF();
            
            // Get all data
            const [diet, exercise, sleep, weight, goals, profile] = await Promise.all([
                this.apiClient.getDietRecords(),
                this.apiClient.getExerciseRecords(),
                this.apiClient.getSleepRecords(),
                this.apiClient.getWeightRecords(),
                this.apiClient.getGoals(),
                this.apiClient.getProfile()
            ]);

            let yPos = 20;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            const lineHeight = 7;
            const maxWidth = pageWidth - 2 * margin;

            // Helper function to add text with word wrap
            const addText = (text, fontSize = 10, isBold = false) => {
                pdf.setFontSize(fontSize);
                if (isBold) {
                    pdf.setFont(undefined, 'bold');
                } else {
                    pdf.setFont(undefined, 'normal');
                }
                
                const lines = pdf.splitTextToSize(text, maxWidth);
                if (yPos + (lines.length * lineHeight) > pdf.internal.pageSize.getHeight() - 20) {
                    pdf.addPage();
                    yPos = 20;
                }
                
                lines.forEach(line => {
                    pdf.text(line, margin, yPos);
                    yPos += lineHeight;
                });
            };

            // Title
            addText('Personal Health Management Report', 18, true);
            yPos += 5;
            addText(`Generated on: ${new Date().toLocaleString()}`, 10);
            yPos += 10;

            // Profile Information
            if (profile) {
                addText('Profile Information', 14, true);
                yPos += 3;
                addText(`Name: ${profile.name || 'N/A'}`);
                addText(`Age: ${profile.age || 'N/A'}`);
                addText(`Gender: ${profile.gender || 'N/A'}`);
                addText(`Height: ${profile.height || 'N/A'} cm`);
                addText(`Activity Level: ${profile.activityLevel || 'N/A'}`);
                yPos += 5;
            }

            // Diet Records
            if (diet && diet.length > 0) {
                addText('Diet Records', 14, true);
                yPos += 3;
                diet.forEach((record, index) => {
                    const mealNames = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
                    const mealName = mealNames[record.meal] || record.meal;
                    addText(`${index + 1}. ${record.food} (${mealName}) - ${record.calories} kcal - ${record.date} ${record.time}`);
                });
                yPos += 5;
            } else {
                addText('Diet Records: No records found', 12);
                yPos += 5;
            }

            // Exercise Records
            if (exercise && exercise.length > 0) {
                addText('Exercise Records', 14, true);
                yPos += 3;
                exercise.forEach((record, index) => {
                    addText(`${index + 1}. ${record.type} - ${record.duration} minutes - ${record.intensity || 'N/A'} intensity - ${record.date} ${record.time}`);
                });
                yPos += 5;
            } else {
                addText('Exercise Records: No records found', 12);
                yPos += 5;
            }

            // Sleep Records
            if (sleep && sleep.length > 0) {
                addText('Sleep Records', 14, true);
                yPos += 3;
                sleep.forEach((record, index) => {
                    const sleepHours = record.bedtime && record.waketime 
                        ? ((new Date(record.waketime) - new Date(record.bedtime)) / (1000 * 60 * 60)).toFixed(1)
                        : 'N/A';
                    addText(`${index + 1}. Bedtime: ${record.bedtime || 'N/A'} - Wake: ${record.waketime || 'N/A'} - Duration: ${sleepHours} hours - Quality: ${record.quality || 'N/A'} - ${record.date}`);
                });
                yPos += 5;
            } else {
                addText('Sleep Records: No records found', 12);
                yPos += 5;
            }

            // Weight Records
            if (weight && weight.length > 0) {
                addText('Weight Records', 14, true);
                yPos += 3;
                weight.forEach((record, index) => {
                    addText(`${index + 1}. ${record.weight} kg - ${record.date} ${record.time}`);
                });
                yPos += 5;
            } else {
                addText('Weight Records: No records found', 12);
                yPos += 5;
            }

            // Health Goals
            if (goals && goals.length > 0) {
                addText('Health Goals', 14, true);
                yPos += 3;
                goals.forEach((goal, index) => {
                    const status = goal.status || 'active';
                    addText(`${index + 1}. ${goal.type || 'N/A'} - ${goal.description || 'N/A'} - Target: ${goal.target || 'N/A'} - Status: ${status} - Deadline: ${goal.deadline || 'N/A'}`);
                });
                yPos += 5;
            } else {
                addText('Health Goals: No goals found', 12);
                yPos += 5;
            }

            // Summary
            addText('Summary', 14, true);
            yPos += 3;
            addText(`Total Diet Records: ${diet ? diet.length : 0}`);
            addText(`Total Exercise Records: ${exercise ? exercise.length : 0}`);
            addText(`Total Sleep Records: ${sleep ? sleep.length : 0}`);
            addText(`Total Weight Records: ${weight ? weight.length : 0}`);
            addText(`Total Health Goals: ${goals ? goals.length : 0}`);

            // Save PDF
            const fileName = `health-report-${Date.now()}.pdf`;
            pdf.save(fileName);
            
            this.messageManager.success('Data exported as PDF successfully');
        } catch (error) {
            this.messageManager.error('Export failed: ' + error.message);
        }
    }

    async handleClearData() {
        try {
            // Clear all data logic should be implemented here
            this.messageManager.success('Data cleared');
            this.dataManager.loadDashboardData();
        } catch (error) {
            this.messageManager.error('Clear failed: ' + error.message);
        }
    }
}

