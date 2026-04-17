import PhaserScreen from '../container/screen/Screen.js';
import Toast from './Toast.js';

/**
 * A manager for toast notifications that displays them at the bottom centre.
 * Extends PhaserScreen to provide a full‑screen overlay that does not block input.
 */
export default class ToastsManager extends PhaserScreen {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} [options] - Options for the underlying PhaserScreen.
     * @param {Function} [options.getVideoAdWarningText] - Callback returning string for video ad warning.
     */
    constructor(scene, options = {}) {
        // Merge defaults for toast manager screen
        const screenOptions = {
            name: 'toasts',
            backgroundAlpha: 0,
            backgroundInteractive: false,
            backgroundKey: options.backgroundKey || 'level_map', // fallback, but will be invisible anyway
            backgroundFrame: options.backgroundFrame || 'black_rect',
            ...options
        };
        super(scene, screenOptions);

        /** @type {Toast[]} */
        this.toasts = [];
        /** @type {Function|null} */
        this.getVideoAdWarningText = options.getVideoAdWarningText || null;
    }

    /**
     * Displays a toast.
     * @param {Object} toastOptions - Options passed to Toast constructor.
     * @param {string} toastOptions.message - Message text.
     * @param {number} [toastOptions.lifespan=3000] - Duration in ms.
     * @param {...any} rest - Other Toast options.
     */
    show(toastOptions) {
        this.dismissAll();
        const lifespan = toastOptions.lifespan ?? 3000;
        const toast = new Toast(this.scene, toastOptions);
        this.toasts.push(toast);
        this.add(toast);
        // Position at bottom centre, above the screen bottom
        this.pin(toast, 0.5, 1, 0, -toast.height / 2 + 1);
        this.pinner.align(toast, this.screenWidth, this.screenHeight, 1);
        toast.once(Phaser.GameObjects.Events.DESTROY, this.onToastDestroy, this);
        toast.show(lifespan);
    }

    /**
     * Shows a video ad warning toast using the configured text generator.
     * Does nothing if no getVideoAdWarningText provided.
     */
    showVideoAdWarning() {
        if (typeof this.getVideoAdWarningText === 'function') {
            const message = this.getVideoAdWarningText();
            this.show({ message, lifespan: 3000 });
        } else {
            console.warn('ToastsManager: no getVideoAdWarningText provided, cannot show video ad warning');
        }
    }

    /** @private */
    onToastDestroy(toast) {
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
            this.toasts.splice(index, 1);
            this.pinner.unpin(toast);
        }
    }

    /** Dismisses all currently visible toasts. */
    dismissAll() {
        this.toasts.forEach(toast => toast.dismiss());
    }

    /**
     * Called on resize – propagate to parent and optionally reposition toasts.
     */
    resize() {
        super.resize();
        // Optionally reposition existing toasts
        this.toasts.forEach(toast => {
            this.pinner.align(toast, this.screenWidth, this.screenHeight, 1);
        });
    }
}