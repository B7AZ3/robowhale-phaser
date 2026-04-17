// index.js

// ============ GRID ============
export { default as GridArray } from './src/grid/GridArray.js';

// ============ PHASER 3 EXTENSIONS & UTILITIES ============
export { default as Phaser3Extensions } from './src/phaser3/Phaser3Extensions.js';
export { Ease, CustomEase } from './src/phaser3/Easing.js';
export { default as RenderStatsDOM } from './src/phaser3/RenderStatsDOM.js';

// ============ PHASER 3 - CAMERA ============
export { default as KineticScroll } from './src/phaser3/camera/KineticScroll.js';

// ============ PHASER 3 - GAME OBJECTS ============
// Buttons
export { ButtonEvent } from './src/phaser3/gameObjects/buttons/ButtonEvent.js';
export { default as SimpleButton } from './src/phaser3/gameObjects/buttons/SimpleButton.js';
export { default as ComplexButton } from './src/phaser3/gameObjects/buttons/ComplexButton.js';
export { default as ToggleButton } from './src/phaser3/gameObjects/buttons/ToggleButton.js';
export { default as SoundButton } from './src/phaser3/gameObjects/buttons/SoundButton.js';
export { default as MusicButton } from './src/phaser3/gameObjects/buttons/MusicButton.js';

// Container
export { default as SwitchButton, SwitchButtonEvent } from './src/phaser3/gameObjects/container/SwitchButton.js';
export { default as PhaserScreen, PhaserScreenEvent } from './src/phaser3/gameObjects/container/screen/Screen.js';

// Text
export { default as AutosizeText } from './src/phaser3/gameObjects/text/AutosizeText.js';

// Toast
export { default as Toast } from './src/phaser3/gameObjects/toast/Toast.js';
export { default as ToastsManager } from './src/phaser3/gameObjects/toast/ToastsManager.js';

// Other
export { default as CameraScrollbar } from './src/phaser3/gameObjects/CameraScrollbar.js';

// ============ PHASER 3 - PARTICLES ============
export { default as ParticleUtil } from './src/phaser3/particles/ParticleUtil.js';

// ============ PHASER 3 - SCENES ============
export { default as BaseScene, ScaleType } from './src/phaser3/scenes/BaseScene.js';
export { default as FastForward, FastForwardEvent } from './src/phaser3/scenes/FastForward.js';
export { default as Pinner } from './src/phaser3/scenes/Pinner.js';
export { default as Scaler } from './src/phaser3/scenes/Scaler.js';

// ============ STORAGE ============
export { default as IdbKeyvalWrapper, isIndexedDbAvailable } from './src/storage/IdbKeyvalWrapper.js';
export { default as LocalStorageWrapper, isLocalStorageAvailable } from './src/storage/LocalStorageWrapper.js';
export { default as RuntimeStorage } from './src/storage/RuntimeStorage.js';

// ============ UTILS ============
export { isAvifSupported } from './src/utils/AvifChecker.js';
export { isWebAssemblySupported } from './src/utils/check-webassembly.js';
export { cssAnimate } from './src/utils/cssAnimate.js';
export { DeviceUtil, getDeviceMemory } from './src/utils/DeviceUtil.js';
export { Direction, getOrthoDirection } from './src/utils/Direction.js';
export { NetUtil } from './src/utils/NetUtil.js';
export { parseMilliseconds } from './src/utils/parse-ms.js';
export { toMs } from './src/utils/to-ms.js';
export { updateUrlQuery } from './src/utils/update-url-query.js';
export { isWebpSupported } from './src/utils/WebpChecker.js';

// ============ POLYFILLS ============
export { Polyfills } from './src/Polyfills.js';