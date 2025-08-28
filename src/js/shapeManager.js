// function to create a draggable shape on the game scene
export function createShape(scene, x, y, shape) {
    if (!scene.stackos) scene.stackos = [];
    
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
    
    scene.stackos.push({ dragRect, ghostBlocks, shape });
    
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
            const snapX = Math.round(dragRect.x / blockSize) * blockSize;
            const snapY = Math.round(dragRect.y / blockSize) * blockSize;
            
            dragRect.setPosition(snapX, snapY);
            ghostBlocks.forEach((gb, i) => {
                gb.setPosition(
                    snapX + shape[i].x * blockSize,
                    snapY + shape[i].y * blockSize
                );
            });
            
            // Set color back to green (if needed)
            ghostBlocks.forEach(gb => gb.setFillStyle(0x00ff00));
        }
    });
    
    return dragRect;
}

// helper to solidify a stacko (call this on play)
export function solidifyStacko(scene, stacko, shape) {
    const { dragRect, ghostBlocks } = stacko;
    const blockSize = scene.groundSize;
    const snapX = dragRect.x;
    const snapY = dragRect.y;
    
    dragRect.disableInteractive();
    ghostBlocks.forEach(gb => gb.destroy());
    dragRect.destroy();
    
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

// get shape dimensions
function getShapeDimensions(shape, blockSize) {
    const minX = Math.min(...shape.map(p => p.x));
    const maxX = Math.max(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxY = Math.max(...shape.map(p => p.y));
    return {
        width: (maxX - minX + 1) * blockSize,
        height: (maxY - minY + 1) * blockSize
    };
}

// create 3 random shapes (experimental)
export function createRandomShapes(scene, Shapes, amount = 3, startX = 0, startY = 0, gap = 0) {
    if (!scene.shapeUIs) scene.shapeUIs = [];
    scene.shapeUIs.forEach(shape => shape.destroy());
    scene.shapeUIs = [];
    
    const allShapeKeys = Object.keys(Shapes);
    const shuffled = Phaser.Utils.Array.Shuffle(allShapeKeys);
    
    let currentX = startX;
    
    for (let i = 0; i < amount; i++) {
        const shapeKey = shuffled[i];
        const shape = Shapes[shapeKey];
        
        const { width } = getShapeDimensions(shape, scene.groundSize);
        
        const uiShape = createShape(scene, currentX, startY, shape);
        scene.shapeUIs.push(uiShape);
        
        currentX += width + gap;
    }
}

export function createRandomShapesCenter(scene, Shapes, amount, centerX = 0, startY = 0, gap = 0) {
    if (!scene.shapeUIs) scene.shapeUIs = [];
    scene.shapeUIs.forEach(shape => shape.destroy());
    scene.shapeUIs = [];
    
    const allShapeKeys = Object.keys(Shapes);
    const shuffled = Phaser.Utils.Array.Shuffle(allShapeKeys);
    
    // select amount number of random shapes
    const chosenShapes = shuffled.slice(0, amount);
    
    // count total width
    let totalWidth = 0;
    const widths = [];
    chosenShapes.forEach(key => {
        const { width } = getShapeDimensions(Shapes[key], scene.groundSize);
        widths.push(width);
        totalWidth += width;
    });
    totalWidth += gap * (chosenShapes.length - 1);
    
    let currentX = centerX - totalWidth / 2;
    
    // spawn
    for (let i = 0; i < chosenShapes.length; i++) {
        const shape = Shapes[chosenShapes[i]];
        const width = widths[i];
        
        const uiShape = createShape(scene, currentX, startY, shape);
        scene.shapeUIs.push(uiShape);
        
        currentX += width + gap;
    }
}