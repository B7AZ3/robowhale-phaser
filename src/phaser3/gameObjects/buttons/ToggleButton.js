import SimpleButton from './SimpleButton.js';

/**
 * A two‑state toggle button that swaps between two frames on each press.
 * @fires ToggleButton#STATECHANGE
 */
export default class ToggleButton extends SimpleButton {
    /**
     * @param {Phaser.Scene} scene
     * @param {Object} config
     * @param {string} config.texture
     * @param {string|number} config.frameState1 - Frame for state 1.
     * @param {string|number} config.frameState2 - Frame for state 2.
     * @param {1|2} [config.initialState=1] - Starting state.
     * @param {Function} [config.onStateChange] - Callback(state, button).
     * @param {...any} rest - Other SimpleButton config options.
     */
    constructor(scene, config) {
        const { texture, frameState1, frameState2, initialState = 1, onStateChange, ...restConfig } = config;
        if (!texture || frameState1 === undefined || frameState2 === undefined) {
            throw new Error('ToggleButton requires texture, frameState1 and frameState2');
        }
        const initialFrame = (initialState === 1) ? frameState1 : frameState2;
        super(scene, { texture, frame: initialFrame, ...restConfig });

        /** @type {string|number} */ this.frameState1 = frameState1;
        /** @type {string|number} */ this.frameState2 = frameState2;
        /** @type {1|2} */ this._state = initialState;
        /** @type {Function|null} */ this.onStateChangeCallback = onStateChange || null;
    }

    /** @returns {1|2} Current state. */
    get state() {
        return this._state;
    }

    /**
     * Set state manually.
     * @param {1|2} newState
     * @returns {1|2}
     */
    setState(newState) {
        if (newState !== 1 && newState !== 2) throw new Error('State must be 1 or 2');
        if (this._state === newState) return this._state;
        this._state = newState;
        this.setFrame(this._state === 1 ? this.frameState1 : this.frameState2);
        /**
         * State change event.
         * @event ToggleButton#STATECHANGE
         * @param {1|2} state
         * @param {ToggleButton} button
         */
        this.emit('statechange', this._state, this);
        if (this.onStateChangeCallback) this.onStateChangeCallback(this._state, this);
        return this._state;
    }

    /** Toggle between states. */
    toggle() {
        return this.setState(this._state === 1 ? 2 : 1);
    }

    /**
     * On release, toggle state.
     * @override
     * @protected
     */
    onPointerUp() {
        super.onPointerUp();
        this.toggle();
    }
}