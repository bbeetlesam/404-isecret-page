export function createShape(scene, x, y, shape) {
    const blockSize = scene.groundSize;
    const ghostBlocks = [];
    
    shape.forEach(pos => {
        const block = scene.add.rectangle(
            x + pos.x * blockSize,
            y + pos.y * blockSize,
            blockSize, blockSize,
            0x00ff00
        ).setOrigin(0, 0)
            .setStrokeStyle(2, 0x000000);
        ghostBlocks.push(block);
    });
    
    const minX = Math.min(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxX = Math.max(...shape.map(p => p.x));
    const maxY = Math.max(...shape.map(p => p.y));
    const width = (maxX - minX + 1) * blockSize;
    const height = (maxY - minY + 1) * blockSize;
    
    const dragRect = scene.add.rectangle(x, y, width, height, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive();
    scene.input.setDraggable(dragRect);
    
    let offsetX = 0, offsetY = 0;
    
    scene.input.on('dragstart', (pointer, obj) => {
        if (obj === dragRect) {
            offsetX = pointer.x - dragRect.x;
            offsetY = pointer.y - dragRect.y;
        }
    });
    
    scene.input.on('drag', (pointer, obj, dragX, dragY) => {
        if (obj === dragRect) {
            const snapX = Math.round((dragX - offsetX) / blockSize) * blockSize;
            const snapY = Math.round((dragY - offsetY) / blockSize) * blockSize;
            
            dragRect.setPosition(snapX, snapY);
            shape.forEach((pos, i) => {
                ghostBlocks[i].setPosition(
                    snapX + pos.x * blockSize,
                    snapY + pos.y * blockSize
                );
            });
        }
    });
    
    scene.input.on('dragend', (pointer, obj) => {
        if (obj === dragRect) {
            const finalX = dragRect.x;
            const finalY = dragRect.y;
            
            dragRect.destroy();
            ghostBlocks.forEach(gb => gb.destroy());
            
            shape.forEach(pos => {
                const block = scene.groundBlocks.create(
                    finalX + pos.x * blockSize,
                    finalY + pos.y * blockSize,
                    null
                );
                
                block.setSize(blockSize, blockSize);
                block.setOrigin(0, 0);
                block.setDisplaySize(blockSize, blockSize);
                block.refreshBody();
                
                const graphics = scene.add.rectangle(
                    finalX + pos.x * blockSize,
                    finalY + pos.y * blockSize,
                    blockSize, blockSize,
                    0x00ffff
                ).setOrigin(0, 0)
                    .setStrokeStyle(2, 0x000000);
                
                scene.groundBlocks.add(graphics);
            });
            
            scene.physics.add.collider(scene.player, scene.groundBlocks);
        }
    });
    
    return dragRect;
}

export function createRandomShapes(scene, Shapes) {
    if (!scene.shapeUIs) scene.shapeUIs = [];
    scene.shapeUIs.forEach(shape => shape.destroy());
    scene.shapeUIs = [];
    
    const allShapeKeys = Object.keys(Shapes);
    const shuffled = Phaser.Utils.Array.Shuffle(allShapeKeys);
    
    for (let i = 0; i < 3; i++) {
        const shapeKey = shuffled[i];
        const shape = Shapes[shapeKey];
        
        const x = 100 + i * 200;
        const y = 0;
        
        const uiShape = createShape(scene, x, y, shape);
        scene.shapeUIs.push(uiShape);
    }
}