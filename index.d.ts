// Type definitions for @b7az3/robowhale-phaser
// Project: https://github.com/b7az3/robowhale-phaser
// Definitions by: b7az3

declare module '@b7az3/robowhale-phaser' {
    import Phaser from 'phaser';

    // ============ GRID ============
    export class GridArray<T = any> {
        rows: number;
        columns: number;
        items: T[][];
        constructor(rows: number, columns: number);
        addRow(): void;
        removeRow(rowIndex: number): void;
        addColumn(): void;
        removeColumn(columnIndex: number): void;
        checkAt(column: number, row: number): boolean;
        getAt(column: number, row: number): T | undefined;
        removeAt(column: number, row: number): void;
        removeAll(): void;
        add(item: T & { column: number; row: number }): boolean;
        addMultiple(...items: (T & { column: number; row: number })[]): boolean[];
        addAt(column: number, row: number, item: T): boolean;
        remove(item: T & { column: number; row: number }): void;
        toArray(): (T | undefined)[];
        toArrayUniq(): T[];
        getNeighborAtDirection(column: number, row: number, direction: string): T | undefined;
        getNeighborsAt(column: number, row: number): Record<string, T | undefined>;
        getOrthoNeighborsAt(column: number, row: number): Record<string, T | undefined>;
        getNeighborsArrayAt(column: number, row: number): (T | undefined)[];
        getOrthoNeighborsArrayAt(column: number, row: number): (T | undefined)[];
        forEach(callbackfn: (item: T | undefined, column: number, row: number, grid: this) => void, thisArg?: any): void;
        filter(predicate: (item: T, column: number, row: number, grid: this) => boolean, thisArg?: any): T[];
        map<U>(callbackfn: (item: T, column: number, row: number, grid: this) => U, thisArg?: any): U[];
        find(predicate: (item: T) => boolean): T | undefined;
        getItemsByColumn(column: number): T[];
        getItemsByRow(row: number): T[];
    }

    // ============ PHASER 3 EXTENSIONS ============
    export class Phaser3Extensions {
        static extendGroup(): void;
        static extendGraphics(): void;
        static extendTweens(): void;
        static addGetGlobalPosition(): void;
        static addKillRevive(): void;
        static extendContainer(): void;
        static extendAnimationManager(): void;
        static extendMath(): void;
        static extendRandomDataGenerator(): void;
        static extendFactory(): void;
        static addScaleMethods(): void;
        static addAlignMethods(): void;
        static extendLoader(): void;
        static polyfill(): void; // alias for calling all
    }

    export const Ease: Record<string, string>;
    export const CustomEase: Record<string, (t: number, a?: number) => number>;

    export class RenderStatsDOM {
        constructor(scene: Phaser.Scene);
        toggleVisibility(): void;
        update(delta: number): void;
    }

    // ============ CAMERA ============
    export class KineticScroll {
        constructor(scene: Phaser.Scene, settings?: Partial<KineticScrollSettings>);
        addPointerListeners(): void;
        removePointerListeners(): void;
        update(): void;
        resetScroll(): void;
        withinGame(): boolean;
    }
    interface KineticScrollSettings {
        camera?: Phaser.Cameras.Scene2D.Camera;
        kineticMovement?: boolean;
        timeConstantScroll?: number;
        horizontalScroll?: boolean;
        verticalScroll?: boolean;
        horizontalWheel?: boolean;
        verticalWheel?: boolean;
        wheelScrollAmount?: number;
        wheelDeceleration?: number;
        onUpdate?: (deltaX: number, deltaY: number) => void;
        scrollMultiplier?: number;
    }

    // ============ BUTTONS ============
    export const ButtonEvent: {
        PRESS: 'button_press';
        RELEASE: 'button_release';
    };

    export class SimpleButton extends Phaser.GameObjects.Image {
        constructor(scene: Phaser.Scene, config: SimpleButtonConfig);
        enableInput(): void;
        disableInput(): void;
        inflateHitArea(x: number, y: number): void;
        emulatePressEvent(args?: any[]): void;
        emulateReleaseEvent(args?: any[]): void;
    }
    interface SimpleButtonConfig {
        texture: string;
        frame: string | number;
        parent?: Phaser.GameObjects.Container;
        enableTweens?: boolean;
        pressScale?: number;
        pressDuration?: number;
        releaseDuration?: number;
        releaseEase?: string;
        checkPointerOver?: boolean;
        sound?: { key: string; volume?: number };
        onPress?: (button: SimpleButton, pointer: Phaser.Input.Pointer) => void;
        onRelease?: (button: SimpleButton, pointer: Phaser.Input.Pointer) => void;
    }

    export class ComplexButton extends Phaser.GameObjects.Container {
        constructor(scene: Phaser.Scene, config: ComplexButtonConfig);
        enableInput(): void;
        disableInput(): void;
        addIcon(atlasKey: string, frame: string | number, offsetX?: number, offsetY?: number): Phaser.GameObjects.Image;
        addBitmapText(content: string, font: string, fontSize: number, offsetX?: number, offsetY?: number): Phaser.GameObjects.BitmapText;
        addText(content: string, style: Phaser.Types.GameObjects.Text.TextStyle, offsetX?: number, offsetY?: number): Phaser.GameObjects.Text;
        inflateHitArea(x: number, y: number): void;
        emulatePressEvent(args?: any[]): void;
        emulateReleaseEvent(args?: any[]): void;
    }
    interface ComplexButtonConfig {
        texture: string;
        frame: string | number;
        parent?: Phaser.GameObjects.Container;
        enableTweens?: boolean;
        pressScale?: number;
        pressDuration?: number;
        releaseDuration?: number;
        releaseEase?: string;
        checkPointerOver?: boolean;
        sound?: { key: string; volume?: number };
        onPress?: (button: ComplexButton, pointer: Phaser.Input.Pointer) => void;
        onRelease?: (button: ComplexButton, pointer: Phaser.Input.Pointer) => void;
    }

    export class ToggleButton extends SimpleButton {
        constructor(scene: Phaser.Scene, config: ToggleButtonConfig);
        get state(): 1 | 2;
        setState(newState: 1 | 2): 1 | 2;
        toggle(): 1 | 2;
    }
    interface ToggleButtonConfig {
        texture: string;
        frameState1: string | number;
        frameState2: string | number;
        initialState?: 1 | 2;
        onStateChange?: (state: 1 | 2, button: ToggleButton) => void;
        parent?: Phaser.GameObjects.Container;
        // ... other SimpleButton options
    }

    export class SoundButton extends SimpleButton {
        constructor(scene: Phaser.Scene, config: SoundButtonConfig);
        get muted(): boolean;
        setMuted(muted: boolean): boolean;
        toggle(): boolean;
    }
    interface SoundButtonConfig {
        texture: string;
        frameOn: string | number;
        frameOff: string | number;
        initialMuted?: boolean;
        onToggle?: (isMuted: boolean, button: SoundButton) => void;
        parent?: Phaser.GameObjects.Container;
        // ... other SimpleButton options
    }

    export class MusicButton extends SimpleButton {
        constructor(scene: Phaser.Scene, config: MusicButtonConfig);
        get muted(): boolean;
        setMuted(muted: boolean): boolean;
        toggle(): boolean;
    }
    interface MusicButtonConfig {
        texture: string;
        frameOn: string | number;
        frameOff: string | number;
        initialMuted?: boolean;
        onToggle?: (isMuted: boolean, button: MusicButton) => void;
        parent?: Phaser.GameObjects.Container;
        // ... other SimpleButton options
    }

    // ============ CONTAINER ============
    export class SwitchButton extends Phaser.GameObjects.Container {
        constructor(scene: Phaser.Scene, parent?: Phaser.GameObjects.Container);
        addBack(options: { key: string; frame?: string | number; interactive?: boolean }): void;
        addArrows(options: SwitchButtonArrowsConfig): void;
        addTitle(options: SwitchButtonTextConfig): void;
        addText(options: SwitchButtonTextConfig): void;
        updateText(content: string): void;
        adjustTextSize(): void;
        autoSetSize(): void;
        disableArrowButtons(): void;
        enableArrowButtons(): void;
    }
    interface SwitchButtonArrowsConfig {
        dx: number;
        dy?: number;
        leftArrow: { key: string; frame?: string | number };
        rightArrow: { key: string; frame?: string | number };
        timeoutMs?: number;
    }
    interface SwitchButtonTextConfig {
        content: string;
        style: Phaser.Types.GameObjects.Text.TextStyle;
        dx?: number;
        dy?: number;
    }
    export const SwitchButtonEvent: { ARROW_PRESS: string };

    export class PhaserScreen extends Phaser.GameObjects.Container {
        constructor(scene: Phaser.Scene, options?: PhaserScreenOptions);
        pin(obj: Phaser.GameObjects.GameObject, x: number, y: number, offsetX: number, offsetY: number): void;
        resize(): void;
        emitShowEvent(...args: any[]): void;
        emitHideStartEvent(...args: any[]): void;
        emitHideCompleteEvent(...args: any[]): void;
        showBackground(props?: { duration?: number; ease?: Function; targetAlpha?: number }): void;
    }
    interface PhaserScreenOptions {
        name?: string;
        width?: number;
        height?: number;
        backgroundKey?: string;
        backgroundFrame?: string | number;
        backgroundAlpha?: number;
        backgroundPadding?: number;
        backgroundInteractive?: boolean;
    }
    export const PhaserScreenEvent: {
        SHOW: string;
        HIDE_START: string;
        HIDE_COMPLETE: string;
    };

    // ============ TEXT ============
    export class AutosizeText extends Phaser.GameObjects.Text {
        constructor(scene: Phaser.Scene, x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle, options?: AutosizeTextOptions);
        setMaxSize(width: number, height: number): this;
        setText(value: string): this;
        adjustTextSize(): void;
    }
    interface AutosizeTextOptions {
        maxWidth?: number;
        maxHeight?: number;
        wordWrap?: boolean;
        minFontSize?: number;
    }

    // ============ TOAST ============
    export class Toast extends Phaser.GameObjects.Container {
        constructor(scene: Phaser.Scene, options: ToastOptions);
        show(lifespan?: number): void;
        dismiss(): void;
    }
    interface ToastOptions {
        message: string;
        lifespan?: number;
    }
    export class ToastsManager extends PhaserScreen {
        constructor(scene: Phaser.Scene);
        show(options: ToastOptions): void;
        dismissAll(): void;
    }

    // ============ SCROLLBAR ============
    export class CameraScrollbar extends Phaser.GameObjects.Image {
        constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, texture: string, frame?: string | number, options?: CameraScrollbarOptions);
        onResize(): void;
        setGameHeight(height: number): void;
    }
    interface CameraScrollbarOptions {
        gameHeight?: number;
        verticalPadding?: number;
        useGlobalPointerEvents?: boolean;
    }

    // ============ PARTICLES ============
    export class ParticleUtil {
        static getTextureEmitZone(scene: Phaser.Scene, image: Phaser.GameObjects.Image, maxAttempts?: number): any;
        static getCircleEdgeEmitZone(radius: number, quantity?: number, randomize?: boolean): any;
        static onEmitRandom(from: number, to: number): { onEmit: () => number };
    }

    // ============ SCENES ============
    export abstract class BaseScene extends Phaser.Scene {
        readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
        readonly activePointer: Phaser.Input.Pointer;
        pinner: Pinner;
        sizer: Scaler;
        fastForward: FastForward;
        shiftKey: Phaser.Input.Keyboard.Key;
        ctrlKey: Phaser.Input.Keyboard.Key;
        init(data?: any): void;
        size(obj: Phaser.GameObjects.GameObject, type?: ScaleType, options?: any): void;
        pin(obj: Phaser.GameObjects.GameObject, x: number, y: number, offsetX?: number, offsetY?: number): void;
        resize(): void;
        restart(data?: any): void;
        onKeyDown(key: string, callback: Function, context?: any): void;
        onceKeyDown(key: string, callback: Function, context?: any): void;
        changeScene(newScene: string, data?: any): void;
    }
    export enum ScaleType {
        EXACT = 'exact',
        FIT = 'fit',
        COVER = 'cover',
        PROPORTIONAL = 'proportional'
    }

    export class FastForward extends Phaser.Events.EventEmitter {
        constructor(scene: Phaser.Scene);
        get timeScale(): number;
        start(timeScale: number): void;
        stop(): void;
        destroy(): void;
    }
    export const FastForwardEvent: { START: string; STOP: string };

    export class Pinner {
        pins: Map<any, any>;
        pin(obj: any, x: number, y: number, offsetX?: number, offsetY?: number): void;
        unpin(item: any): void;
        getPin(item: any): any;
        align(item: any, width: number, height: number, scale: number): void;
        onResize(width: number, height: number, scale: number): void;
        destroy(): void;
    }

    export class Scaler {
        constructor(scene: Phaser.Scene, options?: { gameWidth?: number; gameHeight?: number; defaultScale?: number });
        scale(obj: Phaser.GameObjects.GameObject, type?: ScaleType, options?: any): void;
        onResize(): void;
        destroy(): void;
    }

    // ============ STORAGE ============
    export class IdbKeyvalWrapper {
        type: string;
        constructor(storeName: string, dbName?: string);
        init(): Promise<void>;
        saveValue(key: string, value: any): Promise<void>;
        getValue(key: string): Promise<any>;
        getNumber(key: string): Promise<number>;
        getBoolean(key: string): Promise<boolean>;
        getString(key: string): Promise<string>;
        getObject(key: string): Promise<object | null>;
        remove(key: string): Promise<void>;
        clear(): Promise<void>;
    }
    export function isIndexedDbAvailable(): boolean;

    export class LocalStorageWrapper {
        type: string;
        constructor(storeName: string);
        init(): Promise<void>;
        saveValue(key: string, value: any): Promise<void>;
        getValue(key: string): Promise<string | null>;
        getNumber(key: string): Promise<number>;
        getBoolean(key: string): Promise<boolean>;
        getString(key: string): Promise<string>;
        getObject(key: string): Promise<object | null>;
        remove(key: string): void;
        clear(): Promise<void>;
    }
    export function isLocalStorageAvailable(): boolean;

    export class RuntimeStorage {
        name: string;
        namespace: string;
        init(): Promise<void>;
        setNamespace(namespace: string): void;
        saveValue(key: string, value: any): void;
        getValue(key: string): any;
        getNumber(key: string): number;
        getBoolean(key: string): boolean;
        getString(key: string): string;
        getObject(key: string): object | null;
        getContent(ignoreNamespace?: boolean): Record<string, any>;
        clear(ignoreNamespace?: boolean): void;
    }

    // ============ UTILITIES ============
    export function isAvifSupported(options?: { storage?: Storage; cacheKey?: string; forceDisable?: boolean }): Promise<boolean>;
    export function isWebAssemblySupported(): boolean;
    export function cssAnimate(element: HTMLElement, animation: string, durationMs?: number): Promise<void>;
    export const DeviceUtil: {
        isDesktop(): boolean;
    };
    export function getDeviceMemory(): number | undefined;
    export const Direction: {
        UP_LEFT: string;
        UP: string;
        UP_RIGHT: string;
        RIGHT: string;
        DOWN_RIGHT: string;
        DOWN: string;
        DOWN_LEFT: string;
        LEFT: string;
    };
    export function getOrthoDirection(angleDeg: number): string;
    export const NetUtil: {
        getCurrentHost(): string | null;
        isLocalhost(...aliases: string[]): boolean;
        isHostAllowed(allowedHosts: string[]): boolean;
        inIFrame(): boolean;
    };
    export function parseMilliseconds(milliseconds: number): {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        milliseconds: number;
        microseconds: number;
        nanoseconds: number;
    };
    export function toMs(value: { days?: number; hours?: number; minutes?: number; seconds?: number; ms?: number }): number;
    export function updateUrlQuery(key: string, value?: string | null): string;
    export function isWebpSupported(options?: { storage?: Storage; cacheKey?: string; forceDisable?: boolean }): boolean;

    // ============ POLYFILLS ============
    export const Polyfills: {
        polyfill(): void;
        nodeRemove(): void;
    };
}