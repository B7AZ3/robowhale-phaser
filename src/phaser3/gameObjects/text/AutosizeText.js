import Phaser from 'phaser';

/**
 * A Text object that automatically scales its font size (and optionally word wraps)
 * to fit within a specified maximum width and height.
 *
 * The text remains centered (origin 0.5,0.5) and will shrink uniformly to fit,
 * but never grow beyond its original font size.
 *
 * @example
 * const autoText = new AutosizeText(scene, 400, 300, 'Long text here...', {
 *   fontFamily: 'Arial',
 *   fontSize: '32px',
 *   color: '#ffffff'
 * });
 * autoText.setMaxSize(300, 100); // fits inside 300x100 box
 */
export default class AutosizeText extends Phaser.GameObjects.Text {
    /**
     * @param {Phaser.Scene} scene - The scene.
     * @param {number} x - X position (center).
     * @param {number} y - Y position (center).
     * @param {string} text - Initial text content.
     * @param {Phaser.Types.GameObjects.Text.TextStyle} style - Text style.
     * @param {Object} [options]
     * @param {number} [options.maxWidth=0] - Maximum width (0 = no limit).
     * @param {number} [options.maxHeight=0] - Maximum height (0 = no limit).
     * @param {boolean} [options.wordWrap=true] - Enable word wrap based on maxWidth.
     * @param {number} [options.minFontSize=8] - Minimum allowed font size (pixels).
     */
    constructor(scene, x, y, text, style, options = {}) {
        super(scene, x, y, text, style);
        this.setOrigin(0.5, 0.5);

        /** @type {number} */ this.maxWidth = options.maxWidth || 0;
        /** @type {number} */ this.maxHeight = options.maxHeight || 0;
        /** @type {boolean} */ this.wordWrap = options.wordWrap !== false;
        /** @type {number} */ this.minFontSize = options.minFontSize || 8;

        // Store the original font size (in pixels) from the style
        let originalSize = parseInt(style.fontSize, 10);
        if (isNaN(originalSize)) originalSize = 32; // fallback
        this._originalFontSize = originalSize;

        // Apply initial sizing
        this.adjustTextSize();
    }

    /**
     * Sets the maximum allowed dimensions and re‑fits the text.
     * @param {number} width - Maximum width (0 = no limit).
     * @param {number} height - Maximum height (0 = no limit).
     * @returns {this}
     */
    setMaxSize(width, height) {
        this.maxWidth = width;
        this.maxHeight = height;
        this.adjustTextSize();
        return this;
    }

    /**
     * Updates the text content and re‑fits the size.
     * @param {string} value - New text.
     * @returns {this}
     */
    setText(value) {
        super.setText(value);
        this.adjustTextSize();
        return this;
    }

    /**
     * Recalculates the font size and word wrap to fit within max dimensions.
     * Uses binary search for optimal font size.
     */
    adjustTextSize() {
        if (this.maxWidth <= 0 && this.maxHeight <= 0) return;

        // Store original font size for reference
        let currentFontSize = this._originalFontSize;
        let low = this.minFontSize;
        let high = this._originalFontSize;
        let bestFontSize = currentFontSize;

        // Helper to test if text fits at a given font size
        const fits = (size) => {
            // Temporarily set font size
            this.setFontSize(size);
            // Enable word wrap if needed and maxWidth > 0
            if (this.wordWrap && this.maxWidth > 0) {
                this.setWordWrapWidth(this.maxWidth);
            } else {
                this.setWordWrapWidth(0);
            }

            // Measure bounds
            const bounds = this.getBounds();
            let widthOk = (this.maxWidth <= 0) || (bounds.width <= this.maxWidth);
            let heightOk = (this.maxHeight <= 0) || (bounds.height <= this.maxHeight);
            return widthOk && heightOk;
        };

        // Binary search for largest font size that fits
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (fits(mid)) {
                bestFontSize = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        // Apply the best size
        this.setFontSize(bestFontSize);
        if (this.wordWrap && this.maxWidth > 0) {
            this.setWordWrapWidth(this.maxWidth);
        } else {
            this.setWordWrapWidth(0);
        }

        // Optionally center the text (origin is already 0.5,0.5)
        this.setPosition(this.x, this.y);
    }

    /**
     * Helper to set font size in pixels.
     * @param {number} sizePx
     * @private
     */
    setFontSize(sizePx) {
        this.setFontSize(sizePx + 'px');
    }
}