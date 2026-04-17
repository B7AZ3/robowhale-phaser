import Phaser from 'phaser';
import SimpleButton from './gameObjects/buttons/SimpleButton.js';
import ToggleButton from './gameObjects/buttons/ToggleButton.js';
import SoundButton from './gameObjects/buttons/SoundButton.js';
import MusicButton from './gameObjects/buttons/MusicButton.js';
import ComplexButton from './gameObjects/buttons/ComplexButton.js';
import AutosizeText from './gameObjects/text/AutosizeText.js';

/**
 * Collection of static methods that add useful extensions to Phaser 3 classes.
 * Call the desired methods once (e.g., in your game's boot scene) to augment Phaser prototypes.
 */
export default class Phaser3Extensions {
    /**
     * Extends Phaser.GameObjects.Group with `createItems(quantity)`.
     */
    static extendGroup() {
        if (Phaser.GameObjects.Group.prototype.createItems) return;
        Phaser.GameObjects.Group.prototype.createItems = function(quantity) {
            const items = [];
            for (let i = 0; i < quantity; i++) {
                items.push(this.create());
            }
            return items;
        };
    }

    /**
     * Extends Phaser.GameObjects.Graphics with `inverseSlice` (creates a slice with inverted angles).
     */
    static extendGraphics() {
        if (Phaser.GameObjects.Graphics.prototype.inverseSlice) return;
        Phaser.GameObjects.Graphics.prototype.inverseSlice = function(x, y, radius, startAngle, endAngle, anticlockwise, overshoot) {
            const inverseStartAngle = endAngle;
            const inverseEndAngle = startAngle;
            return this.slice(x, y, radius, inverseStartAngle, inverseEndAngle, anticlockwise, overshoot);
        };
    }

    /**
     * Adds custom tween factory methods to TweenManager:
     * - addYoyoTween: creates a yoyo tween that alternates between base±delta
     * - addCircleTween: moves a target around a circle
     * - addCurveTween: moves a target along a curve, optionally rotating
     * - killTweensByProperty: stops tweens affecting specific properties
     */
    static extendTweens() {
        const tweenManagerProto = Phaser.Tweens.TweenManager.prototype;

        if (!tweenManagerProto.addYoyoTween) {
            tweenManagerProto.addYoyoTween = function(config) {
                const { target, property, base, delta, ...tweenProps } = config;
                let repeatCounter = 0;
                const baseValue = base ?? target[property];
                return this.add({
                    ease: Phaser.Math.Easing.Sine.Out,
                    ...tweenProps,
                    targets: target,
                    yoyo: true,
                    [property]: () => {
                        repeatCounter++;
                        return (repeatCounter % 2 === 0) ? baseValue - delta : baseValue + delta;
                    }
                });
            };
        }

        if (!tweenManagerProto.addCircleTween) {
            tweenManagerProto.addCircleTween = function(config) {
                const startAngle = config.startAngle ?? -90;
                const endAngle = config.endAngle ?? startAngle + 360;
                return this.addCounter({
                    ...config,
                    onUpdate: (tween, target, param) => {
                        const angle = startAngle + (endAngle - startAngle) * target.value;
                        const angleRad = Phaser.Math.DegToRad(angle);
                        config.target.x = config.centerX + Math.cos(angleRad) * config.radius;
                        config.target.y = config.centerY + Math.sin(angleRad) * config.radius;
                        if (config.onUpdate) config.onUpdate(tween, target, param);
                    }
                });
            };
        }

        if (!tweenManagerProto.addCurveTween) {
            tweenManagerProto.addCurveTween = function(config) {
                const position = new Phaser.Math.Vector2();
                let tangent;
                if (config.rotateToCurve) {
                    tangent = new Phaser.Math.Vector2();
                    config.rotateOffset = config.rotateOffset ?? 0;
                }
                return this.addCounter({
                    ...config,
                    onUpdate: (tween, target, param) => {
                        config.curve.getPoint(target.value, position);
                        config.target.setPosition(position.x, position.y);
                        if (config.rotateToCurve) {
                            config.curve.getTangent(target.value, tangent);
                            config.target.angle = tangent.angle() * Phaser.Math.RAD_TO_DEG + config.rotateOffset;
                        }
                        if (config.onUpdate) config.onUpdate(tween, target, param);
                    }
                });
            };
        }

        if (!tweenManagerProto.killTweensByProperty) {
            tweenManagerProto.killTweensByProperty = function(target, ...properties) {
                this.getTweensOf(target)
                    .filter(tween => tween.data.some(data => properties.includes(data.key)))
                    .forEach(tween => tween.stop());
                return this;
            };
        }
    }

    /**
     * Adds `getWorldPosition` and (if available) `getGlobalCenter` methods to many game object classes.
     */
    static addGetGlobalPosition() {
        const getWorldPosition = function(out) {
            const worldMatrix = this.getWorldTransformMatrix();
            out = out ?? { x: 0, y: 0 };
            out.x = worldMatrix.tx;
            out.y = worldMatrix.ty;
            return out;
        };
        const getGlobalCenter = function() {
            const center = this.getCenter();
            return this.prepareBoundsOutput(center, true);
        };
        const classes = [
            Phaser.GameObjects.Container,
            Phaser.GameObjects.Image,
            Phaser.GameObjects.Sprite,
            Phaser.GameObjects.Graphics,
            Phaser.GameObjects.Shape,
            Phaser.GameObjects.Text,
            Phaser.GameObjects.BitmapText
        ];
        for (const clazz of classes) {
            if (!clazz.prototype.getWorldPosition) clazz.prototype.getWorldPosition = getWorldPosition;
            if (clazz.prototype.hasOwnProperty('getCenter') && clazz.prototype.hasOwnProperty('prepareBoundsOutput')) {
                if (!clazz.prototype.getGlobalCenter) clazz.prototype.getGlobalCenter = getGlobalCenter;
            }
        }
    }

    /**
     * Adds `kill()` and `revive()` methods to hide/disable game objects.
     */
    static addKillRevive() {
        const kill = function() {
            this.visible = false;
            this.active = false;
        };
        const revive = function() {
            this.visible = true;
            this.active = true;
        };
        const classes = [
            Phaser.GameObjects.RenderTexture,
            Phaser.GameObjects.Container,
            Phaser.GameObjects.Image,
            Phaser.GameObjects.Sprite,
            Phaser.GameObjects.Graphics,
            Phaser.GameObjects.Shape,
            Phaser.GameObjects.Text,
            Phaser.GameObjects.BitmapText,
            Phaser.GameObjects.Particles.ParticleEmitter,
            Phaser.GameObjects.Particles.ParticleEmitterManager
        ];
        for (const clazz of classes) {
            if (!clazz.prototype.kill) clazz.prototype.kill = kill;
            if (!clazz.prototype.revive) clazz.prototype.revive = revive;
        }
    }

    /**
     * Extends Container with `gridAlign` method that aligns a range of children.
     */
    static extendContainer() {
        if (Phaser.GameObjects.Container.prototype.gridAlign) return;
        Phaser.GameObjects.Container.prototype.gridAlign = function(options, startIndex = 0, endIndex = this.length) {
            const items = this.list.slice(startIndex, endIndex);
            Phaser.Actions.GridAlign(items, options);
            return this;
        };
    }

    /**
     * Extends AnimationManager with `getFrameNames` to retrieve frames from an atlas by prefix.
     */
    static extendAnimationManager() {
        if (!Phaser.Animations) return;
        if (Phaser.Animations.AnimationManager.prototype.getFrameNames) return;

        const getFrameNumber = (frameName, zeroPad = 4) => parseInt(frameName.slice(-zeroPad), 10);
        const sortByFrameNumbers = (a, b) => getFrameNumber(a) - getFrameNumber(b);

        Phaser.Animations.AnimationManager.prototype.getFrameNames = function(atlasKey, prefix) {
            const allFrames = this.game.textures.get(atlasKey).getFrameNames();
            const animationFrameNames = allFrames
                .filter(frameName => frameName.includes(prefix))
                .sort(sortByFrameNumbers);
            return animationFrameNames.map(frame => ({ key: atlasKey, frame }));
        };
    }

    /**
     * Adds useful static math functions: `Sign` and `MapLinear`.
     */
    static extendMath() {
        if (!Phaser.Math.Sign) {
            Phaser.Math.Sign = (value) => value >= 0 ? 1 : -1;
        }
        if (!Phaser.Math.MapLinear) {
            Phaser.Math.MapLinear = (x, a1, a2, b1, b2) => b1 + (x - a1) * (b2 - b1) / (a2 - a1);
        }
    }

    /**
     * Adds convenience methods to Phaser's RandomDataGenerator:
     * - bool()
     * - pickMultiple()
     * - pickExcept()
     * - pickExceptMultiple()
     */
    static extendRandomDataGenerator() {
        const rndProto = Phaser.Math.RandomDataGenerator.prototype;
        if (!rndProto.bool) {
            rndProto.bool = function() { return this.frac() > 0.5; };
        }
        if (!rndProto.pickMultiple) {
            rndProto.pickMultiple = function(array, num) {
                num = Math.min(num, array.length);
                const result = [];
                while (result.length < num) {
                    const item = this.pick(array);
                    if (!result.includes(item)) result.push(item);
                }
                return result;
            };
        }
        if (!rndProto.pickExcept) {
            rndProto.pickExcept = function(array, exception) {
                let item;
                let safety = array.length;
                do {
                    item = this.pick(array);
                } while (exception === item && --safety > 0);
                return item;
            };
        }
        if (!rndProto.pickExceptMultiple) {
            rndProto.pickExceptMultiple = function(array, exceptions, safetyCounter = 100) {
                let item;
                do {
                    item = this.pick(array);
                } while (exceptions.includes(item) && --safetyCounter > 0);
                return item;
            };
        }
    }

    /**
     * Extends GameObjectFactory with methods to create custom UI components:
     * - existingMultiple(children)
     * - button(...)
     * - toggleButton(...)
     * - soundButton(...)
     * - musicButton(...)
     * - complexButton(...)
     * - autoText(...)
     */
    static extendFactory() {
        const factory = Phaser.GameObjects.GameObjectFactory.prototype;

        if (!factory.existingMultiple) {
            factory.existingMultiple = function(children) {
                return children.map(child => this.existing(child));
            };
        }
        if (!factory.button) {
            factory.button = function(texture, frame, parent) {
                return new SimpleButton(this.scene, { texture, frame, parent });
            };
        }
        if (!factory.toggleButton) {
            factory.toggleButton = function(texture, frame1, frame2, parent) {
                return new ToggleButton(this.scene, { texture, frameState1: frame1, frameState2: frame2, parent });
            };
        }
        if (!factory.soundButton) {
            factory.soundButton = function(texture, frame1, frame2, parent) {
                return new SoundButton(this.scene, { texture, frameOn: frame1, frameOff: frame2, parent });
            };
        }
        if (!factory.musicButton) {
            factory.musicButton = function(texture, frame1, frame2, parent) {
                return new MusicButton(this.scene, { texture, frameOn: frame1, frameOff: frame2, parent });
            };
        }
        if (!factory.complexButton) {
            factory.complexButton = function(backTexture, backFrame, parent) {
                return new ComplexButton(this.scene, { texture: backTexture, frame: backFrame, parent });
            };
        }
        if (!factory.autoText) {
            factory.autoText = function(content, style, parent) {
                const text = new AutosizeText(this.scene, 0, 0, content, style);
                parent ? parent.add(text) : this.scene.add.existing(text);
                return text;
            };
        }
    }

    /**
     * Adds scaling helper methods to GameObject:
     * - fitWidth(maxWidth)
     * - fitHeight(maxHeight)
     * - fitIn(maxWidth, maxHeight)
     * - fillWidth(maxWidth)
     * - fillHeight(maxHeight)
     * - envelop(maxWidth, maxHeight)
     */
    static addScaleMethods() {
        const hasScale = (obj) => typeof obj.setScale !== 'undefined';
        const proto = Phaser.GameObjects.GameObject.prototype;

        if (!proto.fitWidth) {
            proto.fitWidth = function(width) {
                if (!hasScale(this)) return;
                this.setScale(1);
                this.setScale(width / this.width);
            };
        }
        if (!proto.fitHeight) {
            proto.fitHeight = function(maxHeight) {
                if (!hasScale(this)) return;
                this.setScale(Math.min(1, maxHeight / this.height));
            };
        }
        if (!proto.fitIn) {
            proto.fitIn = function(maxWidth, maxHeight) {
                if (!hasScale(this)) return;
                const scaleX = maxWidth / this.width;
                const scaleY = maxHeight / this.height;
                this.scale = Math.min(1, scaleX, scaleY);
            };
        }
        if (!proto.fillWidth) {
            proto.fillWidth = function(maxWidth) {
                if (!hasScale(this)) return;
                this.setScale(Math.max(1, maxWidth / this.width));
            };
        }
        if (!proto.fillHeight) {
            proto.fillHeight = function(maxHeight) {
                if (!hasScale(this)) return;
                this.setScale(Math.max(1, maxHeight / this.height));
            };
        }
        if (!proto.envelop) {
            proto.envelop = function(maxWidth, maxHeight) {
                if (!hasScale(this)) return;
                const scaleX = maxWidth / this.width;
                const scaleY = maxHeight / this.height;
                this.scale = Math.max(scaleX, scaleY);
            };
        }
    }

    /**
     * Adds `top`, `right`, `bottom`, `left` getters/setters to GameObject for easy bounds manipulation.
     */
    static addAlignMethods() {
        const proto = Phaser.GameObjects.GameObject.prototype;
        if (!Object.getOwnPropertyDescriptor(proto, 'top')) {
            Object.defineProperty(proto, 'top', {
                get: function() { return Phaser.Display.Bounds.GetTop(this); },
                set: function(value) { Phaser.Display.Bounds.SetTop(this, value); }
            });
        }
        if (!Object.getOwnPropertyDescriptor(proto, 'right')) {
            Object.defineProperty(proto, 'right', {
                get: function() { return Phaser.Display.Bounds.GetRight(this); },
                set: function(value) { Phaser.Display.Bounds.SetRight(this, value); }
            });
        }
        if (!Object.getOwnPropertyDescriptor(proto, 'bottom')) {
            Object.defineProperty(proto, 'bottom', {
                get: function() { return Phaser.Display.Bounds.GetBottom(this); },
                set: function(value) { Phaser.Display.Bounds.SetBottom(this, value); }
            });
        }
        if (!Object.getOwnPropertyDescriptor(proto, 'left')) {
            Object.defineProperty(proto, 'left', {
                get: function() { return Phaser.Display.Bounds.GetLeft(this); },
                set: function(value) { Phaser.Display.Bounds.SetLeft(this, value); }
            });
        }
    }

    /**
     * Extends LoaderPlugin with:
     * - scriptTag(key, url, onSuccess, onFail) – loads an external script
     * - bitmapFontFromAtlas(...) – creates a bitmap font from an atlas frame and XML data
     */
    static extendLoader() {
        const loaderProto = Phaser.Loader.LoaderPlugin.prototype;

        if (!loaderProto.scriptTag) {
            loaderProto.scriptTag = function(key, url, onSuccess, onFail) {
                // Using a simple custom loader without rexAwait
                this.addToScene(key, () => new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.type = 'text/javascript';
                    script.onload = (event) => {
                        if (onSuccess) onSuccess(event);
                        resolve();
                    };
                    script.onerror = (event) => {
                        if (onFail) onFail(event);
                        reject(event);
                    };
                    document.head.appendChild(script);
                }));
                return this;
            };
        }

        if (!loaderProto.bitmapFontFromAtlas) {
            loaderProto.bitmapFontFromAtlas = function(fontKey, atlasKey, atlasFrame, dataURL, xSpacing, ySpacing) {
                const xmlKey = fontKey + '_data';
                this.xml(xmlKey, dataURL);
                this.once(Phaser.Loader.Events.COMPLETE, () => {
                    const wasParsed = Phaser.GameObjects.BitmapText.ParseFromAtlas(
                        this.scene, fontKey, atlasKey, atlasFrame, xmlKey, xSpacing, ySpacing
                    );
                    if (!wasParsed) console.warn(`Can't add bitmap font ${fontKey}`);
                });
                return this;
            };
        }
    }
}