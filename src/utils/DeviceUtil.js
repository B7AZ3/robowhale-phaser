/**
 * Device detection utilities.
 */
export const DeviceUtil = {
    /**
     * Determines if the current device is a desktop (non‑touch, non‑mobile) computer.
     * @returns {boolean}
     */
    isDesktop() {
        const ua = navigator.userAgent;
        let OS = {
            windows: false,
            macOS: false,
            android: false,
            linux: false,
            iOS: false,
            iOSVersion: 0,
            iPhone: false,
            iPad: false,
            kindle: false,
            chromeOS: false,
            windowsPhone: false,
            desktop: false
        };

        if (/Windows/.test(ua)) OS.windows = true;
        else if (/Mac OS/.test(ua) && !/like Mac OS/.test(ua)) OS.macOS = true;
        else if (/Android/.test(ua)) OS.android = true;
        else if (/Linux/.test(ua)) OS.linux = true;
        else if (/iP[ao]d|iPhone/i.test(ua)) {
            OS.iOS = true;
            const match = navigator.appVersion.match(/OS (\d+)/);
            if (match) OS.iOSVersion = parseInt(match[1], 10);
            OS.iPhone = ua.toLowerCase().indexOf('iphone') !== -1;
            OS.iPad = ua.toLowerCase().indexOf('ipad') !== -1;
        } else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua)) {
            OS.kindle = true;
        } else if (/CrOS/.test(ua)) {
            OS.chromeOS = true;
        }

        if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua)) {
            OS.android = false;
            OS.iOS = false;
            OS.macOS = false;
            OS.windows = true;
            OS.windowsPhone = true;
        }

        const silk = /Silk/.test(ua);
        if (OS.windows || OS.macOS || (OS.linux && !silk) || OS.chromeOS) {
            OS.desktop = true;
        }
        if (OS.windowsPhone || (/Windows NT/i.test(ua) && /Touch/i.test(ua))) {
            OS.desktop = false;
        }
        if (OS.macOS && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
            OS.desktop = false;
        }
        return OS.desktop;
    }
};

/**
 * Returns the device's total RAM in MB, if available via `navigator.deviceMemory`.
 * @returns {number|undefined} Memory in MB, or undefined if not exposed.
 */
export function getDeviceMemory() {
    try {
        const memory = navigator.deviceMemory;
        if (typeof memory === 'number') {
            return memory * 1024; // Convert GB to MB
        }
    } catch (error) {
        // Ignore
    }
    return undefined;
}