// View manager class
export class ViewManager {
    constructor() {
        this.currentView = 'dashboard';
        this.views = new Map();
        this.initViews();
    }

    // Initialize all views
    initViews() {
        const viewIds = [
            'auth', 'dashboard', 'diet', 'exercise', 'sleep', 
            'weight', 'goals', 'statistics', 
            'profile', 'about', 'settings'
        ];
        
        viewIds.forEach(viewId => {
            const element = document.getElementById(`view-${viewId}`);
            if (element) {
                this.views.set(viewId, element);
            }
        });
    }

    // Switch to specified view
    showView(viewId) {
        if (!this.views.has(viewId)) {
            console.error(`View ${viewId} not found`);
            return false;
        }

        // Hide current view
        const currentElement = this.views.get(this.currentView);
        if (currentElement) {
            currentElement.classList.remove('active');
        }

        // Show new view
        const newElement = this.views.get(viewId);
        if (newElement) {
            newElement.classList.add('active');
            this.currentView = viewId;
        }

        // Update navigation link state
        this.updateNavLinks(viewId);
        
        return true;
    }

    // Update navigation link active state
    updateNavLinks(activeViewId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const viewId = link.getAttribute('data-view');
            if (viewId === activeViewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Get current view ID
    getCurrentView() {
        return this.currentView;
    }

    // Get view element
    getViewElement(viewId) {
        return this.views.get(viewId);
    }

    // Show loading state
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    // Hide loading state
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }
}

