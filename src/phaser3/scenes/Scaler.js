/**
 * Scaling types for the Scaler utility.
 * @enum {string}
 */
export const ScaleType = {
    /** Set exact displayWidth/displayHeight (stretch). */
    EXACT: 'EXACT',
    /** Scale to fit inside container while preserving aspect ratio. */
    FIT: 'FIT',
    /** Scale to fill container while preserving aspect ratio (may crop). */
    FILL: 'FILL',
    /** Scale to cover container (envelop) – similar to `cover` in CSS. */
    ENVELOP: 'ENVELOP'
};

/**
 * A helper that manages responsive scaling of game objects.
 * Objects are registered with a scaling type, and their dimensions are updated on resize.
 *
 * @example
 * const scaler = new Scaler(scene, { gameWidth: 800, gameHeight: 600, defaultScale: 1 });
 * scaler.scale(myImage, ScaleType.FIT);
 * scaler.onResize(); // updates all registered objects
 */
export default class Scaler {
    /**
     * @param {Phaser.Scene} scene - The scene.
     * @param {Object} [options]
     * @param {number} [options.gameWidth] - Target game width (defaults to scene.game.config.width).
     * @param {number} [options.gameHeight] - Target game height (defaults to scene.game.config.height).
     * @param {number} [options.defaultScale=1] - Default scale when type is EXACT.
     */
    constructor(scene, options = {}) {
        /** @type {Phaser.Scene} */ this.scene = scene;
        /** @type {number} */ this.gameWidth = options.gameWidth ?? scene.game.config.width;
        /** @type {number} */ this.gameHeight = options.gameHeight ?? scene.game.config.height;
        /** @type {number} */ this.defaultScale = options.defaultScale ?? 1;

        /** @type {Map<any, {obj: any, type: string, options?: any}>} */
        this.items = new Map();
    }

    /**
     * Registers an object for automatic scaling on resize.
     * @param {Phaser.GameObjects.GameObject} obj - The object to scale.
     * @param {ScaleType} [type=ScaleType.EXACT] - Scaling behaviour.
     * @param {Object} [options] - Additional options (currently unused, but reserved).
     */
    scale(obj, type = ScaleType.EXACT, options) {
        this.items.set(obj, { obj, type, options });
    }

    /**
     * Updates all registered objects based on current game dimensions.
     * Call this when the game canvas resizes.
     */
    onResize() {
        const w = this.gameWidth;
        const h = this.gameHeight;
        const defaultScale = this.defaultScale;

        this.items.forEach((item) => {
            const obj = item.obj;
            const type = item.type;

            switch (type) {
                case ScaleType.FILL:
                    obj.displayWidth = w;
                    obj.displayHeight = h;
                    break;

                case ScaleType.ENVELOP:
                    const scaleX = (w + 2) / obj.width;
                    const scaleY = (h + 2) / obj.height;
                    obj.scale = Math.max(scaleX, scaleY);
                    break;

                case ScaleType.FIT:
                    const fitScaleX = w / obj.width;
                    const fitScaleY = h / obj.height;
                    obj.scale = Math.min(fitScaleX, fitScaleY);
                    break;

                default: // EXACT
                    obj.scale = defaultScale;
                    break;
            }
        });
    }

    /**
     * Clears all registered objects.
     */
    destroy() {
        this.items.clear();
        this.items = null;
    }
}