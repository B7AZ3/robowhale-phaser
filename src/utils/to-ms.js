/**
 * Converts an object with time units (days, hours, minutes, seconds, ms) to milliseconds.
 * @param {Object} value - e.g., { days: 1, hours: 2, minutes: 30, seconds: 15, ms: 500 }
 * @returns {number} Total milliseconds.
 */
export function toMs(value) {
    let sum = 0;
    if (typeof value.days === 'number') sum += value.days * 24 * 60 * 60 * 1000;
    if (typeof value.hours === 'number') sum += value.hours * 60 * 60 * 1000;
    if (typeof value.minutes === 'number') sum += value.minutes * 60 * 1000;
    if (typeof value.seconds === 'number') sum += value.seconds * 1000;
    if (typeof value.ms === 'number') sum += value.ms;
    return sum;
}