/**
 * Updates a query parameter in the current URL and returns the new URL string.
 * @param {string} key - Parameter name.
 * @param {string|null|undefined} value - If falsy, the parameter is removed.
 * @returns {string} The updated URL.
 */
export function updateUrlQuery(key, value) {
    const query = new URLSearchParams(window.location.search);
    if (value) {
        query.set(key, value);
    } else {
        query.delete(key);
    }
    return `${window.location.protocol}//${window.location.host}${window.location.pathname}?${query.toString()}`;
}