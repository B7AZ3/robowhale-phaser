/**
 * Checks if AVIF image format is supported by the browser.
 * Caches the result in a provided storage (e.g., localStorage) to avoid re‑testing.
 *
 * @param {Object} [options]
 * @param {Storage} [options.storage] - Storage object to cache the result (e.g., window.localStorage).
 * @param {string} [options.cacheKey='robowhale__avif'] - Key used for caching.
 * @param {boolean} [options.forceDisable=false] - If true, skips test and returns false.
 * @returns {Promise<boolean>} True if AVIF is supported.
 */
export function isAvifSupported({ storage = null, cacheKey = 'robowhale__avif', forceDisable = false } = {}) {
    if (forceDisable) {
        return Promise.resolve(false);
    }

    // Check cache first
    if (storage && storage.getItem(cacheKey) === 'true') {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const image = new Image();
        const callback = () => {
            // AVIF test image is 2x2 pixels if supported, else fallback
            const supported = image.height === 2;
            if (supported && storage) {
                storage.setItem(cacheKey, 'true');
            }
            resolve(supported);
        };
        image.onload = callback;
        image.onerror = callback;
        // Base64 AVIF test image (small, valid)
        image.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
}