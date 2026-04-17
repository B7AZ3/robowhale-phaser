/**
 * Checks if localStorage is available and writable.
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
    try {
        const key = '__storage_test__';
        localStorage.setItem(key, key);
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Storage wrapper for browser localStorage with a namespace prefix.
 */
export default class LocalStorageWrapper {
    /**
     * @param {string} storeName - Prefix used for all keys.
     */
    constructor(storeName) {
        this.type = 'LocalStorage';
        this.prefix = storeName;
    }

    /**
     * Initialises the wrapper (no async work needed).
     * @returns {Promise<void>}
     */
    async init() {
        if (!isLocalStorageAvailable()) {
            throw new Error('localStorage is not available');
        }
        // No additional initialisation required
    }

    /**
     * Builds the full storage key with prefix.
     * @param {string} key
     * @returns {string}
     * @private
     */
    getStorageKey(key) {
        return `${this.prefix}__${key}`;
    }

    /**
     * Stringifies a value for storage.
     * @param {any} value
     * @returns {string}
     * @private
     */
    stringify(value) {
        return typeof value === 'string' ? value : JSON.stringify(value);
    }

    /**
     * Saves a key‑value pair to localStorage.
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    async saveValue(key, value) {
        try {
            const data = this.stringify(value);
            localStorage.setItem(this.getStorageKey(key), data);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves the raw string value for a key.
     * @param {string} key
     * @returns {Promise<string|null>}
     */
    async getValue(key) {
        return localStorage.getItem(this.getStorageKey(key));
    }

    /**
     * Retrieves a number, defaulting to 0.
     * @param {string} key
     * @returns {Promise<number>}
     */
    async getNumber(key) {
        const value = await this.getValue(key);
        if (value === null) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Retrieves a boolean, defaulting to false.
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    async getBoolean(key) {
        const value = await this.getValue(key);
        if (value === null) return false;
        return value === 'true';
    }

    /**
     * Retrieves a string, defaulting to empty string.
     * @param {string} key
     * @returns {Promise<string>}
     */
    async getString(key) {
        const value = await this.getValue(key);
        return value !== null ? value : '';
    }

    /**
     * Retrieves an object (parsed JSON), defaulting to null.
     * @param {string} key
     * @returns {Promise<object|null>}
     */
    async getObject(key) {
        const value = await this.getValue(key);
        if (value === null) return null;
        try {
            return JSON.parse(value);
        } catch (e) {
            console.error('Failed to parse JSON from localStorage', e);
            return null;
        }
    }

    /**
     * Removes a key from localStorage.
     * @param {string} key
     */
    remove(key) {
        localStorage.removeItem(this.getStorageKey(key));
    }

    /**
     * Clears all keys that have the current prefix.
     * @returns {Promise<void>}
     */
    async clear() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}