import Phaser from "phaser";
import { MainScene } from "./scene.js";

// const isLandscape = window.innerWidth > window.innerHeight;

/** @type {import('phaser').Types.Core.GameConfig} */
export const config = {
    type: Phaser.AUTO,
    pixelArt: false,
    antialias: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 350 },
            debug: true
        }
    },
    scale: {
        parent: "game-id",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1440,
        height: 1080,
        zoom: 1.0
    },
    scene: [MainScene],
    backgroundColor: "#0d52bd",
};

export const game = new Phaser.Game(config);