/**
 * In‑memory key‑value storage with namespace support.
 * Data is lost when the page is refreshed.
 */
export default class RuntimeStorage {
    constructor() {
        this.name = 'Runtime Storage';
        /** @private */ this._namespace = '';
        /** @private */ this.storage = {};
    }

    /** @returns {string} The current namespace. */
    get namespace() {
        return this._namespace;
    }

    /**
     * Initialises the storage (no‑op for runtime).
     * @returns {Promise<void>}
     */
    async init() {
        // Nothing to initialise
    }

    /**
     * Sets the namespace for future operations.
     * @param {string} namespace
     */
    setNamespace(namespace) {
        this._namespace = namespace;
    }

    /**
     * Builds the full key with namespace.
     * @param {string} key
     * @returns {string}
     * @private
     */
    getSaveKey(key) {
        return this._namespace ? `${this._namespace}__${key}` : key;
    }

    /**
     * Saves a key‑value pair in memory.
     * @param {string} key
     * @param {any} value
     */
    saveValue(key, value) {
        this.storage[this.getSaveKey(key)] = value;
    }

    /**
     * Retrieves a raw value.
     * @param {string} key
     * @returns {any}
     */
    getValue(key) {
        return this.storage[this.getSaveKey(key)];
    }

    /**
     * Retrieves a number, defaulting to 0.
     * @param {string} key
     * @returns {number}
     */
    getNumber(key) {
        const val = this.getValue(key);
        return typeof val === 'number' ? val : 0;
    }

    /**
     * Retrieves a boolean, defaulting to false.
     * @param {string} key
     * @returns {boolean}
     */
    getBoolean(key) {
        const val = this.getValue(key);
        return typeof val === 'boolean' ? val : false;
    }

    /**
     * Retrieves a string, defaulting to empty string.
     * @param {string} key
     * @returns {string}
     */
    getString(key) {
        const val = this.getValue(key);
        return typeof val === 'string' ? val : '';
    }

    /**
     * Retrieves an object, defaulting to null.
     * @param {string} key
     * @returns {object|null}
     */
    getObject(key) {
        const val = this.getValue(key);
        return val && typeof val === 'object' ? val : null;
    }

    /**
     * Returns all stored key‑value pairs, optionally ignoring namespace.
     * @param {boolean} [ignoreNamespace=false] - If true, returns everything.
     * @returns {Record<string, any>}
     */
    getContent(ignoreNamespace = false) {
        if (ignoreNamespace) {
            return { ...this.storage };
        }
        const content = {};
        const prefix = this._namespace ? `${this._namespace}__` : '';
        for (const key in this.storage) {
            if (key.startsWith(prefix)) {
                content[key] = this.storage[key];
            }
        }
        return content;
    }

    /**
     * Clears storage, optionally only the current namespace.
     * @param {boolean} [ignoreNamespace=false] - If true, clears everything.
     */
    clear(ignoreNamespace = false) {
        if (ignoreNamespace) {
            this.storage = {};
            return;
        }
        const prefix = this._namespace ? `${this._namespace}__` : '';
        for (const key in this.storage) {
            if (key.startsWith(prefix)) {
                delete this.storage[key];
            }
        }
    }
}