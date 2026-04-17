import SimpleButton from './SimpleButton.js';

/**
 * A button that toggles sound effects mute state.
 * Changes frame based on mute state and calls a user‑provided callback.
 * @fires SoundButton#SOUNDMUTECHANGE
 */
export default class SoundButton extends SimpleButton {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {string} config.texture - Texture key.
     * @param {string|number} config.frameOn - Frame when sound is unmuted.
     * @param {string|number} config.frameOff - Frame when sound is muted.
     * @param {boolean} [config.initialMuted=false] - Initial mute state.
     * @param {Function} [config.onToggle] - Callback(isMuted, button).
     * @param {Phaser.GameObjects.Container} [config.parent] - Parent container.
     * @param {...any} rest - Other SimpleButton config options (enableTweens, sound, etc.).
     */
    constructor(scene, config) {
        const { texture, frameOn, frameOff, initialMuted = false, onToggle, ...restConfig } = config;
        if (!texture || frameOn === undefined || frameOff === undefined) {
            throw new Error('SoundButton requires texture, frameOn and frameOff');
        }
        const initialFrame = initialMuted ? frameOff : frameOn;
        super(scene, { texture, frame: initialFrame, ...restConfig });

        /** @type {string|number} */ this.frameOn = frameOn;
        /** @type {string|number} */ this.frameOff = frameOff;
        /** @type {boolean} */ this._muted = initialMuted;
        /** @type {Function|null} */ this.onToggleCallback = onToggle || null;
    }

    /** @returns {boolean} Current mute state. */
    get muted() {
        return this._muted;
    }

    /**
     * Set mute state manually.
     * @param {boolean} muted
     * @returns {boolean} New mute state.
     */
    setMuted(muted) {
        if (this._muted === muted) return this._muted;
        this._muted = muted;
        this.setFrame(this._muted ? this.frameOff : this.frameOn);
        /**
         * Mute change event.
         * @event SoundButton#SOUNDMUTECHANGE
         * @param {boolean} isMuted
         * @param {SoundButton} button
         */
        this.emit('soundmutechange', this._muted, this);
        if (this.onToggleCallback) this.onToggleCallback(this._muted, this);
        return this._muted;
    }

    /** Toggle mute state. */
    toggle() {
        return this.setMuted(!this._muted);
    }

    /**
     * On release, toggle mute.
     * @override
     * @protected
     */
    onPointerUp() {
        super.onPointerUp();
        this.toggle();
    }
}