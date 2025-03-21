// JawaScript main entry

import { config, game } from './phaser.js';

window.addEventListener("resize", () => {
    // game.scale.resize(window.innerWidth, window.innerHeight);
    game.scale.refresh();
});