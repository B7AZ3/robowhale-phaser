/**
 * 8‑directional constants.
 * @enum {string}
 */
export const Direction = {
    UP_LEFT: 'UP_LEFT',
    UP: 'UP',
    UP_RIGHT: 'UP_RIGHT',
    RIGHT: 'RIGHT',
    DOWN_RIGHT: 'DOWN_RIGHT',
    DOWN: 'DOWN',
    DOWN_LEFT: 'DOWN_LEFT',
    LEFT: 'LEFT'
};

/**
 * Converts an angle in degrees to an orthogonal direction (UP, RIGHT, DOWN, LEFT).
 * @param {number} angleDeg - Angle in degrees (0 = right, 90 = down).
 * @returns {string} One of Direction.UP, .RIGHT, .DOWN, .LEFT.
 */
export function getOrthoDirection(angleDeg) {
    if (angleDeg > -135 && angleDeg <= -45) return Direction.UP;
    if (angleDeg > -45 && angleDeg <= 45) return Direction.RIGHT;
    if (angleDeg > 45 && angleDeg <= 135) return Direction.DOWN;
    return Direction.LEFT;
}