// src/Polyfills.js

/**
 * Calls all static methods of a given object, optionally excluding some by name.
 * Used internally to apply all polyfills.
 * @param {object} obj - The object containing static methods.
 * @param {string[]} [exclude=[]] - Method names to skip.
 * @private
 */
function callAllMethods(obj, exclude = []) {
    Object.getOwnPropertyNames(obj).forEach((property) => {
        const isFunction = typeof obj[property] === 'function';
        const isExcluded = exclude.includes(property);
        if (isFunction && !isExcluded) {
            obj[property]();
        }
    });
}

/**
 * A collection of browser polyfills for missing native features.
 * Call `Polyfills.polyfill()` once at the start of your application
 * to apply all available polyfills.
 */
export const Polyfills = {
    /**
     * Applies all polyfills defined as static methods of this object.
     * Excludes the `polyfill` method itself to avoid recursion.
     */
    polyfill() {
        callAllMethods(Polyfills, ['polyfill']);
    },

    /**
     * Adds a standard `remove()` method to DOM elements if missing.
     * Affects Element, CharacterData, and DocumentType prototypes.
     */
    nodeRemove() {
        const prototypes = [Element, CharacterData, DocumentType]
            .filter(item => item && item.prototype)
            .map(item => item.prototype);

        prototypes.forEach(proto => {
            if (proto.hasOwnProperty('remove')) return;
            Object.defineProperty(proto, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                    this.parentNode?.removeChild(this);
                }
            });
        });
    }
};