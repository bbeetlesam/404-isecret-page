import GameState from './gameState.js';
import { createRandomShapesCenter } from './shapeManager.js';
import Shapes from './shapes.js';
import { rebuildGroundAndHole } from './groundBuilder.js';
import { triggerGameOver } from './gameOverManager.js';

export function updateMain(scene, time, delta) {
    if (!scene.isGameOver && GameState.isRunning) {
        const elapsed = scene.time.now - scene.levelStartTime;
        if (elapsed >= scene.levelTimeLimit) {
            triggerGameOver(scene, 'Kanjut Badag');
        }
    }

    scene.showGame(GameState.isShown);
    if (!scene.player || !scene.player.body) return;

    if (GameState.isRunning) {
        // Increase horizontal velocity gradually using physics-friendly method
        const bodyVx = (scene.player.body && scene.player.body.velocity) ? scene.player.body.velocity.x : 0;
        const desiredVx = Phaser.Math.Clamp(bodyVx + scene.movePower * (delta / 16.6667), -scene.maxVelocityX, scene.maxVelocityX);
        const currentVy = (scene.player.body && scene.player.body.velocity) ? scene.player.body.velocity.y : 0;
        if (scene.player.setVelocity) scene.player.setVelocity(desiredVx, currentVy);

        if (currentVy > 10) scene.player.rotationSpeed = 0.01;

        const right = scene.player.x + (scene.player.displayWidth || 0) * 0.5;
        const screenRight = scene.sceneSize.width;
        if (right >= screenRight - 1) GameState.isWin = true;
    } else {
        // keep vertical velocity untouched so the car can fall normally, even when idle
        const currentVy = (scene.player.body && scene.player.body.velocity) ? scene.player.body.velocity.y : 0;
        if (scene.player.setVelocity) scene.player.setVelocity(0, currentVy);
        scene.player.rotationSpeed = 0;
    }

    scene.player.rotation += scene.player.rotationSpeed;

    if (scene.ballIsEntering) {
        if (scene.player.x >= 50) {
            if (scene.player.setVelocity) scene.player.setVelocity(0, 0);
            if (scene.player.setIgnoreGravity) scene.player.setIgnoreGravity(false);
            scene.ballIsEntering = false;
            GameState.isRunning = false;
        }
    }

    if (GameState.isWin) {
        const startX = -100;
        const startY = scene.groundSize * 11.55;

    scene.player.setPosition(startX, startY);
    if (scene.player.setVelocity) scene.player.setVelocity(150, 0);
    if (scene.player.setIgnoreGravity) scene.player.setIgnoreGravity(true);

        GameState.addScore(1);
        scene.scoreText.setText(`${GameState.score}`);

        if (scene.groundBlocks && Array.isArray(scene.groundBlocks)) {
            scene.groundBlocks.forEach(b => {
                if (b.body) scene.matter.world.remove(b.body);
                if (b.sprite) b.sprite.destroy();
            });
            scene.groundBlocks.length = 0;
        }

        // regenerate hole position, ground bodies, and outline for the next round
        rebuildGroundAndHole(scene);

        scene.stackos = [];
        createRandomShapesCenter(scene, Shapes, 4, scene.sceneSize.width / 2, 20, 30);

        GameState.isWin = false;
        scene.levelStartTime = scene.time.now;
        scene.ballIsEntering = true;
    }

    const blockSize = scene.groundSize;
    let hasBlockBelow = false;

    scene.blockColliders.forEach(entry => {
        const block = entry.block;
        const withinX = Math.abs(block.x - scene.player.x) < blockSize * 0.5;
        const belowY  = block.y >= scene.player.y && block.y - scene.player.y < blockSize;

        entry.collider.active = withinX && belowY;

        if (entry.collider.active) {
            hasBlockBelow = false;
        }
    });

    if (!hasBlockBelow) {
        scene.player.rotationSpeed = 0.0;
    } else {
        scene.player.rotationSpeed = 0;
    }
}
