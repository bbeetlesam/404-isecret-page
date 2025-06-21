// JawaScript main entry

import { game } from './phaser.js';
import GameState from './gameState.js';

window.addEventListener('resize', () => {
    game.scale.refresh();
});

// Track keydown events
document.addEventListener('keydown', (e) => {
    // If the ESCAPE key is pressed (while the game is shown)
    if (e.key === 'Escape' && GameState.isShown) {
        const mainScene = game.scene.getScene('MainScene');
        
        GameState.isShown = false;
        if (mainScene && typeof mainScene.quitGame === 'function') {
            mainScene.quitGame();
        }
    }
});

// Track click events
document.addEventListener('click', (e) => {
    // Show the canvas if clicked on the button
    if (e.target.id === 'showGameButton') {
        GameState.isShown = true;
    }
    
    // Close game if click outside canvas while the canvas is shown
    if (e.target.id === 'game-id') {
        const canvas = document.querySelector('#game-id canvas');
        
        if (!(canvas && canvas.contains(e.target))) {
            const mainScene = game.scene.getScene('MainScene');
            
            GameState.isShown = false;
            if (mainScene && typeof mainScene.quitGame === 'function') {
                mainScene.quitGame();
            }
        }
    }
});