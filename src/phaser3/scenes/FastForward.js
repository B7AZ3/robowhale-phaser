import Phaser from 'phaser';

/** @enum {string} */
export const FastForwardEvent = {
    START: '__START',
    STOP: '__STOP'
};

/**
 * A helper that allows temporarily speeding up the scene (tweens and time).
 * Useful for fast‑forwarding animations, cutscenes, or game logic.
 *
 * @fires FastForwardEvent#START
 * @fires FastForwardEvent#STOP
 */
export default class FastForward extends Phaser.Events.EventEmitter {
    /**
     * @param {Phaser.Scene} scene - The scene to control.
     */
    constructor(scene) {
        super();
        /** @type {Phaser.Scene} */ this.scene = scene;
        /** @type {boolean} */ this.isActive = false;
        /** @type {number} */ this._timeScale = 1;
    }

    /** @returns {number} Current time scale (1 = normal). */
    get timeScale() {
        return this._timeScale;
    }

    /**
     * Starts fast‑forward with a given time scale.
     * @param {number} timeScale - Speed multiplier (>1 speeds up, <1 slows down).
     */
    start(timeScale) {
        if (this.isActive) return;
        this.isActive = true;
        this._timeScale = timeScale;
        this.scene.tweens.timeScale = timeScale;
        this.scene.time.timeScale = timeScale;
        this.getFastForwardables().forEach(item => { item.timeScale = timeScale; });
        this.emit(FastForwardEvent.START, this, timeScale);
    }

    /**
     * Stops fast‑forward, restoring normal speed.
     */
    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        this._timeScale = 1;
        this.scene.tweens.timeScale = 1;
        this.scene.time.timeScale = 1;
        this.getFastForwardables().forEach(item => { item.timeScale = 1; });
        this.emit(FastForwardEvent.STOP, this);
    }

    /**
     * Returns all active game objects that have a `timeScale` property.
     * @returns {Array<{timeScale: number}>}
     * @private
     */
    getFastForwardables() {
        const updateList = this.scene.sys.updateList;
        if (!updateList) return [];
        return updateList.getActive().filter(item => typeof item.timeScale === 'number');
    }

    /**
     * Cleans up, ensuring fast‑forward is stopped.
     */
    destroy() {
        this.stop();
        super.destroy();
    }
}