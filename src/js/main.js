import Phaser from "phaser";
import { MainScene } from "./scene.js";

// const isLandscape = window.innerWidth > window.innerHeight;

const config = {
    type: Phaser.AUTO,
    render: {
        pixelArt: false,
        antialias: true,
    },
    scale: {
        parent: "gameId",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1440,
        height: 1000,
        // min: {
        //     width: 320,
        //     height: 400
        // },
        // max: {
        //     width: 1600,
        //     height: 1600
        // },
        zoom: 1.5
    },
    scene: [MainScene],
    backgroundColor: "#00377a",
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
    // game.scale.resize(window.innerWidth, window.innerHeight);
    game.scale.refresh();
});