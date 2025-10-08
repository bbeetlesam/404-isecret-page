import GameState from './gameState.js';
import Shapes from './shapes.js';
import { createRandomShapesCenter, solidifyStacko } from './shapeManager.js';
import { createRaycastBetween } from './raycastUtils.js';
import { triggerGameOver } from './gameOverManager.js';
import { buildGroundAndHole } from './groundBuilder.js';
import { drawHoleOutlines } from './utils.js';

export function createMain(scene) {
    scene.sceneSize = { width: scene.scale.width, height: scene.scale.height };
    scene.groundBlocks = scene.physics.add.staticGroup();
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

    scene.maxVelocityX = 200;
    scene.movePower = 7;

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
            scene.bridgeCollider = scene.physics.add.collider(scene.player, scene.groundBlocks);
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

    // car falling physics
    scene.player = scene.physics.add.image(50, scene.groundSize * 11, "car");
    scene.player.setScale(0.2);
    scene.player.body.setBounce(0.2);
    scene.player.body.setAllowGravity(true);
    scene.player.body.setCollideWorldBounds(true);
    scene.player.setDrag(0.5);
    scene.player.setOrigin(0.5, 0.5);
    scene.player.rotationSpeed = 0;

    scene.physics.add.collider(scene.player, scene.grounds, () => {
        scene.player.body.setVelocity(150, 0);
        scene.player.body.setAngularVelocity(0);
        scene.player.body.setAllowGravity(true);
        scene.player.rotationSpeed = 0;
    });

    scene.bridgeCollider = scene.physics.add.collider(scene.player, scene.groundBlocks);

    scene.blockColliders = [];
    scene.groundBlocks.getChildren().forEach(block => {
        let c = scene.physics.add.collider(scene.player, block);
        scene.blockColliders.push({ block, collider: c });
    });

    scene.cameras.main.startFollow(scene.player, true, 0.1, 0.1);
    scene.cameras.main.setBounds(0, 0, scene.sceneSize.width, scene.sceneSize.height);

    scene.physics.add.collider(scene.player, scene.grounds);

    // create random initial stackos
    createRandomShapesCenter(scene, Shapes, 4, scene.sceneSize.width / 2, 20, 30);

    scene.levelTimeLimit = 10000; // 10 seconds
    scene.isGameOver = false;
}
