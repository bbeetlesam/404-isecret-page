// function to create a draggable shape on the game scene
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
    
    let dragOffsetX = 0, dragOffsetY = 0;
    
    scene.input.on('dragstart', (pointer, obj) => {
        if (obj === dragRect) {
            dragOffsetX = pointer.x - dragRect.x;
            dragOffsetY = pointer.y - dragRect.y;
        }
    });
    
    scene.input.on('drag', (pointer, obj, dragX, dragY) => {
        if (obj === dragRect) {
            // keep the pointer at the same offset inside the dragRect
            const newX = pointer.x - dragOffsetX;
            const newY = pointer.y - dragOffsetY;
            
            dragRect.setPosition(newX, newY);
            shape.forEach((pos, i) => {
                ghostBlocks[i].setPosition(
                    newX + pos.x * blockSize,
                    newY + pos.y * blockSize
                );
            });
        }
    });
    
    scene.input.on('dragend', (pointer, obj) => {
        if (obj === dragRect) {
            // snap to grid on drop
            const snapX = Math.round(dragRect.x / blockSize) * blockSize;
            const snapY = Math.round(dragRect.y / blockSize) * blockSize;
            
            dragRect.setPosition(snapX, snapY);
            ghostBlocks.forEach((gb, i) => {
                gb.setPosition(
                    snapX + shape[i].x * blockSize,
                    snapY + shape[i].y * blockSize
                );
            });
            
            dragRect.destroy();
            ghostBlocks.forEach(gb => gb.destroy());
            
            shape.forEach(pos => {
                const block = scene.groundBlocks.create(
                    snapX + pos.x * blockSize,
                    snapY + pos.y * blockSize,
                    null
                );
                
                block.setSize(blockSize, blockSize);
                block.setOrigin(0, 0);
                block.setDisplaySize(blockSize, blockSize);
                block.refreshBody();
                
                const graphics = scene.add.rectangle(
                    snapX + pos.x * blockSize,
                    snapY + pos.y * blockSize,
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

// create 3 random shapes (experimental)
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