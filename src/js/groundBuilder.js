import { drawHoleOutlines } from "./utils.js";

export function buildGroundAndHole(scene) {
    scene.grounds = scene.physics.add.staticGroup();

    for (let i = 0; i < scene.sceneSize.height / scene.groundSize - 12; i++) {
        for (let j = 0; j < scene.sceneSize.width / scene.groundSize; j++) {
            const isHole = scene.holePositions.some(hole => hole.x === j && hole.y === i);
            if (isHole) continue;

            const ground = scene.grounds.create(j * scene.groundSize, scene.groundSize * (12 + i), 'ground');
            ground.setDisplaySize(scene.groundSize, scene.groundSize);
            ground.setOrigin(0, 0);
            ground.refreshBody();
        }
    }

    // hide per-tile visuals
    scene.grounds.getChildren().forEach(g => g.setVisible(false));

    const totalRows = Math.floor(scene.sceneSize.height / scene.groundSize);
    const groundTopRow = totalRows - 6;
    drawHoleOutlines(scene, scene.holePositions, groundTopRow, scene.groundSize);
}

export function rebuildGroundAndHole(scene) {
    if (scene.grounds) scene.grounds.clear(true, true);

    // generate a new random hole position
    const holeStartPoint = Phaser.Math.Between(scene.groundAmount.x / 2, scene.groundAmount.x - 7);
    scene.holePositions = [];
    for (let dx = 0; dx < 6; dx++) {
        for (let dy = 0; dy < 3; dy++) {
            scene.holePositions.push({ x: holeStartPoint + dx, y: dy });
        }
    }

    buildGroundAndHole(scene);
}
