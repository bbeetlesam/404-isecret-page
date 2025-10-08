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
        scene.player.body.setVelocityX(
            Phaser.Math.Clamp(scene.player.body.velocity.x + scene.movePower, -scene.maxVelocityX, scene.maxVelocityX)
        );

        if (scene.player.body.velocity.y > 10) {
            scene.player.rotationSpeed = 0.01;
        }

        const right = scene.player.getBounds().right;
        const screenRight = scene.sceneSize.width;
        if (right >= screenRight - 1) {
            GameState.isWin = true;
        }
    } else {
        scene.player.body.setVelocityX(0);
        scene.player.rotationSpeed = 0;
    }

    scene.player.rotation += scene.player.rotationSpeed;

    if (scene.ballIsEntering) {
        if (scene.player.x >= 50) {
            scene.player.body.setVelocity(0, 0);
            scene.player.body.setAllowGravity(true);
            scene.ballIsEntering = false;
            GameState.isRunning = false;
        }
    }

    if (GameState.isWin) {
        const startX = -100;
        const startY = scene.groundSize * 11.55;

        scene.player.setPosition(startX, startY);
        scene.player.body.setVelocity(150, 0);
        scene.player.body.setAllowGravity(false);

        GameState.addScore(1);
        scene.scoreText.setText(`${GameState.score}`);

        if (scene.groundBlocks) {
            scene.groundBlocks.clear(true, true);
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
