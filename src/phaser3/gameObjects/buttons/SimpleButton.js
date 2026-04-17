import Phaser from 'phaser';
import { ButtonEvent } from './ButtonEvent.js';

/**
 * A basic image button with press/release events, tween feedback, and optional sound.
 * @fires ButtonEvent#PRESS
 * @fires ButtonEvent#RELEASE
 */
export default class SimpleButton extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {string} config.texture - Texture key.
     * @param {string|number} config.frame - Frame name/index.
     * @param {Phaser.GameObjects.Container} [config.parent] - Optional parent container.
     * @param {boolean} [config.enableTweens=true] - Animate scale on press/release.
     * @param {number} [config.pressScale=0.9] - Scale factor when pressed.
     * @param {number} [config.pressDuration=50] - Press tween duration (ms).
     * @param {number} [config.releaseDuration=300] - Release tween duration (ms).
     * @param {string} [config.releaseEase='Back.Out'] - Easing for release tween.
     * @param {boolean} [config.checkPointerOver=true] - Only fire release if pointer still over button.
     * @param {Object} [config.sound] - Optional sound config.
     * @param {string} [config.sound.key] - Sound key to play on press.
     * @param {number} [config.sound.volume=1] - Sound volume.
     * @param {Function} [config.onPress] - Callback on press (button, pointer).
     * @param {Function} [config.onRelease] - Callback on release (button, pointer).
     */
    constructor(scene, config = {}) {
        const {
            texture,
            frame,
            parent = null,
            enableTweens = true,
            pressScale = 0.9,
            pressDuration = 50,
            releaseDuration = 300,
            releaseEase = 'Back.Out',
            checkPointerOver = true,
            sound = null,
            onPress = null,
            onRelease = null
        } = config;

        if (!texture || frame === undefined) {
            throw new Error('SimpleButton requires texture and frame');
        }

        super(scene, 0, 0, texture, frame);

        if (parent) {
            parent.add(this);
        } else {
            scene.add.existing(this);
        }

        /** @type {Phaser.Scene} */
        this.scene = scene;
        /** @type {boolean} */ this._enabled = true;
        /** @type {number} */ this.originalScale = this.scale;
        /** @type {boolean} */ this.enableTweens = enableTweens;
        /** @type {number} */ this.pressScale = pressScale;
        /** @type {number} */ this.pressDuration = pressDuration;
        /** @type {number} */ this.releaseDuration = releaseDuration;
        /** @type {string} */ this.releaseEase = releaseEase;
        /** @type {boolean} */ this.checkPointerOver = checkPointerOver;
        /** @type {Object|null} */ this.soundConfig = sound;
        /** @type {Function|null} */ this.onPressCallback = onPress;
        /** @type {Function|null} */ this.onReleaseCallback = onRelease;
        /** @type {Phaser.Input.Pointer|null} */ this.currentPointer = null;

        this.setInteractive({ useHandCursor: true });
        this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown, this);
        scene.input.on(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this);
    }

    /** @private */
    onPointerDown(pointer) {
        this.currentPointer = pointer;
        this.playPressTween();
        this.playPressSound();
        this.emit(ButtonEvent.PRESS, this, pointer);
        if (this.onPressCallback) this.onPressCallback(this, pointer);
    }

    /** @private */
    playPressTween() {
        if (!this.enableTweens) return;
        this.originalScale = this.scale;
        this.scene.tweens.add({
            targets: this,
            scale: this.scale * this.pressScale,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: this.pressDuration
        });
    }

    /** @private */
    playPressSound() {
        if (this.soundConfig?.key) {
            const volume = this.soundConfig.volume ?? 1;
            this.scene.sound.play(this.soundConfig.key, { volume });
        }
    }

    /** @private */
    onScenePointerUp(pointer, gameObjects) {
        if (this.currentPointer && this.currentPointer === pointer) {
            this.currentPointer = null;
            const isOver = gameObjects.includes(this);
            if (!this.checkPointerOver || isOver) {
                this.onPointerUp();
                this.emit(ButtonEvent.RELEASE, this, pointer);
                if (this.onReleaseCallback) this.onReleaseCallback(this, pointer);
            }
            this.playReleaseTween();
        }
    }

    /**
     * Placeholder for subclass override. Called when button is released (after checks).
     * @protected
     */
    onPointerUp() {}

    /** @private */
    playReleaseTween() {
        if (!this.scene || !this.enableTweens) return;
        this.scene.tweens.add({
            targets: this,
            scale: this.originalScale,
            ease: Phaser.Math.Easing[this.releaseEase] || Phaser.Math.Easing.Back.Out,
            duration: this.releaseDuration
        });
    }

    /** Enables input interaction. */
    enableInput() {
        if (this._enabled) return;
        this._enabled = true;
        this.setInteractive();
    }

    /** Disables input interaction. */
    disableInput() {
        if (!this._enabled) return;
        this._enabled = false;
        this.disableInteractive();
    }

    /**
     * Expands the clickable hit area.
     * @param {number} x - Horizontal inflation.
     * @param {number} y - Vertical inflation.
     */
    inflateHitArea(x, y) {
        const hitArea = this.input?.hitArea;
        if (hitArea && hitArea instanceof Phaser.Geom.Rectangle) {
            Phaser.Geom.Rectangle.Inflate(hitArea, x, y);
        }
    }

    /** Emulate a press event (for testing). */
    emulatePressEvent(args = []) {
        this.emit(ButtonEvent.PRESS, this, ...args);
    }

    /** Emulate a release event. */
    emulateReleaseEvent(args = []) {
        this.emit(ButtonEvent.RELEASE, this, ...args);
    }

    /** Cleanup. */
    destroy() {
        if (this.scene) {
            this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this);
        }
        super.destroy();
    }
}