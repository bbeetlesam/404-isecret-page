import { drawHoleOutlines } from "./utils.js";

export function buildGroundAndHole(scene) {
    // remove previous ground if present
    if (scene.grounds && Array.isArray(scene.grounds)) {
        scene.grounds.forEach(g => {
            if (g.body) scene.matter.world.remove(g.body);
            if (g.sprite) g.sprite.destroy();
        });
    }
    scene.grounds = [];

    for (let i = 0; i < scene.sceneSize.height / scene.groundSize - 12; i++) {
        for (let j = 0; j < scene.sceneSize.width / scene.groundSize; j++) {
            const isHole = scene.holePositions.some(hole => hole.x === j && hole.y === i);
            if (isHole) continue;

            const wx = j * scene.groundSize + scene.groundSize / 2;
            const wy = scene.groundSize * (12 + i) + scene.groundSize / 2;

            const body = scene.matter.add.rectangle(wx, wy, scene.groundSize, scene.groundSize, { isStatic: true });
            const sprite = scene.add.image(j * scene.groundSize, scene.groundSize * (12 + i), 'ground')
                .setDisplaySize(scene.groundSize, scene.groundSize)
                .setOrigin(0, 0)
                .setVisible(false);

            scene.grounds.push({ body, sprite, x: j * scene.groundSize, y: scene.groundSize * (12 + i) });
        }
    }

    const totalRows = Math.floor(scene.sceneSize.height / scene.groundSize);
    const groundTopRow = totalRows - 6;
    drawHoleOutlines(scene, scene.holePositions, groundTopRow, scene.groundSize);
}

export function rebuildGroundAndHole(scene) {
    if (scene.grounds) {
        scene.grounds.forEach(g => {
            if (g.body) scene.matter.world.remove(g.body);
            if (g.sprite) g.sprite.destroy();
        });
    }

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
