import Phaser from 'phaser';

/**
 * A collection of static helper methods for Phaser particle emitters.
 * Provides utilities for emission zones, random value emission, and texture‑based emission.
 */
export default class ParticleUtil {
    /**
     * Creates an emission zone that emits particles randomly from an image's non‑transparent pixels.
     * @param {Phaser.Scene} scene - The scene containing the texture.
     * @param {Phaser.GameObjects.Image} image - The image whose shape (non‑transparent pixels) defines the emission area.
     * @param {number} [maxAttempts=1000] - Maximum attempts to find a non‑transparent pixel (prevents infinite loops).
     * @returns {Phaser.Types.GameObjects.Particles.ParticleEmitterEdgeZoneConfig} A zone config for `emitter.emitZone`.
     *
     * @example
     * const image = scene.add.image(0, 0, 'myTexture');
     * const zone = ParticleUtil.getTextureEmitZone(scene, image);
     * emitter.setEmitZone(zone);
     */
    static getTextureEmitZone(scene, image, maxAttempts = 1000) {
        const origin = image.getTopLeft();
        const textureKey = image.texture.key;
        const { width, height } = image;

        const getRandomPoint = (vec) => {
            let attempts = 0;
            let x, y, pixel;
            do {
                if (++attempts > maxAttempts) {
                    console.warn('getTextureEmitZone: max attempts reached, using last sampled pixel');
                    break;
                }
                x = Phaser.Math.Between(0, width);
                y = Phaser.Math.Between(0, height);
                pixel = scene.textures.getPixel(x, y, textureKey);
            } while (pixel.alpha < 255);
            return vec.setTo(x + origin.x, y + origin.y);
        };

        return { getRandomPoint };
    }

    /**
     * Creates an edge emission zone along the circumference of a circle.
     * Particles will emit from the circle's edge, with their angle and rotation automatically set
     * to point outward from the emitter's center.
     *
     * @param {number} radius - Radius of the circle.
     * @param {number} [quantity=360] - Number of points along the edge (higher = smoother).
     * @param {boolean} [randomize=true] - If true, each particle picks a random point on the edge.
     * @returns {Phaser.Types.GameObjects.Particles.ParticleEmitterConfig} Configuration object that can be merged into emitter settings.
     *
     * @example
     * const emitter = scene.add.particles(0, 0, 'particle', {
     *   ...ParticleUtil.getCircleEdgeEmitZone(100, 360, true),
     *   lifespan: 2000,
     *   speed: 100
     * });
     */
    static getCircleEdgeEmitZone(radius, quantity = 360, randomize = true) {
        const circle = new Phaser.Geom.Circle(0, 0, radius);
        const emitZone = {
            source: circle,
            type: 'edge',
            quantity
        };

        const getRotation = (particle) => {
            const emitter = particle.emitter;
            const emitterX = emitter.follow ? emitter.follow.x : emitter.x.propertyValue;
            const emitterY = emitter.follow ? emitter.follow.y : emitter.y.propertyValue;
            return Math.atan2(particle.y - emitterY, particle.x - emitterX);
        };

        const baseConfig = {
            emitZone,
            angle: {
                onEmit: (particle) => getRotation(particle) * Phaser.Math.RAD_TO_DEG
            },
            rotate: {
                onEmit: (particle) => (getRotation(particle) + Math.PI / 2) * Phaser.Math.RAD_TO_DEG
            }
        };

        if (!randomize) return baseConfig;

        // Add randomisation: each particle picks a different point on the edge
        return {
            ...baseConfig,
            emitCallback: (particle, emitter) => {
                const zone = emitter.emitZone;
                if (zone && zone.points) {
                    zone.counter = Phaser.Math.RND.between(0, zone.points.length - 1);
                }
            }
        };
    }

    /**
     * Returns an `onEmit` function that generates a random value between `from` and `to`.
     * Useful for particle properties like `speed`, `scale`, `alpha`, etc.
     *
     * @param {number} from - Minimum value.
     * @param {number} to - Maximum value.
     * @returns {{ onEmit: () => number }} Object with `onEmit` function.
     *
     * @example
     * emitter.setSpeed(ParticleUtil.onEmitRandom(50, 150));
     */
    static onEmitRandom(from, to) {
        return {
            onEmit: () => Phaser.Math.RND.realInRange(from, to)
        };
    }
}