import Phaser from 'phaser';

/**
 * A toast notification with a rounded background and text.
 * Automatically dismisses after a lifespan and fades out on tap.
 */
export default class Toast extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} options
     * @param {string} options.message - Text content.
     * @param {number} [options.widthPercent=0.7] - Width relative to game width (0-1).
     * @param {number} [options.height=110] - Fixed height in pixels.
     * @param {number} [options.backgroundColor=0x000000] - Background color.
     * @param {number} [options.backgroundAlpha=0.8] - Background opacity.
     * @param {number} [options.cornerRadius=20] - Rounded corner radius (top-left/top-right).
     * @param {Object} [options.textStyle] - Phaser text style overrides.
     * @param {string} [options.fontFamily] - Font family (defaults to 'Arial').
     * @param {number} [options.fontSize=28] - Font size in pixels.
     * @param {string} [options.textColor='#ffffff'] - Text color.
     * @param {number} [options.paddingX=0] - Text horizontal padding.
     * @param {number} [options.paddingY=4] - Text vertical padding.
     */
    constructor(scene, options) {
        super(scene);
        this.name = 'toast';
        this.options = options;

        /** @type {Phaser.GameObjects.Graphics} */
        this.back = null;
        /** @type {Phaser.GameObjects.Text} */
        this.text = null;
        /** @type {Phaser.Time.TimerEvent|null} */
        this.dismissTimerEvent = null;

        this.addBack();
        this.addText(options.message);
        this.setSize(this.back.width, this.back.height);
        this.setInteractive({ useHandCursor: true });
        this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.dismiss, this);
    }

    /** @private */
    addBack() {
        const widthPercent = this.options.widthPercent ?? 0.7;
        const gameWidth = this.scene.game.config.width;
        const width = gameWidth * Math.min(1, Math.max(0, widthPercent));
        const height = this.options.height ?? 110;
        const bgColor = this.options.backgroundColor ?? 0x000000;
        const bgAlpha = this.options.backgroundAlpha ?? 0.8;
        const radius = this.options.cornerRadius ?? 20;

        this.back = this.scene.add.graphics({
            fillStyle: { color: bgColor, alpha: bgAlpha },
            lineStyle: { width: 0, color: 0, alpha: 1 }
        });
        // Rounded rectangle: top corners rounded, bottom corners square (as original)
        this.back.fillRoundedRect(-width / 2, -height / 2, width, height, { tl: radius, tr: radius, bl: 0, br: 0 });
        this.back.stroke();
        this.back.width = width;
        this.back.height = height;
        this.add(this.back);
    }

    /** @private */
    addText(textContent) {
        const defaultStyle = {
            fontFamily: this.options.fontFamily ?? 'Arial',
            fontSize: `${this.options.fontSize ?? 28}px`,
            color: this.options.textColor ?? '#ffffff',
            align: 'center',
            padding: { x: this.options.paddingX ?? 0, y: this.options.paddingY ?? 4 }
        };
        const style = { ...defaultStyle, ...(this.options.textStyle || {}) };
        this.text = this.scene.add.text(0, 0, textContent, style);
        this.text.setOrigin(0.5, 0.5);
        this.text.setLineSpacing(0);
        this.text.setWordWrapWidth(this.back.width * 0.85, true);
        this.text.setShadow(0, 3, 'rgba(0,0,0,0.5)', 0);
        this.add(this.text);
        this.adjustTextSize();
    }

    /** @private */
    adjustTextSize() {
        const maxHeight = this.back.height * 0.8;
        this.text.scale = Math.min(1, maxHeight / this.text.height);
    }

    /**
     * Shows the toast with an entry animation and auto‑dismiss timer.
     * @param {number} lifespan - Milliseconds before auto‑dismiss.
     */
    show(lifespan) {
        const deltaY = 20;
        this.alpha = 0;
        this.y += deltaY;
        this.scene.tweens.add({
            targets: this,
            duration: 150,
            ease: Phaser.Math.Easing.Cubic.Out,
            alpha: 1,
            y: this.y - deltaY,
            onComplete: () => this.onShowComplete(lifespan)
        });
    }

    /** @private */
    onShowComplete(lifespan) {
        this.dismissTimerEvent = this.scene.time.delayedCall(lifespan, () => {
            this.dismiss();
        });
    }

    /** Dismisses the toast with fade‑out animation and destroys it. */
    dismiss() {
        this.dismissTimerEvent?.remove();
        this.scene.tweens.add({
            targets: this,
            duration: 150,
            ease: Phaser.Math.Easing.Linear,
            alpha: 0,
            y: '+=15',
            onComplete: () => this.destroy()
        });
    }

    /** @override */
    preDestroy() {
        this.dismissTimerEvent?.remove();
        this.scene.tweens.killTweensOf(this);
    }
}