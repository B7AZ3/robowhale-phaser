/**
 * Checks if WebP image format is supported using canvas toDataURL.
 * @returns {boolean}
 */
function doCheckWebP() {
    // Firefox 65+ supports WebP
    const match = navigator.userAgent.match(/(Edge|Firefox)\/(\d+)\.(\d*)/);
    if (match && match[1] === 'Firefox' && parseInt(match[2], 10) >= 65) return true;
    if (match && match[1] === 'Edge' && match[2] === '18' && match[3] === '17763') return false;
    // Standard canvas test
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supported = canvas.toDataURL ? canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 : false;
    return supported;
}

/**
 * Checks WebP support with optional caching and forced disable.
 * @param {Object} [options]
 * @param {Storage} [options.storage] - Storage object to cache the result (e.g., localStorage).
 * @param {string} [options.cacheKey='robowhale__webp'] - Cache key.
 * @param {boolean} [options.forceDisable=false] - If true, returns false immediately.
 * @returns {boolean} True if WebP is supported.
 */
export function isWebpSupported({ storage = null, cacheKey = 'robowhale__webp', forceDisable = false } = {}) {
    if (forceDisable) return false;
    if (storage && storage.getItem(cacheKey) === 'true') return true;
    const supported = doCheckWebP();
    if (supported && storage) {
        storage.setItem(cacheKey, 'true');
    }
    return supported;
}