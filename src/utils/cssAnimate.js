/**
 * Applies a CSS animation to a DOM element using `animate.css` conventions.
 * Returns a promise that resolves when the animation ends.
 *
 * @param {HTMLElement} element - The DOM element to animate.
 * @param {string} animation - The animation class name (e.g., 'bounce', 'fadeIn').
 * @param {number} [durationMs] - Optional duration in milliseconds; sets CSS variable `--animate-duration`.
 * @returns {Promise<void>}
 */
export function cssAnimate(element, animation, durationMs) {
    if (typeof element.onanimationend === 'undefined') {
        return Promise.resolve();
    }
    if (typeof durationMs === 'number') {
        element.style.setProperty('--animate-duration', `${durationMs / 1000}s`);
    }
    return new Promise((resolve) => {
        element.classList.add('animate__animated', animation);
        element.onanimationend = () => {
            element.classList.remove(animation);
            resolve();
        };
    });
}