import Phaser from "phaser";
import { MainScene } from "./scene.js";

// const isLandscape = window.innerWidth > window.innerHeight;

export const config = {
    type: Phaser.AUTO,
    render: {
        pixelArt: false,
        antialias: true,
    },
    scale: {
        parent: "game-id",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1440,
        height: 1080,
        // min: {
        //     width: 320,
        //     height: 400
        // },
        zoom: 1.0
    },
    scene: [MainScene],
    backgroundColor: "#0d52bd",
};

export const game = new Phaser.Game(config);