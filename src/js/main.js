// JawaScript main entry

import { config, game } from './phaser.js';

let isGameShown = false;

window.addEventListener('resize', () => {
    game.scale.refresh();
});

document.getElementById('showGameBtn').addEventListener('click', () => {
    isGameShown = true;
    document.getElementById('game-id').style.display = 'block';
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isGameShown) {
        isGameShown = false;
        document.getElementById('game-id').style.display = 'none';
    }
});