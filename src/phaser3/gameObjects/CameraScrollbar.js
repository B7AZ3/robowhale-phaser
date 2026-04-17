import Phaser from 'phaser';

/**
 * A vertical scrollbar UI element that controls the Y‑scroll of a given camera.
 * The scrollbar can be dragged or will automatically update its position when the camera moves.
 *
 * @example
 * const scrollbar = new CameraScrollbar(scene, scene.cameras.main, 'scrollbar_texture', 'thumb_frame');
 * scrollbar.setGameHeight(600); // if not using the default scene height
 * scene.add.existing(scrollbar);
 * // Then call scrollbar.onResize() whenever the game size changes.
 */
export default class CameraScrollbar extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene - The scene.
     * @param {Phaser.Cameras.Scene2D.Camera} camera - The camera to control.
     * @param {string} texture - Texture key for the scrollbar thumb.
     * @param {string|number} [frame] - Optional frame.
     * @param {Object} [options]
     * @param {number} [options.gameHeight] - Override for the game height (defaults to scene.game.config.height).
     * @param {number} [options.verticalPadding=6] - Padding from top/bottom of screen in pixels (scaled by scrollbar scaleY).
     * @param {boolean} [options.useGlobalPointerEvents=true] - If true, uses scene.input.on('pointermove') instead of document.
     */
    constructor(scene, camera, texture, frame, options = {}) {
        super(scene, 0, 0, texture, frame);

        const {
            gameHeight = scene.game.config.height,
            verticalPadding = 6,
            useGlobalPointerEvents = true
        } = options;

        /** @type {Phaser.Cameras.Scene2D.Camera} */ this.camera = camera;
        /** @type {number} */ this.gameHeight = gameHeight;
        /** @type {number} */ this.verticalPadding = verticalPadding;
        /** @type {boolean} */ this.useGlobalPointerEvents = useGlobalPointerEvents;

        /** @type {boolean} */ this.isDragged = false;
        /** @type {number} */ this.scrollTop = 0;
        /** @type {number} */ this.scrollBottom = 0;
        /** @type {number} */ this.scrollHeight = 0;

        this.setInteractive({ draggable: true });
        this.input.cursor = 'pointer';

        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart, this);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd, this);

        // Initialize bounds
        this.onResize();
    }

    /**
     * Called when dragging starts.
     * @private
     */
    onDragStart(pointer) {
        this.isDragged = true;
        if (this.useGlobalPointerEvents) {
            // Use Phaser's global pointer move event for smoother dragging
            this.scene.input.on('pointermove', this.onDragMove, this);
        } else {
            // Fallback to raw DOM events (not recommended but available)
            window.addEventListener('pointermove', this.onWindowPointerMove);
        }
    }

    /**
     * Handles pointer move during drag.
     * @param {Phaser.Input.Pointer} pointer
     * @private
     */
    onDragMove(pointer) {
        // Convert pointer position to scene world Y
        const gameY = pointer.worldY ?? pointer.y;
        this.y = Phaser.Math.Clamp(gameY, this.scrollTop, this.scrollBottom);
        this.updateCameraPosition();
    }

    /**
     * Alternative for DOM pointermove.
     * @param {PointerEvent} event
     * @private
     */
    onWindowPointerMove = (event) => {
        const gameY = this.scene.scale.transformY(event.clientY);
        this.y = Phaser.Math.Clamp(gameY, this.scrollTop, this.scrollBottom);
        this.updateCameraPosition();
    };

    /**
     * Updates camera scrollY based on current thumb position.
     * @private
     */
    updateCameraPosition() {
        const bounds = this.camera.getBounds();
        const cameraTop = bounds.y;
        const cameraBottom = bounds.bottom - (this.gameHeight / this.camera.zoom);
        const scrollPercent = (this.y - this.scrollTop) / this.scrollHeight;
        const targetScrollY = (cameraBottom - cameraTop) * scrollPercent;
        this.camera.scrollY = Phaser.Math.Clamp(targetScrollY, cameraTop, cameraBottom);
    }

    /**
     * Called when dragging ends.
     * @private
     */
    onDragEnd() {
        this.isDragged = false;
        if (this.useGlobalPointerEvents) {
            this.scene.input.off('pointermove', this.onDragMove, this);
        } else {
            window.removeEventListener('pointermove', this.onWindowPointerMove);
        }
    }

    /**
     * Recalculates the scrollbar's vertical range and position.
     * Call this after game size changes or camera zoom changes.
     */
    onResize() {
        const halfHeight = this.displayHeight / 2;
        const paddingPx = this.verticalPadding * this.scaleY;
        this.scrollTop = halfHeight + paddingPx;
        this.scrollBottom = this.gameHeight - halfHeight - paddingPx;
        this.scrollHeight = this.scrollBottom - this.scrollTop;
    }

    /**
     * Automatically updates the thumb position when the camera scrolls (if not being dragged).
     * @param {number} time - Unused.
     * @param {number} delta - Unused.
     */
    preUpdate(time, delta) {
        if (this.isDragged) return;

        const bounds = this.camera.getBounds();
        const cameraTop = bounds.y;
        const cameraBottom = bounds.bottom - (this.gameHeight / this.camera.zoom);
        const cameraY = Math.max(0, this.camera.scrollY);
        const percent = Phaser.Math.Clamp(cameraY / (cameraBottom - cameraTop), 0, 1);
        this.y = this.scrollTop + (this.scrollHeight) * percent;
    }

    /**
     * Set a custom game height (e.g., if your game uses a fixed virtual height).
     * @param {number} height
     */
    setGameHeight(height) {
        this.gameHeight = height;
        this.onResize();
    }

    /**
     * Clean up event listeners.
     */
    destroy() {
        this.onDragEnd(); // ensure listeners removed
        this.off(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart, this);
        this.off(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd, this);
        super.destroy();
    }
}