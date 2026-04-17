import Phaser from 'phaser';
import SimpleButton from '../buttons/SimpleButton.js';
import { ButtonEvent } from '../buttons/ButtonEvent.js';

/** @enum {string} */
export const SwitchButtonEvent = {
    ARROW_PRESS: '__ARROW_PRESS'
};

/**
 * A container with a background, optional title/text, and two arrow buttons
 * that emit an event when pressed. Can temporarily disable arrows after a press.
 */
export default class SwitchButton extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Container} [parent] - Optional parent container.
     */
    constructor(scene, parent) {
        super(scene);
        /** @type {boolean} */ this.disableArrows = false;
        /** @type {number} */ this.disableArrowsDuration = 0;
        /** @type {Phaser.GameObjects.Image|null} */ this.back = null;
        /** @type {SimpleButton|null} */ this.leftArrow = null;
        /** @type {SimpleButton|null} */ this.rightArrow = null;
        /** @type {Phaser.GameObjects.Text|null} */ this.title = null;
        /** @type {Phaser.GameObjects.Text|null} */ this.text = null;

        if (parent) parent.add(this);
        else scene.add.existing(this);
    }

    /**
     * Adds a background image.
     * @param {Object} options
     * @param {string} options.key - Texture key.
     * @param {string|number} options.frame - Frame name/index.
     * @param {boolean} [options.interactive=false] - Make background interactive.
     */
    addBack(options) {
        this.back = this.scene.add.image(0, 0, options.key, options.frame);
        this.add(this.back);
        if (options.interactive) this.back.setInteractive();
    }

    /**
     * Adds left and right arrow buttons.
     * @param {Object} options
     * @param {number} options.dx - Horizontal distance from centre to each arrow.
     * @param {number} [options.dy=0] - Vertical offset.
     * @param {Object} options.leftArrow - Config for left button (key, frame).
     * @param {Object} options.rightArrow - Config for right button (key, frame).
     * @param {number} [options.timeoutMs] - If provided, arrows are disabled for this many ms after a press.
     */
    addArrows(options) {
        if (typeof options.timeoutMs === 'number') {
            this.disableArrows = true;
            this.disableArrowsDuration = options.timeoutMs;
        }
        const dy = options.dy || 0;
        this.leftArrow = new SimpleButton(this.scene, {
            texture: options.leftArrow.key,
            frame: options.leftArrow.frame,
            parent: this,
            onPress: () => this.onArrowClick(-1)
        });
        this.leftArrow.setPosition(-options.dx, dy);

        this.rightArrow = new SimpleButton(this.scene, {
            texture: options.rightArrow.key,
            frame: options.rightArrow.frame,
            parent: this,
            onPress: () => this.onArrowClick(1)
        });
        this.rightArrow.setPosition(options.dx, dy);
    }

    /**
     * Called when an arrow is pressed.
     * @param {number} direction - -1 for left, 1 for right.
     * @private
     */
    onArrowClick(direction) {
        this.emit(SwitchButtonEvent.ARROW_PRESS, this, direction);
        if (this.disableArrows) {
            this.disableArrowButtons();
            this.scene.time.delayedCall(this.disableArrowsDuration, () => {
                this.enableArrowButtons();
            });
        }
    }

    /**
     * Adds a title text above the background.
     * @param {Object} options
     * @param {string} options.content - Text content.
     * @param {Phaser.Types.GameObjects.Text.TextStyle} options.style - Text style.
     * @param {number} [options.dx=0] - X offset from centre.
     * @param {number} [options.dy=0] - Y offset from top of background.
     */
    addTitle(options) {
        this.title = this.scene.add.text(0, 0, options.content, options.style);
        this.title.setOrigin(0.5, 0.5);
        this.title.x = options.dx || 0;
        const backTop = this.back.y - (this.back.displayHeight / 2);
        this.title.y = backTop + (options.dy || 0);
        this.add(this.title);
    }

    /**
     * Adds a main text label (centered).
     * @param {Object} options
     * @param {string} options.content
     * @param {Phaser.Types.GameObjects.Text.TextStyle} options.style
     * @param {number} [options.dx=0] - X offset.
     * @param {number} [options.dy=0] - Y offset.
     */
    addText(options) {
        this.text = this.scene.add.text(0, 0, options.content, options.style);
        this.text.setOrigin(0.5, 0.5);
        this.text.x = options.dx || 0;
        this.text.y = options.dy || 0;
        this.add(this.text);
    }

    /**
     * Updates the main text content with a cross‑fade tween.
     * @param {string} content - New text.
     */
    updateText(content) {
        this.scene.tweens.killTweensOf(this.text);
        this.scene.tweens.add({
            targets: this.text,
            duration: 66,
            ease: Phaser.Math.Easing.Linear,
            alpha: 0,
            onComplete: () => {
                this.text.setText(content);
                this.adjustTextSize();
                this.scene.tweens.add({
                    targets: this.text,
                    duration: 150,
                    ease: Phaser.Math.Easing.Cubic.Out,
                    alpha: 1
                });
            }
        });
    }

    /** Automatically scales the main text to fit between the arrow buttons. */
    adjustTextSize() {
        if (!this.leftArrow || !this.rightArrow) return;
        const leftEdge = this.leftArrow.x - (this.leftArrow.displayWidth / 2);
        const rightEdge = this.rightArrow.x + (this.rightArrow.displayWidth / 2);
        const availableWidth = rightEdge - leftEdge;
        const maxWidth = availableWidth * 0.9;
        this.text.scale = Math.min(1, maxWidth / this.text.width);
    }

    /** Sets the container size to match the background image. */
    autoSetSize() {
        if (this.back) this.setSize(this.back.displayWidth, this.back.displayHeight);
    }

    /** Disables both arrow buttons. */
    disableArrowButtons() {
        this.leftArrow?.disableInput();
        this.rightArrow?.disableInput();
    }

    /** Enables both arrow buttons. */
    enableArrowButtons() {
        this.leftArrow?.enableInput();
        this.rightArrow?.enableInput();
    }
}