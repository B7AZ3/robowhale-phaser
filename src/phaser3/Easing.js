/**
 * Standard easing names compatible with Phaser's tween system.
 * These strings can be used directly in tween configurations.
 *
 * @example
 * scene.tweens.add({
 *   targets: obj,
 *   x: 100,
 *   ease: Ease.QuadOut
 * });
 */
export const Ease = {
    Linear: 'Linear',
    Stepped: 'Stepped',
    QuadIn: 'Quadratic.In',
    CubicIn: 'Cubic.In',
    QuartIn: 'Quartic.In',
    QuintIn: 'Quintic.In',
    SineIn: 'Sine.In',
    ExpoIn: 'Expo.In',
    CircIn: 'Circular.In',
    ElasticIn: 'Elastic.In',
    BackIn: 'Back.In',
    BounceIn: 'Bounce.In',
    QuadOut: 'Quadratic.Out',
    CubicOut: 'Cubic.Out',
    QuartOut: 'Quartic.Out',
    QuintOut: 'Quintic.Out',
    SineOut: 'Sine.Out',
    ExpoOut: 'Expo.Out',
    CircOut: 'Circular.Out',
    ElasticOut: 'Elastic.Out',
    BackOut: 'Back.Out',
    BounceOut: 'Bounce.Out',
    QuadInOut: 'Quadratic.InOut',
    CubicInOut: 'Cubic.InOut',
    QuartInOut: 'Quartic.InOut',
    QuintInOut: 'Quintic.InOut',
    SineInOut: 'Sine.InOut',
    ExpoInOut: 'Expo.InOut',
    CircInOut: 'Circular.InOut',
    ElasticInOut: 'Elastic.InOut',
    BackInOut: 'Back.InOut',
    BounceInOut: 'Bounce.InOut'
};

/**
 * Custom easing functions that can be used with `ease: (t) => ...` in tweens.
 */
export const CustomEase = {
    /**
     * Bell‑shaped curve.
     * @param {number} t - Progress (0 to 1).
     * @param {number} [a=1] - Sharpness exponent (higher = sharper peak).
     * @returns {number}
     */
    Bell: (t, a = 1) => Math.pow(4, a) * Math.pow(t * (1 - t), a),
    /** Cube root bell curve. */
    BellCbrt: (t) => Math.cbrt(4) * Math.cbrt(t * (1 - t)),
    /** Square root bell curve. */
    BellSqrt: (t) => Math.sqrt(4) * Math.sqrt(t * (1 - t)),
    /** Basic bell curve (quadratic). */
    BellBasic: (t) => 4 * (t * (1 - t)),
    /** Quartic bell curve. */
    BellQuad: (t) => 16 * Math.pow(t * (1 - t), 2),
    /** Cubic bell curve (power 6). */
    BellCubic: (t) => 64 * Math.pow(t * (1 - t), 3)
};