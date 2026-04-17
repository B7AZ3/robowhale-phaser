/**
 * Checks if IndexedDB is available in the current environment.
 * @returns {boolean}
 */
export function isIndexedDbAvailable() {
    return typeof indexedDB !== 'undefined';
}

/**
 * A storage wrapper for IndexedDB using a simple key‑value store.
 * Each instance uses a specific database name and store name.
 */
export default class IdbKeyvalWrapper {
    /**
     * @param {string} storeName - The name of the object store.
     * @param {string} [dbName='robowhale'] - The database name.
     */
    constructor(storeName, dbName = 'robowhale') {
        this.type = 'IndexedDb';
        this.dbName = dbName;
        this.storeName = storeName;
        /** @type {IDBDatabase|null} */
        this.db = null;
    }

    /**
     * Opens the database and creates the object store if needed.
     * @returns {Promise<void>}
     */
    async init() {
        if (!isIndexedDbAvailable()) {
            throw new Error('IndexedDB is not available in this environment');
        }
        await this.openDB();
        // Test write/read/delete to verify functionality
        const testKey = '__test_key';
        await this.saveValue(testKey, testKey);
        const value = await this.getValue(testKey);
        if (value !== testKey) {
            throw new Error('IndexedDB write/read test failed');
        }
        await this.remove(testKey);
    }

    /**
     * Opens (or creates) the database and object store.
     * @private
     * @returns {Promise<IDBDatabase>}
     */
    openDB() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * Gets a reference to the object store (in read/write mode).
     * @private
     * @param {IDBTransactionMode} mode
     * @returns {Promise<IDBObjectStore>}
     */
    async getStore(mode) {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], mode);
        return transaction.objectStore(this.storeName);
    }

    /**
     * Saves a key‑value pair.
     * @param {string} key
     * @param {any} value
     * @returns {Promise<void>}
     */
    async saveValue(key, value) {
        const store = await this.getStore('readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Retrieves the value for a given key.
     * @param {string} key
     * @returns {Promise<any>}
     */
    async getValue(key) {
        const store = await this.getStore('readonly');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Retrieves a number, defaulting to 0.
     * @param {string} key
     * @returns {Promise<number>}
     */
    async getNumber(key) {
        const value = await this.getValue(key);
        return typeof value === 'number' ? value : 0;
    }

    /**
     * Retrieves a boolean, defaulting to false.
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    async getBoolean(key) {
        const value = await this.getValue(key);
        return typeof value === 'boolean' ? value : false;
    }

    /**
     * Retrieves a string, defaulting to empty string.
     * @param {string} key
     * @returns {Promise<string>}
     */
    async getString(key) {
        const value = await this.getValue(key);
        return typeof value === 'string' ? value : '';
    }

    /**
     * Retrieves an object, defaulting to null.
     * @param {string} key
     * @returns {Promise<object|null>}
     */
    async getObject(key) {
        const value = await this.getValue(key);
        return (value && typeof value === 'object') ? value : null;
    }

    /**
     * Removes a key from the store.
     * @param {string} key
     * @returns {Promise<void>}
     */
    async remove(key) {
        const store = await this.getStore('readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Clears all keys in the object store.
     * @returns {Promise<void>}
     */
    async clear() {
        const store = await this.getStore('readwrite');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
}