import Phaser from 'phaser';

/**
 * Kinetic scrolling (inertial scrolling) for a Phaser camera.
 * Supports touch/pointer drag, mouse wheel, and configurable axes.
 *
 * @example
 * const scroller = new KineticScroll(this, {
 *   camera: this.cameras.main,
 *   horizontalScroll: true,
 *   verticalScroll: true,
 *   kineticMovement: true,
 *   wheelScrollAmount: 150
 * });
 * scroller.addPointerListeners();
 * // In scene's update() method:
 * scroller.update();
 */
export default class KineticScroll {
    /**
     * @param {Phaser.Scene} scene - The Phaser scene.
     * @param {Object} [settings] - Configuration options.
     * @param {Phaser.Cameras.Scene2D.Camera} [settings.camera] - Camera to scroll. Defaults to scene's main camera.
     * @param {boolean} [settings.kineticMovement=true] - Enable kinetic (inertial) movement after drag ends.
     * @param {number} [settings.timeConstantScroll=325] - Decay time constant for kinetic movement (higher = longer).
     * @param {boolean} [settings.horizontalScroll=true] - Allow horizontal scrolling.
     * @param {boolean} [settings.verticalScroll=true] - Allow vertical scrolling.
     * @param {boolean} [settings.horizontalWheel=false] - Enable horizontal mouse wheel scrolling.
     * @param {boolean} [settings.verticalWheel=false] - Enable vertical mouse wheel scrolling.
     * @param {number} [settings.wheelScrollAmount=100] - Base wheel scroll delta.
     * @param {number} [settings.wheelDeceleration=0.95] - Deceleration factor per frame for wheel scrolling.
     * @param {Function} [settings.onUpdate] - Callback(deltaX, deltaY) called on every scroll delta.
     * @param {number} [settings.scrollMultiplier=1] - Multiplier for vertical scroll sensitivity.
     */
    constructor(scene, settings = {}) {
        this.scene = scene;

        const defaultSettings = {
            camera: this.scene.cameras.main,
            kineticMovement: true,
            timeConstantScroll: 325,
            horizontalScroll: true,
            verticalScroll: true,
            horizontalWheel: false,
            verticalWheel: false,
            wheelScrollAmount: 100,
            wheelDeceleration: 0.95,
            onUpdate: null,
            scrollMultiplier: 1
        };

        this.settings = { ...defaultSettings, ...settings };

        // Internal state
        this.thresholdOfTapTime = 100;
        this.thresholdOfTapDistance = 10;

        this.pointerId = null;
        this.pressedDown = false;
        this.dragging = false;

        this.startX = 0;
        this.startY = 0;
        this.screenX = 0;
        this.screenY = 0;
        this.timestamp = 0;
        this.beginTime = 0;
        this.now = 0;
        this.elapsed = 0;
        this.moveTimestamp = 0;

        this.velocityX = 0;
        this.velocityY = 0;
        this.amplitudeX = 0;
        this.amplitudeY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.autoScrollX = false;
        this.autoScrollY = false;

        this.velocityWheelX = 0;
        this.velocityWheelY = 0;
        this.velocityWheelXAbs = 0;
        this.velocityWheelYAbs = 0;

        this.tempCameraBounds = new Phaser.Geom.Rectangle();
    }

    /**
     * Attaches all required pointer listeners to the scene.
     * Must be called after construction for the scroller to work.
     */
    addPointerListeners() {
        this.scene.input.on('pointerdown', this.onPointerDown, this);
        this.scene.input.on('pointerup', this.endMove, this);
        this.scene.input.on('pointermove', this.move, this);

        if (this.settings.verticalWheel || this.settings.horizontalWheel) {
            this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.onPointerWheel, this);
        }
    }

    /**
     * Removes pointer listeners. Useful for cleanup.
     */
    removePointerListeners() {
        this.scene.input.off('pointerdown', this.onPointerDown, this);
        this.scene.input.off('pointerup', this.endMove, this);
        this.scene.input.off('pointermove', this.move, this);
        this.scene.input.off(Phaser.Input.Events.POINTER_WHEEL, this.onPointerWheel, this);
    }

    /**
     * Handles pointer down – starts potential drag.
     * @private
     */
    onPointerDown(pointer, objects) {
        if (objects.length > 0) return; // Don't scroll if clicking on a UI element
        this.beginMove(pointer);
    }

    /**
     * Handles mouse wheel events.
     * @private
     */
    onPointerWheel(pointer, objects, dx, dy) {
        if (this.settings.horizontalWheel) {
            this.velocityWheelX = -Math.sign(dx) * this.settings.wheelScrollAmount;
        }
        if (this.settings.verticalWheel) {
            this.velocityWheelY = -Math.sign(dy) * this.settings.wheelScrollAmount;
        }
    }

    /**
     * Initialises drag start.
     * @private
     */
    beginMove(pointer) {
        this.pointerId = pointer.id;
        this.startX = this.scene.input.x;
        this.startY = this.scene.input.y;
        this.screenX = pointer.screenX;
        this.screenY = pointer.screenY;
        this.pressedDown = true;
        this.timestamp = this.getNow();
        this.beginTime = this.timestamp;
        this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
        this.autoScrollX = false;
        this.autoScrollY = false;
        this.dragging = false;
    }

    /**
     * Checks if camera can move horizontally (not at left/right bounds).
     * @returns {boolean}
     * @private
     */
    canCameraMoveX() {
        const camera = this.settings.camera;
        camera.getBounds(this.tempCameraBounds);
        return camera.scrollX > 0 && camera.scrollX + camera.width < this.tempCameraBounds.right;
    }

    /**
     * Checks if camera can move vertically (not at top/bottom bounds).
     * @returns {boolean}
     * @private
     */
    canCameraMoveY() {
        const camera = this.settings.camera;
        camera.getBounds(this.tempCameraBounds);
        return camera.scrollY > 0 && camera.scrollY + camera.height < this.tempCameraBounds.height;
    }

    /**
     * Handles pointer movement – scrolls the camera.
     * @private
     */
    move(pointer) {
        if (!this.pressedDown) return;
        if (this.pointerId !== pointer.id) return;

        const x = pointer.x;
        const y = pointer.y;
        this.now = this.getNow();
        const elapsed = this.now - this.timestamp;
        this.timestamp = this.now;

        if (this.isTap(pointer)) return;

        const cam = this.settings.camera;
        let deltaX = 0;
        let deltaY = 0;

        if (this.settings.horizontalScroll) {
            deltaX = x - this.startX;
            if (deltaX !== 0) this.dragging = true;
            this.startX = x;
            this.velocityX = 0.8 * (1000 * deltaX / (1 + elapsed)) + 0.2 * this.velocityX;
            cam.setScroll(cam.scrollX - deltaX, cam.scrollY);
        }

        if (this.settings.verticalScroll) {
            deltaY = (y - this.startY) * this.settings.scrollMultiplier;
            if (deltaY !== 0) this.dragging = true;
            this.startY = y;
            this.velocityY = 0.8 * (1000 * deltaY / (1 + elapsed)) + 0.2 * this.velocityY;
            cam.setScroll(cam.scrollX, cam.scrollY - deltaY);
        }

        this.callCustomUpdate(deltaX, deltaY);
        this.moveTimestamp = this.getNow();
    }

    /**
     * Calls user's onUpdate callback with current deltas (respecting bounds).
     * @private
     */
    callCustomUpdate(deltaX, deltaY) {
        if (typeof this.settings.onUpdate !== 'function') return;
        const updateX = this.canCameraMoveX() ? deltaX : 0;
        const updateY = this.canCameraMoveY() ? deltaY : 0;
        this.settings.onUpdate(updateX, updateY);
    }

    /**
     * Determines if the pointer movement was a tap (not a drag).
     * @private
     */
    isTap(pointer) {
        const now = this.getNow();
        return (now - this.beginTime < this.thresholdOfTapTime &&
                Math.abs(pointer.screenY - this.screenY) < this.thresholdOfTapDistance &&
                Math.abs(pointer.screenX - this.screenX) < this.thresholdOfTapDistance);
    }

    /**
     * Ends the drag and starts kinetic movement (if enabled).
     */
    endMove() {
        this.pointerId = null;
        this.pressedDown = false;
        this.autoScrollX = false;
        this.autoScrollY = false;

        if (!this.settings.kineticMovement) return;

        this.now = this.getNow();
        const cam = this.settings.camera;

        if (this.withinGame()) {
            if (Math.abs(this.velocityX) > 10) {
                this.amplitudeX = 0.8 * this.velocityX;
                this.targetX = Math.round(cam.scrollX - this.amplitudeX);
                this.autoScrollX = true;
            }
            if (Math.abs(this.velocityY) > 10) {
                this.amplitudeY = 0.8 * this.velocityY;
                this.targetY = Math.round(cam.scrollY - this.amplitudeY);
                this.autoScrollY = true;
            }
        }

        if (!this.withinGame()) {
            this.velocityWheelXAbs = Math.abs(this.velocityWheelX);
            this.velocityWheelYAbs = Math.abs(this.velocityWheelY);
            if (this.settings.horizontalScroll && this.velocityWheelXAbs < 0.1) {
                this.autoScrollX = true;
            }
            if (this.settings.verticalScroll && this.velocityWheelYAbs < 0.1) {
                this.autoScrollY = true;
            }
        }
    }

    /**
     * Updates the kinetic movement and wheel deceleration.
     * Must be called every frame (e.g., in scene's update()).
     */
    update() {
        const timeSinceMove = this.getNow() - this.moveTimestamp;
        if (timeSinceMove > 20) {
            this.velocityX = 0;
            this.velocityY = 0;
        }

        this.elapsed = this.getNow() - this.timestamp;
        this.velocityWheelXAbs = Math.abs(this.velocityWheelX);
        this.velocityWheelYAbs = Math.abs(this.velocityWheelY);

        const cam = this.settings.camera;

        // Kinetic horizontal movement
        if (this.autoScrollX && this.amplitudeX !== 0) {
            let delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
            if (this.canCameraMoveX() && Math.abs(delta) > 0.5) {
                cam.setScroll(this.targetX - delta, cam.scrollY);
            } else {
                this.autoScrollX = false;
                cam.setScroll(this.targetX, cam.scrollY);
            }
        }

        // Kinetic vertical movement
        if (this.autoScrollY && this.amplitudeY !== 0) {
            let delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
            if (this.canCameraMoveY() && Math.abs(delta) > 0.5) {
                cam.setScroll(cam.scrollX, this.targetY - delta);
            } else {
                this.autoScrollY = false;
                cam.setScroll(cam.scrollX, this.targetY);
            }
        }

        if (!this.autoScrollX && !this.autoScrollY) {
            this.dragging = false;
        }

        // Horizontal wheel deceleration
        if (this.settings.horizontalWheel && Math.abs(this.velocityWheelX) > 0.1) {
            this.dragging = true;
            this.amplitudeX = 0;
            this.autoScrollX = false;
            cam.setScroll(cam.scrollX - this.velocityWheelX, cam.scrollY);
            this.velocityWheelX *= this.settings.wheelDeceleration;
        }

        // Vertical wheel deceleration
        if (this.settings.verticalWheel && Math.abs(this.velocityWheelY) > 0.1) {
            this.dragging = true;
            this.autoScrollY = false;
            cam.setScroll(cam.scrollX, cam.scrollY - this.velocityWheelY);
            this.velocityWheelY *= this.settings.wheelDeceleration;
        }
    }

    /**
     * Returns current timestamp (performance.now if available).
     * @returns {number}
     * @private
     */
    getNow() {
        return performance?.now ? performance.now() : Date.now();
    }

    /**
     * Checks if the pointer is still within the game canvas.
     * Override this method to change behaviour.
     * @returns {boolean}
     */
    withinGame() {
        // Original placeholder – always true.
        // You can override by extending the class or modify the method.
        return true;
    }

    /**
     * Immediately stops any kinetic or wheel scrolling.
     */
    resetScroll() {
        this.autoScrollX = false;
        this.autoScrollY = false;
        this.velocityWheelX = 0;
        this.velocityWheelY = 0;
        this.dragging = false;
    }
}