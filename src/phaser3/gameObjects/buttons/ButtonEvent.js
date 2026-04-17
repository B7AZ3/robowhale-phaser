/**
 * Event names emitted by button components.
 * @readonly
 * @enum {string}
 */
export const ButtonEvent = {
    /** Fired when the button is pressed (pointer down). */
    PRESS: 'button_press',
    /** Fired when the button is released (pointer up, if press was on same button). */
    RELEASE: 'button_release'
};