export const NetUtil = {
    /**
     * Returns the current hostname from `window.location`.
     * @returns {string|null}
     */
    getCurrentHost() {
        if (window.location && window.location.hostname) {
            return window.location.hostname;
        }
        return null;
    },

    /**
     * Checks if the current host is localhost or any of the provided aliases.
     * @param {...string} localhostAliases - Additional hostnames to treat as local.
     * @returns {boolean}
     */
    isLocalhost(...localhostAliases) {
        return NetUtil.isHostAllowed([...localhostAliases, 'localhost']);
    },

    /**
     * Checks if the current host matches any in the allowed list.
     * @param {string[]} allowedHosts - List of host substrings to match.
     * @returns {boolean}
     */
    isHostAllowed(allowedHosts) {
        const currentHost = NetUtil.getCurrentHost();
        if (currentHost) {
            return allowedHosts.some(host => currentHost.includes(host));
        }
        return false;
    },

    /**
     * Determines if the page is running inside an iframe.
     * @returns {boolean}
     */
    inIFrame() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
};