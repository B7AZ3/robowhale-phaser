import Phaser from 'phaser';

/**
 * A utility that pins game objects to relative screen positions.
 * Useful for responsive UI that stays at edges or specific corners.
 *
 * @example
 * const pinner = new Pinner();
 * pinner.pin(myButton, 0.5, 1, 0, -20); // center horizontally, bottom with 20px offset
 * pinner.onResize(800, 600, 1); // updates all pinned objects
 */
export default class Pinner {
    constructor() {
        /** @type {Map<any, {obj: any, x: number, y: number, offsetX: number, offsetY: number}>} */
        this.pins = new Map();
    }

    /**
     * Pins an object to a relative position within a container.
     * @param {Phaser.GameObjects.GameObject} obj - The object to pin.
     * @param {number} x - Relative X (0 = left, 1 = right).
     * @param {number} y - Relative Y (0 = top, 1 = bottom).
     * @param {number} [offsetX=0] - Pixel offset from the calculated X.
     * @param {number} [offsetY=0] - Pixel offset from the calculated Y.
     */
    pin(obj, x, y, offsetX = 0, offsetY = 0) {
        this.pins.set(obj, {
            obj,
            x: Phaser.Math.Clamp(x, 0, 1),
            y: Phaser.Math.Clamp(y, 0, 1),
            offsetX,
            offsetY
        });
    }

    /**
     * Removes a pinned object.
     * @param {any} item - The object previously pinned.
     */
    unpin(item) {
        this.pins.delete(item);
    }

    /**
     * Retrieves the pin data for an object.
     * @param {any} item
     * @returns {Object|undefined}
     */
    getPin(item) {
        return this.pins.get(item);
    }

    /**
     * Aligns a single pinned object to the given dimensions and scale.
     * @param {any} item - The pinned object.
     * @param {number} width - Container width.
     * @param {number} height - Container height.
     * @param {number} scale - Scale factor for offsets.
     */
    align(item, width, height, scale) {
        const pin = this.getPin(item);
        if (pin) {
            this.usePin(pin, width, height, scale);
        }
    }

    /**
     * Updates all pinned objects based on new container dimensions.
     * @param {number} width - New container width.
     * @param {number} height - New container height.
     * @param {number} scale - Scale factor for offsets.
     */
    onResize(width, height, scale) {
        this.pins.forEach((pin) => {
            this.usePin(pin, width, height, scale);
        });
    }

    /**
     * Applies the pin calculation to a single pin entry.
     * @param {Object} pin
     * @param {number} width
     * @param {number} height
     * @param {number} scale
     * @private
     */
    usePin(pin, width, height, scale) {
        pin.obj.x = width * pin.x + pin.offsetX * scale;
        pin.obj.y = height * pin.y + pin.offsetY * scale;
        // Optionally store original values if the object supports them
        if (typeof pin.obj.originalX !== 'undefined') pin.obj.originalX = pin.obj.x;
        if (typeof pin.obj.originalY !== 'undefined') pin.obj.originalY = pin.obj.y;
    }

    /**
     * Clears all pins and cleans up.
     */
    destroy() {
        this.pins.clear();
        this.pins = null;
    }
}