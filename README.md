# @b7az3/robowhale-phaser

[![npm version](https://img.shields.io/npm/v/@b7az3/robowhale-phaser.svg)](https://www.npmjs.com/package/@b7az3/robowhale-phaser)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.60+-green.svg)](https://phaser.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A collection of reusable, generic **Phaser 3** utilities and UI components.  
Designed to be **dependency‑free** (except Phaser itself), fully configurable, and well‑documented.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Modules Overview](#modules-overview)
  - [Grid](#grid)
  - [Phaser 3 Extensions](#phaser-3-extensions)
  - [Camera](#camera)
  - [Game Objects](#game-objects)
    - [Buttons](#buttons)
    - [Container](#container)
    - [Text](#text)
    - [Toast](#toast)
    - [CameraScrollbar](#camerascrollbar)
  - [Particles](#particles)
  - [Scenes](#scenes)
  - [Easing](#easing)
  - [RenderStatsDOM](#renderstatsdom)
  - [Storage](#storage)
  - [Utils](#utils)
  - [Polyfills](#polyfills)
- [Building / Publishing](#building--publishing)
- [License](#license)

---

## Installation

```bash
npm install @b7az3/robowhale-phaser
```

## Usage
Import components directly from the main entry or from subpaths (recommended for tree‑shaking):
```js
// Main entry (exports everything)
import { SimpleButton, GridArray, BaseScene } from '@b7az3/robowhale-phaser';

// Deep imports – more granular
import SimpleButton from '@b7az3/robowhale-phaser/phaser3/gameObjects/buttons/SimpleButton.js';
import { Direction } from '@b7az3/robowhale-phaser/utils/Direction.js';
```

🚀 Quick Start
```js
import { BaseScene, SimpleButton, GridArray, DeviceUtil } from '@b7az3/robowhale-phaser';

class MyScene extends BaseScene {
    create() {
        // Simple button with press feedback
        const btn = new SimpleButton(this, {
            texture: 'ui_atlas',
            frame: 'btn_blue',
            onPress: () => console.log('Clicked!')
        });
        this.add.existing(btn);
        
        // Grid storage
        const grid = new GridArray(5, 5);
        grid.addAt(2, 2, { name: 'player' });
        
        // Device detection
        if (DeviceUtil.isDesktop()) {
            console.log('Running on desktop');
        }
    }
}
```

📚 Modules Overview
🧩 Grid

    GridArray – 2D grid data structure with neighbor queries, dynamic resizing, and iteration helpers.

🎮 Phaser 3 Extensions

    Phaser3Extensions – Augments Phaser prototypes with extra methods (tween helpers, factory methods, scaling, etc.). Call Phaser3Extensions.polyfill() once.

    KineticScroll – Inertial (kinetic) scrolling for cameras with touch/mouse wheel support.

    RenderStatsDOM – Real‑time FPS / draw call overlay.

🔘 Buttons

    SimpleButton – Basic image button with press tween and optional sound.

    ComplexButton – Container‑based button with icon, text, and flexible layout.

    ToggleButton – Two‑state button that swaps frames.

    SoundButton / MusicButton – Specialised buttons for toggling sound/music mute (customisable callbacks).

    SwitchButton – Left/right arrow selector with title and dynamic text.

🖼️ Containers & Screens

    PhaserScreen – Full‑screen overlay with background and responsive pinning.

    SwitchButton – See above.

📝 Text

    AutosizeText – Automatically scales text to fit within a bounding box.

🍞 Toast Notifications

    Toast – Popup message with auto‑dismiss.

    ToastsManager – Manages a queue of toasts (extends PhaserScreen).

🌊 Particles

    ParticleUtil – Helper methods for particle emission zones (texture‑based, circle edge, random values).

🎬 Scenes

    BaseScene – Extended scene with pinning, scaling, fast‑forward, and keyboard shortcuts.

    FastForward – Speeds up / slows down scene tweens and time.

    Pinner – Pin objects to relative screen positions.

    Scaler – Responsive scaling of game objects (fit, fill, cover).

💾 Storage

    IdbKeyvalWrapper – IndexedDB wrapper (native, no external lib).

    LocalStorageWrapper – Namespaced localStorage.

    RuntimeStorage – In‑memory store.

🛠️ Utilities

    Direction / getOrthoDirection – 8‑directional constants.

    DeviceUtil – Desktop detection, device memory.

    NetUtil – Host detection, iframe check.

    parseMilliseconds, toMs – Time conversion.

    updateUrlQuery – URL parameter manipulation.

    isAvifSupported, isWebpSupported, isWebAssemblySupported – Feature detection.

    cssAnimate – Promise‑based CSS animation helper.

🔧 Polyfills

    Polyfills – Adds Element.remove() if missing.

🧪 Advanced Usage Examples
Kinetic scrolling with bounds checking
```js
import { KineticScroll } from '@b7az3/robowhale-phaser';

const scroller = new KineticScroll(this, {
    camera: this.cameras.main,
    horizontalScroll: true,
    verticalScroll: true,
    kineticMovement: true
});
scroller.addPointerListeners();
// In update() call scroller.update();
```

Autosize text inside a fixed rectangle
```js
import { AutosizeText } from '@b7az3/robowhale-phaser';

const text = new AutosizeText(scene, 400, 300, 'Long text...', {
    fontFamily: 'Arial',
    fontSize: '32px',
    color: '#fff'
}, { maxWidth: 200, maxHeight: 100 });
scene.add.existing(text);
```

Using storage with fallback
```js
import { IdbKeyvalWrapper, LocalStorageWrapper } from '@b7az3/robowhale-phaser';

let storage;
if (window.indexedDB) {
    storage = new IdbKeyvalWrapper('my_game');
    await storage.init();
} else {
    storage = new LocalStorageWrapper('my_game');
}
await storage.saveValue('score', 100);
const score = await storage.getNumber('score');
```

Creating a toggle button with custom callback
```js
import { ToggleButton } from '@b7az3/robowhale-phaser';

const toggle = new ToggleButton(scene, {
    texture: 'ui_atlas',
    frameState1: 'sound_on',
    frameState2: 'sound_off',
    onStateChange: (state) => {
        console.log(state === 1 ? 'ON' : 'OFF');
    }
});
```

You can import sub‑modules directly to reduce bundle size:

```js
import SimpleButton from '@b7az3/robowhale-phaser/phaser3/gameObjects/buttons/SimpleButton.js';
```

⚙️ Configuration & Extensibility

Most components accept a configuration object rather than many positional arguments.
All callbacks (onPress, onRelease, onUpdate, etc.) are optional, and sound is only played if you provide sound.key.

To add your own global extensions, use the Phaser3Extensions class – you can cherry‑pick which extensions to apply.
🤝 Contributing

Contributions are welcome! Please follow the existing code style and add JSDoc for any new methods.
📄 License

MIT © b7az3