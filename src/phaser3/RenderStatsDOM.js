import Phaser from 'phaser';

/**
 * A simple DOM overlay that displays real‑time rendering stats:
 * - FPS
 * - Frame time (ms)
 * - Draw calls (WebGL texture flushes)
 *
 * Clicking the stats panel toggles visibility.
 * Automatically positions itself when the canvas is scaled with `Phaser.Scale.FIT`.
 */
export default class RenderStatsDOM {
    /**
     * @param {Phaser.Scene} scene - The scene to monitor.
     */
    constructor(scene) {
        /** @type {Phaser.Scene} */ this.scene = scene;
        /** @type {Phaser.GameLoop} */ this.gameLoop = scene.game.loop;
        /** @type {Phaser.Renderer.WebGL.WebGLRenderer|Phaser.Renderer.Canvas.CanvasRenderer} */ this.renderer = scene.game.renderer;

        // Create stats element
        this.span = document.createElement('span');
        this.span.id = 'phaser-render-stats';
        Object.assign(this.span.style, {
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: '10000',
            cursor: 'pointer',
            userSelect: 'none'
        });
        this.span.addEventListener('click', () => this.toggleVisibility());
        document.body.appendChild(this.span);

        // Listen to resize events to reposition if using FIT mode
        this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
        this.onResize();
    }

    /**
     * Toggles the opacity of the stats panel between 0 and 1.
     */
    toggleVisibility() {
        const current = this.span.style.opacity;
        this.span.style.opacity = current === '0' ? '1' : '0';
    }

    /**
     * Repositions the stats panel when the game uses FIT scaling.
     */
    onResize() {
        if (this.scene.scale.scaleMode === Phaser.Scale.FIT) {
            const canvasBounds = this.scene.scale.canvasBounds;
            if (canvasBounds) {
                this.span.style.left = canvasBounds.left + 'px';
                this.span.style.bottom = '10px';
            }
        } else {
            // Reset to default fixed position
            this.span.style.left = '10px';
            this.span.style.bottom = '10px';
        }
    }

    /**
     * Updates the stats display – should be called every frame (e.g., from scene's `update`).
     * @param {number} delta - Time delta in ms.
     */
    update(delta) {
        const fps = Math.round(this.gameLoop.actualFps);
        const ms = this.gameLoop.delta.toFixed(1);
        const drawCalls = this.getDrawCallsCount();
        this.span.innerText = `FPS: ${fps} | MS: ${ms} | DC: ${drawCalls}`;
    }

    /**
     * Returns the number of draw calls (texture flushes) for WebGL, or 0 for Canvas.
     * @returns {number}
     * @private
     */
    getDrawCallsCount() {
        // WebGL renderer has `textureFlush` property (number of draw calls)
        if (this.renderer && typeof this.renderer.textureFlush === 'number') {
            return this.renderer.textureFlush;
        }
        // Canvas renderer or unknown
        return 0;
    }
}