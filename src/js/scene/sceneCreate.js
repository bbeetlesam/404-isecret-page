import GameState from '../gameState.js';
import Shapes from '../shape/shapes.js';
import { createRandomShapesCenter, solidifyStacko } from '../shape/shapeManager.js';
import { createRaycastBetween } from '../raycastUtils.js';
import { triggerGameOver } from '../gameOverManager.js';
import { buildGroundAndHole } from '../groundBuilder.js';
import { drawHoleOutlines } from '../utils.js';

export async function createMain(scene) {
    scene.sceneSize = { width: scene.scale.width, height: scene.scale.height };
    // Use arrays to store Matter bodies/sprites for ground and blocks
    scene.groundBlocks = [];
    scene.isGameOver = false;
    scene.groundSize = 60;
    scene.groundAmount = { x: scene.sceneSize.width / scene.groundSize, y: scene.sceneSize.height / scene.groundSize };

    let holeStartPoint = Phaser.Math.Between(scene.groundAmount.x / 2, scene.groundAmount.x - 7);
    scene.holePositions = [];
    for (let dx = 0; dx < 6; dx++) {
        for (let dy = 0; dy < 3; dy++) {
            scene.holePositions.push({ x: holeStartPoint + dx, y: dy });
        }
    }

    // set the max velocity and power for the car
    scene.maxVelocityX = 4;
    scene.movePower = 0.5;

    await document.fonts.load('bold 85px "Clear Sans"');
    scene.scoreText = scene.add.text(scene.sceneSize.width - 110, 5, `${GameState.score}`, {
        fontSize: '85px', fontFamily: 'Clear Sans', color: '#ffffff',
    }).setOrigin(1, 0);

    scene.playButton = scene.add.image(scene.sceneSize.width - 15, 15, "play")
        .setScale(75/256)
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true });

    scene.playButton.on('pointerup', () => {
        GameState.isRunning = true;
        scene.levelStartTime = scene.time.now;

        if (scene.stackos) {
            scene.stackos.forEach(stacko => {
                stacko.dragRect.disableInteractive();
                stacko.ghostBlocks.forEach(gb => {
                    if (gb.setTint) gb.setTint(0x00ffff);
                    else if (gb.setFillStyle) gb.setFillStyle(0x00ffff);
                });
                solidifyStacko(scene, stacko, stacko.shape);
            });
            scene.stackos = [];
        }

        if (!scene.bridgeCollider) {
            // Arcade collider isn't available with Matter; mark the flag instead.
            scene.bridgeCollider = true;
        }
    });

    // build the ground tiles and outlines
    buildGroundAndHole(scene);

    // draw one stretched base ground image to cover the whole ground area
    const groundPosY = scene.sceneSize.height - scene.groundSize * 6;
    scene.baseGround = scene.add.image(0, groundPosY, 'baseGround')
        .setOrigin(0, 0)
        .setDisplaySize(scene.sceneSize.width, scene.groundSize * 6)
        .setDepth(-0.5);

    // background layers
    scene.sky = scene.add.image(0, 0, 'sky').setOrigin(0, 0).setScrollFactor(0).setDepth(-6);
    scene.mountain2 = scene.add.image(0, 0, 'mountain2').setOrigin(0, 0).setScrollFactor(0).setDepth(-5);
    scene.mountain1 = scene.add.image(0, 0, 'mountain1').setOrigin(0, 0).setScrollFactor(0).setDepth(-4);
    scene.crater = scene.add.image(0, -20, 'crater').setOrigin(0, 0).setScrollFactor(0.2).setDepth(-3);
    scene.stars = scene.add.image(0, 0, 'stars').setDisplaySize(1100, 331).setOrigin(0, 0).setScrollFactor(0.2).setDepth(-2);
    scene.planet = scene.add.image(0, 0, 'planet').setOrigin(0, 0).setScrollFactor(0.4).setDepth(-1);

    const rayX = 1440;
    createRaycastBetween(scene, { x: rayX, y: scene.groundSize * 11 }, { x: rayX, y: scene.groundSize * 13 }, 10, (ray, player) => {
        console.log('Player crossed the ray!');
        GameState.isWin = true;
    });

    // Create the car as a Matter sprite so its body can rotate with the texture
    scene.player = scene.matter.add.sprite(50, scene.groundSize * 11, 'car');
    scene.player.setScale(0.2);
    const pw = scene.player.displayWidth;
    const ph = scene.player.displayHeight;
    scene.player.setBody({ type: 'rectangle', width: pw, height: ph }, { chamfer: { radius: 8 } });
    scene.player.setBounce(0.2);
    scene.player.setFrictionAir(0.02);
    scene.player.setFixedRotation(false);
    scene.player.setOrigin(0.5, 0.5);
    scene.player.rotationSpeed = 0;

    // 'remove' the car's collision force on X axis
    scene._preservedPlayerVx = 0;
    scene.matter.world.on('beforeupdate', () => {
        if (scene.player && scene.player.body && scene.player.body.velocity) {
            scene._preservedPlayerVx = scene.player.body.velocity.x;
        }
    });

    scene.matter.world.on('collisionactive', (event) => {
        if (!scene.player || !scene.player.body) return;
        event.pairs.forEach(pair => {
            const a = pair.bodyA;
            const b = pair.bodyB;

            let other = null;
            if (a === scene.player.body) other = b;
            else if (b === scene.player.body) other = a;
            if (!other) return;

            // Only restore horizontal velocity when colliding with static bodies
            // (ground/solidified blocks are created as isStatic:true)
            if (other.isStatic) {
                const currentVy = scene.player.body.velocity ? scene.player.body.velocity.y : 0;
                // restore horizontal velocity
                if (scene.player.setVelocity) scene.player.setVelocity(scene._preservedPlayerVx || 0, currentVy);
                // prevent collision from spinning the sprite
                if (scene.player.setAngularVelocity) scene.player.setAngularVelocity(0);
                scene.player.rotationSpeed = 0;
            }
        });
    });

    // We'll manage block colliders via arrays of Matter bodies
    scene.blockColliders = [];

    scene.cameras.main.startFollow(scene.player, true, 0.1, 0.1);
    scene.cameras.main.setBounds(0, 0, scene.sceneSize.width, scene.sceneSize.height);

    // Remove Arcade collider call: project now uses Matter physics.
    // Matter handles collisions between dynamic and static bodies automatically.
    // Keep a boolean flag so other code can check for the existence of a collider.
    scene.bridgeCollider = scene.bridgeCollider || false;

    // create random initial stackos
    createRandomShapesCenter(scene, Shapes, 4, scene.sceneSize.width / 2, 20, 30);

    scene.levelTimeLimit = 10000; // 10 seconds
    scene.isGameOver = false;
}
