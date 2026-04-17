import ComplexButton from './ComplexButton.js';
import { ButtonEvent } from './ButtonEvent.js';

/**
 * A button that toggles music mute state.
 * The button image changes between two frames based on mute state.
 * It fires a custom 'musicmutechange' event and calls user callbacks.
 *
 * @fires MusicButton#MUTE_CHANGE
 *
 * @example
 * const musicBtn = new MusicButton(scene, {
 *   texture: 'ui_atlas',
 *   frameOn: 'music_on',
 *   frameOff: 'music_off',
 *   isMuted: false,          // initial mute state
 *   onToggle: (isMuted) => {
 *     myAudioManager.muteMusic(isMuted);
 *   }
 * });
 */
export default class MusicButton extends ComplexButton {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {string} config.texture - Atlas key for the button frames.
     * @param {string|number} config.frameOn - Frame when music is unmuted (playing).
     * @param {string|number} config.frameOff - Frame when music is muted.
     * @param {boolean} [config.isMuted=false] - Initial mute state.
     * @param {Function} [config.onToggle] - Callback(isMuted) fired when mute state changes.
     * @param {Object} [config.parent] - Optional parent container.
     * @param {Object} [config.sound] - Optional press sound config (inherited).
     * @param {boolean} [config.enableTweens] - etc. All other ComplexButton options.
     */
    constructor(scene, config) {
        const { texture, frameOn, frameOff, isMuted = false, onToggle, ...restConfig } = config;

        if (!texture || frameOn === undefined || frameOff === undefined) {
            throw new Error('MusicButton requires texture, frameOn and frameOff');
        }

        // Initial frame depends on mute state
        const initialFrame = isMuted ? frameOff : frameOn;
        super(scene, { texture, frame: initialFrame, ...restConfig });

        /** @type {string|number} */ this.frameOn = frameOn;
        /** @type {string|number} */ this.frameOff = frameOff;
        /** @type {boolean} */ this.isMuted = isMuted;
        /** @type {Function|null} */ this.onToggleCallback = onToggle || null;
    }

    /**
     * Updates the button frame based on mute state.
     * @param {boolean} muted
     * @private
     */
    updateFrame(muted) {
        this.back.setFrame(muted ? this.frameOff : this.frameOn);
    }

    /**
     * Toggles the mute state, updates frame, emits events, and calls callback.
     * @param {boolean} [newState] - If provided, set to this state; otherwise toggle.
     * @returns {boolean} The new mute state.
     */
    setMuted(newState) {
        const nextState = newState !== undefined ? newState : !this.isMuted;
        if (nextState === this.isMuted) return this.isMuted;

        this.isMuted = nextState;
        this.updateFrame(this.isMuted);

        /**
         * Mute change event.
         * @event MusicButton#MUTE_CHANGE
         * @param {boolean} isMuted - New mute state.
         * @param {MusicButton} button
         */
        this.emit('musicmutechange', this.isMuted, this);
        if (this.onToggleCallback) this.onToggleCallback(this.isMuted, this);

        return this.isMuted;
    }

    /**
     * Override: on release, toggle mute state.
     * @override
     * @protected
     */
    onPointerUp() {
        this.setMuted(); // toggle
    }
}