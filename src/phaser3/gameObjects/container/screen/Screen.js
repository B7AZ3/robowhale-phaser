import Phaser from 'phaser';
import Pinner from '../../../scenes/Pinner.js';

/** @enum {string} */
export const PhaserScreenEvent = {
    SHOW: '__SHOW',
    HIDE_START: '__HIDE_START',
    HIDE_COMPLETE: '__HIDE_COMPLETE'
};

/**
 * A full‑screen overlay container with a semi‑transparent background and
 * automatic resizing based on game dimensions. Uses a Pinner helper to
 * pin child objects relative to screen edges.
 */
export default class PhaserScreen extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} [options]
     * @param {string} [options.name='screen'] - Display name.
     * @param {number} [options.width] - Explicit width (defaults to game config width).
     * @param {number} [options.height] - Explicit height (defaults to game config height).
     * @param {string} [options.backgroundKey='__BLACK'] - Texture key for background.
     * @param {string|number} [options.backgroundFrame] - Frame for background.
     * @param {number} [options.backgroundAlpha=0.8] - Background opacity.
     * @param {number} [options.backgroundPadding=4] - Extra padding around background.
     * @param {boolean} [options.backgroundInteractive=true] - Whether background blocks input.
     */
    constructor(scene, options = {}) {
        super(scene);
        this.name = options.name || 'screen';
        this.options = {
            backgroundKey: '__BLACK',
            backgroundAlpha: 0.8,
            backgroundPadding: 4,
            backgroundInteractive: true,
            ...options
        };
        /** @type {Pinner} */
        this.pinner = new Pinner();

        // Determine dimensions
        const gameWidth = scene.game.config.width;
        const gameHeight = scene.game.config.height;
        this.width = this.options.width || gameWidth;
        this.height = this.options.height || gameHeight;
        this.setSize(this.width, this.height);

        /** @type {Phaser.GameObjects.Image} */
        this.background = null;
        /** @type {number} */ this.screenWidth = 0;
        /** @type {number} */ this.screenHeight = 0;
        /** @type {{x:number, y:number}} */ this.screenCenter = { x: 0, y: 0 };

        this.addBackground();
        this.updateScreenSize();
    }

    /** @private */
    addBackground() {
        this.background = this.scene.add.image(0, 0, this.options.backgroundKey, this.options.backgroundFrame);
        this.background.alpha = this.options.backgroundAlpha;
        this.background.name = this.name + '_bg';
        this.background.setOrigin(0.5, 0.5);
        this.background.displayWidth = this.width + this.options.backgroundPadding;
        this.background.displayHeight = this.height + this.options.backgroundPadding;
        this.add(this.background);
        if (this.options.backgroundInteractive) {
            this.background.setInteractive();
        }
    }

    /** Recalculates screen dimensions based on game orientation. */
    updateScreenSize() {
        const gameWidth = this.scene.game.config.width;
        const gameHeight = this.scene.game.config.height;
        const isPortrait = gameHeight > gameWidth;
        if (isPortrait) {
            this.screenWidth = this.width;
            this.screenHeight = gameHeight / this.scale;
        } else {
            this.screenWidth = gameWidth / this.scale;
            this.screenHeight = this.height;
        }
        this.screenCenter = { x: this.screenWidth / 2, y: this.screenHeight / 2 };
    }

    /** Resizes the screen and background when the game scale changes. Call this on resize events. */
    resize() {
        const gameWidth = this.scene.game.config.width;
        const gameHeight = this.scene.game.config.height;
        const isPortrait = gameHeight > gameWidth;
        if (isPortrait) {
            this.scale = gameWidth / this.width;
            this.background.displayHeight = (gameHeight + this.options.backgroundPadding) / this.scale;
        } else {
            this.scale = gameHeight / this.height;
            this.background.displayWidth = (gameWidth + this.options.backgroundPadding) / this.scale;
        }
        this.updateScreenSize();
        this.pinner.onResize(this.screenWidth, this.screenHeight, 1);
        this.background.x = this.screenCenter.x;
        this.background.y = this.screenCenter.y;
    }

    /**
     * Pins a game object to a relative position on the screen.
     * @param {Phaser.GameObjects.GameObject} obj
     * @param {number} x - Relative X (0 = left, 1 = right).
     * @param {number} y - Relative Y (0 = top, 1 = bottom).
     * @param {number} offsetX - Pixel offset.
     * @param {number} offsetY - Pixel offset.
     */
    pin(obj, x, y, offsetX, offsetY) {
        this.pinner.pin(obj, x, y, offsetX, offsetY);
    }

    /** Emits the SHOW event. */
    emitShowEvent(...args) {
        this.emit(PhaserScreenEvent.SHOW, this, ...args);
    }

    /** Emits the HIDE_START event. */
    emitHideStartEvent(...args) {
        this.emit(PhaserScreenEvent.HIDE_START, this, ...args);
    }

    /** Emits the HIDE_COMPLETE event. */
    emitHideCompleteEvent(...args) {
        this.emit(PhaserScreenEvent.HIDE_COMPLETE, this, ...args);
    }

    /**
     * Animates the background from transparent to its target alpha.
     * @param {Object} [props]
     * @param {number} [props.duration=150]
     * @param {Function} [props.ease=Phaser.Math.Easing.Cubic.Out]
     * @param {number} [props.targetAlpha] - Defaults to options.backgroundAlpha.
     */
    showBackground(props = {}) {
        this.background.alpha = 0;
        this.scene.tweens.add({
            targets: this.background,
            duration: props.duration ?? 150,
            ease: props.ease ?? Phaser.Math.Easing.Cubic.Out,
            alpha: props.targetAlpha ?? this.options.backgroundAlpha
        });
    }
}