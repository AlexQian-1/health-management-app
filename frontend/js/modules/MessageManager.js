// Message manager class
export class MessageManager {
    constructor() {
        this.messageEl = document.getElementById('message');
        this.timeoutId = null;
    }

    // Show message
    show(message, type = 'info', duration = 3000) {
        if (!this.messageEl) return;

        // Clear previous message
        this.hide();

        // Set message content and type
        this.messageEl.textContent = message;
        this.messageEl.className = `message ${type}`;
        this.messageEl.classList.remove('hidden');

        // Auto-hide
        this.timeoutId = setTimeout(() => {
            this.hide();
        }, duration);
    }

    // Hide message
    hide() {
        if (this.messageEl) {
            this.messageEl.classList.add('hidden');
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    // Show success message
    success(message, duration) {
        this.show(message, 'success', duration);
    }

    // Show error message
    error(message, duration) {
        this.show(message, 'error', duration);
    }

    // Show info message
    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

