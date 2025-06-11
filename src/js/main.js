// JawaScript main entry

import { config, game } from './phaser.js';
import GameState from './gameState.js';

window.addEventListener('resize', () => {
    game.scale.refresh();
});

document.getElementById('showGameButton').addEventListener('click', () => {
    GameState.isShown = true;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && GameState.isShown) {
        GameState.isShown = false;
        const mainScene = game.scene.getScene('MainScene');
        if (mainScene && typeof mainScene.quitGame === 'function') {
            mainScene.quitGame();
        }
    }
});