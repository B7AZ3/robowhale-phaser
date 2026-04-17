import Phaser from 'phaser';
import { ButtonEvent } from './ButtonEvent.js';

/**
 * A flexible button based on Phaser Container.
 * Supports press/release events, tween animations, icon, text, and hit area inflation.
 *
 * @fires ButtonEvent#PRESS
 * @fires ButtonEvent#RELEASE
 *
 * @example
 * const button = new ComplexButton(scene, {
 *   texture: 'ui_atlas',
 *   frame: 'btn_default',
 *   parent: someContainer,
 *   onPress: () => console.log('pressed'),
 *   sound: { key: 'click', volume: 0.5 }  // optional, requires scene.sound
 * });
 */
export default class ComplexButton extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene - The scene to which this button belongs.
     * @param {Object} config - Configuration object.
     * @param {string} config.texture - Atlas key or image key for the button background.
     * @param {string|number} config.frame - Frame name or index for the background.
     * @param {Phaser.GameObjects.Container} [config.parent] - Optional parent container to add this button to.
     * @param {boolean} [config.enableTweens=true] - Whether to animate scale on press/release.
     * @param {number} [config.pressScale=0.9] - Scale factor when pressed (relative to original).
     * @param {number} [config.pressDuration=50] - Duration of press tween in ms.
     * @param {number} [config.releaseDuration=300] - Duration of release tween in ms.
     * @param {string} [config.releaseEase='Back.Out'] - Easing for release tween.
     * @param {boolean} [config.checkPointerOver=true] - If true, release event only fires if pointer is still over the button.
     * @param {Object} [config.sound] - Optional sound configuration.
     * @param {string} [config.sound.key] - Key of the sound to play on press.
     * @param {number} [config.sound.volume=1] - Volume for the press sound.
     * @param {Function} [config.onPress] - Callback fired when button is pressed.
     * @param {Function} [config.onRelease] - Callback fired when button is released.
     */
    constructor(scene, config = {}) {
        super(scene);

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
            throw new Error('ComplexButton requires texture and frame');
        }

        // Add to scene or parent container
        if (parent) {
            parent.add(this);
        } else {
            scene.add.existing(this);
        }

        /** @type {Phaser.Scene} */
        this.scene = scene;

        /** @type {boolean} */
        this.enableTweens = enableTweens;
        /** @type {number} */
        this.pressScale = pressScale;
        /** @type {number} */
        this.pressDuration = pressDuration;
        /** @type {number} */
        this.releaseDuration = releaseDuration;
        /** @type {string} */
        this.releaseEase = releaseEase;
        /** @type {boolean} */
        this.checkPointerOver = checkPointerOver;

        /** @type {Object|null} */
        this.soundConfig = sound;
        /** @type {Function|null} */
        this.onPressCallback = onPress;
        /** @type {Function|null} */
        this.onReleaseCallback = onRelease;

        /** @type {Phaser.GameObjects.Image} */
        this.back = null;
        /** @type {Phaser.GameObjects.Image|null} */
        this.icon = null;
        /** @type {Phaser.GameObjects.Text|Phaser.GameObjects.BitmapText|null} */
        this.label = null;
        /** @type {Phaser.Input.Pointer|null} */
        this.currentPointer = null;
        /** @type {number} */
        this.originalScale = 1;

        // Create background image
        this.back = scene.add.image(0, 0, texture, frame);
        this.add(this.back);

        // Set size from background
        this.setSize(this.back.width, this.back.height);

        // Enable input and cursor
        this.setInteractive({ useHandCursor: true });

        // Store original scale (in case container is already scaled)
        this.originalScale = this.scale;

        // Register events
        this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown, this);
        scene.input.on(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this);
    }

    /**
     * Enables input interaction on the button.
     */
    enableInput() {
        this.setInteractive();
    }

    /**
     * Disables input interaction on the button.
     */
    disableInput() {
        this.disableInteractive();
    }

    /**
     * Called on pointer down over the button.
     * @param {Phaser.Input.Pointer} pointer
     * @private
     */
    onPointerDown(pointer) {
        this.currentPointer = pointer;
        this.playPressSound();
        this.playPressTween();
        this.emit(ButtonEvent.PRESS, this, pointer);
        if (this.onPressCallback) this.onPressCallback(this, pointer);
    }

    /**
     * Plays the press sound if configured.
     * @private
     */
    playPressSound() {
        if (!this.soundConfig || !this.soundConfig.key) return;
        const volume = this.soundConfig.volume ?? 1;
        this.scene.sound.play(this.soundConfig.key, { volume });
    }

    /**
     * Plays the press scale-down tween.
     * @private
     */
    playPressTween() {
        if (!this.enableTweens) return;
        this.scene.tweens.add({
            targets: this,
            scale: this.originalScale * this.pressScale,
            ease: Phaser.Math.Easing.Cubic.Out,
            duration: this.pressDuration
        });
    }

    /**
     * Called when any pointer is released anywhere on scene.
     * @param {Phaser.Input.Pointer} pointer
     * @param {Phaser.GameObjects.GameObject[]} gameObjects
     * @private
     */
    onScenePointerUp(pointer, gameObjects) {
        if (!this.currentPointer || this.currentPointer !== pointer) return;
        this.currentPointer = null;

        const isPointerOverButton = gameObjects.includes(this);
        if (!this.checkPointerOver || isPointerOverButton) {
            this.onPointerUp();
            this.emit(ButtonEvent.RELEASE, this, pointer);
            if (this.onReleaseCallback) this.onReleaseCallback(this, pointer);
        }
        this.playReleaseTween();
    }

    /**
     * Placeholder for custom release logic (to be overridden or extended).
     * @protected
     */
    onPointerUp() {
        // Intentionally empty – override in subclasses
    }

    /**
     * Plays the release scale‑up tween.
     * @private
     */
    playReleaseTween() {
        if (!this.enableTweens) return;
        this.scene.tweens.add({
            targets: this,
            scale: this.originalScale,
            ease: Phaser.Math.Easing[this.releaseEase] || Phaser.Math.Easing.Back.Out,
            duration: this.releaseDuration
        });
    }

    /**
     * Adds an icon (image) to the button.
     * @param {string} atlasKey - Texture key for the icon.
     * @param {string|number} frame - Frame name or index.
     * @param {number} [offsetX=0] - X offset relative to button centre.
     * @param {number} [offsetY=0] - Y offset relative to button centre.
     * @returns {Phaser.GameObjects.Image} The created icon image.
     */
    addIcon(atlasKey, frame, offsetX = 0, offsetY = 0) {
        this.icon = this.scene.make.image({ key: atlasKey, frame }, false);
        this.icon.setPosition(offsetX, offsetY);
        this.add(this.icon);
        return this.icon;
    }

    /**
     * Adds a BitmapText label to the button.
     * @param {string} content - Text content.
     * @param {string} font - Bitmap font key.
     * @param {number} fontSize - Font size.
     * @param {number} [offsetX=0] - X offset relative to button centre.
     * @param {number} [offsetY=0] - Y offset relative to button centre.
     * @returns {Phaser.GameObjects.BitmapText}
     */
    addBitmapText(content, font, fontSize, offsetX = 0, offsetY = 0) {
        this.label = this.scene.make.bitmapText({
            font,
            size: fontSize,
            text: content,
            add: false
        });
        this.label.setOrigin(0.5, 0.5);
        this.label.setPosition(offsetX, offsetY);
        this.add(this.label);
        return this.label;
    }

    /**
     * Adds a standard Text label to the button.
     * @param {string} content - Text content.
     * @param {Phaser.Types.GameObjects.Text.TextStyle} style - Text style.
     * @param {number} [offsetX=0] - X offset relative to button centre.
     * @param {number} [offsetY=0] - Y offset relative to button centre.
     * @returns {Phaser.GameObjects.Text}
     */
    addText(content, style, offsetX = 0, offsetY = 0) {
        this.label = this.scene.make.text({
            text: content,
            style
        });
        this.label.setOrigin(0.5, 0.5);
        this.label.setPosition(offsetX, offsetY);
        this.add(this.label);
        return this.label;
    }

    /**
     * Inflates the hit area rectangle by given amounts.
     * @param {number} x - Amount to add to width (positive = larger hit area).
     * @param {number} y - Amount to add to height.
     */
    inflateHitArea(x, y) {
        const hitArea = this.input.hitArea;
        if (hitArea && hitArea instanceof Phaser.Geom.Rectangle) {
            Phaser.Geom.Rectangle.Inflate(hitArea, x, y);
        }
    }

    /**
     * Manually emit a press event (e.g., for automated testing).
     * @param {any[]} [args] - Additional arguments to pass with the event.
     */
    emulatePressEvent(args = []) {
        this.emit(ButtonEvent.PRESS, this, ...args);
    }

    /**
     * Manually emit a release event.
     * @param {any[]} [args]
     */
    emulateReleaseEvent(args = []) {
        this.emit(ButtonEvent.RELEASE, this, ...args);
    }

    /**
     * Cleans up scene‑level input listener.
     * @override
     */
    preDestroy() {
        this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this);
        super.preDestroy();
    }
}