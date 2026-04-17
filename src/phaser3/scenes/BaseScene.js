import Phaser from 'phaser';
import Pinner from './Pinner.js';
import Scaler from './Scaler.js';
import FastForward from './FastForward.js';

/**
 * Scale types for the `size` helper.
 * @enum {string}
 */
export const ScaleType = {
    /** Scale to exact width and height (stretch). */
    EXACT: 'exact',
    /** Scale to fit inside given dimensions (preserve aspect). */
    FIT: 'fit',
    /** Scale to cover given dimensions (preserve aspect, may crop). */
    COVER: 'cover',
    /** Scale proportionally by a factor. */
    PROPORTIONAL: 'proportional'
};

/**
 * BaseScene provides common functionality for all game scenes:
 * - Pinning objects relative to screen edges (using Pinner)
 * - Scaling game objects (using Scaler)
 * - Fast‑forward support (time scale control)
 * - Keyboard shortcuts (Shift, Ctrl)
 * - Easy scene restart / change
 *
 * @extends Phaser.Scene
 */
export default class BaseScene extends Phaser.Scene {
    /**
     * @param {string} key - Scene key.
     * @param {Object} [options] - Scene options.
     * @param {number} [options.gameWidth] - Override for game width (default from config).
     * @param {number} [options.gameHeight] - Override for game height.
     * @param {number} [options.assetsScale=1] - Global asset scale factor.
     */
    constructor(key, options = {}) {
        super(key);
        this._gameWidth = options.gameWidth;
        this._gameHeight = options.gameHeight;
        this._assetsScale = options.assetsScale ?? 1;
    }

    /** @returns {Phaser.Input.Keyboard.KeyboardPlugin} */
    get keyboard() {
        return this.input.keyboard;
    }

    /** @returns {Phaser.Input.Pointer} */
    get activePointer() {
        return this.input.activePointer;
    }

    /**
     * Scene initialisation.
     * @param {any} data - Optional initialisation data.
     */
    init(data) {
        this.initData = data ?? undefined;
        this.events.once('shutdown', this.onShutdown, this);

        /** @type {Pinner} */
        this.pinner = new Pinner();
        /** @type {Scaler} */
        this.sizer = new Scaler(this);
        /** @type {FastForward} */
        this.fastForward = new FastForward(this);

        const shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        const ctrlKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
        /** @type {Phaser.Input.Keyboard.Key} */ this.shiftKey = shiftKey;
        /** @type {Phaser.Input.Keyboard.Key} */ this.ctrlKey = ctrlKey;
    }

    /**
     * Called after `init`. Override in subclasses.
     */
    create() {}

    /**
     * Scales a game object using the internal Scaler.
     * @param {Phaser.GameObjects.GameObject} obj - The object to scale.
     * @param {ScaleType} type - Scaling type.
     * @param {Object} [options] - Additional options for the scaler.
     */
    size(obj, type = ScaleType.EXACT, options) {
        this.sizer.scale(obj, type, options);
    }

    /**
     * Pins an object to a relative position on the screen.
     * @param {Phaser.GameObjects.GameObject} obj - Object to pin.
     * @param {number} x - Relative X (0 = left, 1 = right).
     * @param {number} y - Relative Y (0 = top, 1 = bottom).
     * @param {number} offsetX - Pixel offset.
     * @param {number} offsetY - Pixel offset.
     */
    pin(obj, x, y, offsetX, offsetY) {
        this.pinner.pin(obj, x, y, offsetX, offsetY);
    }

    /**
     * Called on resize events – updates pinner and scaler.
     * Override this method to handle custom resizing.
     */
    resize() {
        const w = this._gameWidth ?? this.game.config.width;
        const h = this._gameHeight ?? this.game.config.height;
        const scale = this._assetsScale;
        this.sizer.onResize();
        this.pinner.onResize(w, h, scale);
    }

    /**
     * Restarts the current scene with optional new data.
     * @param {any} [data] - New init data.
     */
    restart(data) {
        this.scene.restart(data ?? this.initData);
    }

    /**
     * Listens for a specific key down event.
     * @param {string} key - Key code string (e.g., 'SPACE', 'A').
     * @param {Function} callback - Callback function.
     * @param {any} [context] - `this` context for callback.
     */
    onKeyDown(key, callback, context) {
        this.keyboard.on(`keydown-${key}`, callback, context);
    }

    /**
     * Listens for a key down event exactly once.
     * @param {string} key
     * @param {Function} callback
     * @param {any} [context]
     */
    onceKeyDown(key, callback, context) {
        this.keyboard.once(`keydown-${key}`, callback, context);
    }

    /**
     * Changes to another scene, passing optional data.
     * @param {string} newScene - Key of the target scene.
     * @param {any} [data] - Data to pass to the new scene.
     */
    changeScene(newScene, data) {
        this.scene.start(newScene, data);
    }

    /**
     * Cleanup on scene shutdown.
     * @private
     */
    onShutdown() {
        this.pinner?.destroy();
        this.pinner = null;
        this.sizer?.destroy();
        this.sizer = null;
        this.fastForward?.destroy();
        this.fastForward = null;
    }
}