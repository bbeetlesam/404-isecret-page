import GameState from './gameState.js';

export function triggerGameOver(scene, reason = 'Game Over') {
    scene.isGameOver = true;
    GameState.isRunning = false;
    
    const centerX = scene.cameras.main.scrollX + scene.sceneSize.width / 2;
    const centerY = scene.sceneSize.height / 2;
    
    scene.gameOverText = scene.add.text(centerX, centerY - 50, reason, {
        fontSize: '64px',
        fontFamily: 'Clear Sans',
        color: '#f0635a'
    }).setOrigin(0.5);
    
    scene.scoreText = scene.add.text(centerX, centerY + 10, `Cina Super: ${GameState.score}`, {
        fontSize: '40px',
        fontFamily: 'Clear Sans',
        color: '#ffffff'
    }).setOrigin(0.5);
    
    scene.restartButton = scene.add.text(centerX, centerY + 80, 'Main Lagi', {
        fontSize: '32px',
        fontFamily: 'Clear Sans',
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    scene.restartButton.on('pointerdown', () => {
        restartGame(scene);
    });
}

export function restartGame(scene) {
    GameState.resetStates();
    GameState.isShown = true;
    GameState.score = 0;
    scene.scene.restart();
}