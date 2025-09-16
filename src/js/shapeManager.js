import { checkOverlapWithGround } from './utils.js';

// helper: pick a valid, preloaded texture key
function chooseStackoTexture(scene) {
    const defaults = ['stacko1', 'stacko2', 'stacko3', 'stacko4', 'stacko5'];
    const pool = Array.isArray(scene.stackoTextures) && scene.stackoTextures.length
        ? scene.stackoTextures
        : defaults;

    const validPool = pool
        .filter(k => typeof k === 'string' && k.length > 0)
        .filter(k => scene.textures && scene.textures.exists(k));

    if (validPool.length === 0) {
        console.warn('[Stacko] No valid textures found. Check preload and keys.');
        return null;
    }
    return Phaser.Utils.Array.GetRandom(validPool);
}

// function to create a draggable shape on the game scene
export function createShape(scene, x, y, shape) {
    if (!scene.stackos) scene.stackos = [];
    
    const blockSize = scene.groundSize;
    const ghostBlocks = [];
    
    // pick one random texture for this whole stacko (validated)
    const textureKey = chooseStackoTexture(scene);

    shape.forEach(pos => {
        if (textureKey) {
            const block = scene.add.image(
                x + pos.x * blockSize,
                y + pos.y * blockSize,
                textureKey
            )
            .setOrigin(0, 0)
            .setDisplaySize(blockSize, blockSize);
            ghostBlocks.push(block);
        } else {
            // fallback: rectangle if no textures are valid (preload issue)
            const block = scene.add.rectangle(
                x + pos.x * blockSize,
                y + pos.y * blockSize,
                blockSize, blockSize,
                0x00ff00
            ).setOrigin(0, 0);
            ghostBlocks.push(block);
        }
    });
    
    const minX = Math.min(...shape.map(p => p.x));
    const minY = Math.min(...shape.map(p => p.y));
    const maxX = Math.max(...shape.map(p => p.x));
    const maxY = Math.max(...shape.map(p => p.y));
    const width = (maxX - minX + 1) * blockSize;
    const height = (maxY - minY + 1) * blockSize;
    let lastValidX = x;
    let lastValidY = y;
    
    const dragRect = scene.add.rectangle(x, y, width, height, 0x000000, 0)
        .setOrigin(0, 0)
        .setInteractive();
    scene.input.setDraggable(dragRect);
    
    let dragOffsetX = 0, dragOffsetY = 0;
    
    // keep a stable reference for this stacko so overlap check can skip itself
    const stacko = { dragRect, ghostBlocks, shape, textureKey };
    scene.stackos.push(stacko);
    
    scene.input.on('dragstart', (pointer, obj) => {
        if (obj === dragRect) {
            dragOffsetX = pointer.x - dragRect.x;
            dragOffsetY = pointer.y - dragRect.y;
        }
    });
    
    scene.input.on('drag', (pointer, obj) => {
        if (obj === dragRect) {
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

            const overlapsGround = checkOverlapWithGround(scene, snapX, snapY, shape);
            const overlapsStacko = checkOverlapWithStackos(scene, stacko, snapX, snapY);
            
            if (overlapsGround || overlapsStacko) {
                dragRect.setPosition(lastValidX, lastValidY);
                ghostBlocks.forEach((gb, i) => {
                    gb.setPosition(
                        lastValidX + shape[i].x * blockSize,
                        lastValidY + shape[i].y * blockSize
                    );
                });
            } else {
                dragRect.setPosition(snapX, snapY);
                ghostBlocks.forEach((gb, i) => {
                    gb.setPosition(
                        snapX + shape[i].x * blockSize,
                        snapY + shape[i].y * blockSize
                    );
                });
                
                lastValidX = snapX;
                lastValidY = snapY;
            }
        }
    });
    
    return dragRect;
}

// helper to solidify a stacko (call this on play)
export function solidifyStacko(scene, stacko, shape) {
    const { dragRect, ghostBlocks } = stacko;
    let { textureKey } = stacko;
    const blockSize = scene.groundSize;
    const snapX = dragRect.x;
    const snapY = dragRect.y;
    
    // ensure we have a valid texture when solidifying
    if (!textureKey || !(scene.textures && scene.textures.exists(textureKey))) {
        textureKey = chooseStackoTexture(scene);
        if (!textureKey) {
            console.warn('[Stacko] Solidify fallback: no valid textures; skipping spawn.');
            return;
        }
    }

    dragRect.disableInteractive();
    ghostBlocks.forEach(gb => gb.destroy());
    dragRect.destroy();
    
    // Create physics-enabled sprites in the groundBlocks group with the same texture
    shape.forEach(pos => {
        const sprite = scene.groundBlocks.create(
            snapX + pos.x * blockSize,
            snapY + pos.y * blockSize,
            textureKey
        );
        
        sprite.setOrigin(0, 0);
        sprite.setDisplaySize(blockSize, blockSize);
        if (sprite.refreshBody) sprite.refreshBody();
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

function checkOverlapWithStackos(scene, currentStacko, snapX, snapY) {
    const blockSize = scene.groundSize;
    const { shape } = currentStacko;
    
    const myBlocks = shape.map(pos => ({
        x: snapX + pos.x * blockSize,
        y: snapY + pos.y * blockSize
    }));
    
    for (let other of scene.stackos) {
        if (other === currentStacko) continue;
        
        const { dragRect, shape: otherShape } = other;
        const ox = Math.round(dragRect.x / blockSize) * blockSize;
        const oy = Math.round(dragRect.y / blockSize) * blockSize;
        
        for (let pos of otherShape) {
            const bx = ox + pos.x * blockSize;
            const by = oy + pos.y * blockSize;
            
            for (let my of myBlocks) {
                if (my.x === bx && my.y === by) {
                    return true;
                }
            }
        }
    }
    
    return false;
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
    
    const chosenShapes = shuffled.slice(0, amount);
    
    let totalWidth = 0;
    const widths = [];
    chosenShapes.forEach(key => {
        const { width } = getShapeDimensions(Shapes[key], scene.groundSize);
        widths.push(width);
        totalWidth += width;
    });
    totalWidth += gap * (chosenShapes.length - 1);
    
    let currentX = centerX - totalWidth / 2;
    
    for (let i = 0; i < chosenShapes.length; i++) {
        const shape = Shapes[chosenShapes[i]];
        const width = widths[i];
        
        const uiShape = createShape(scene, currentX, startY, shape);
        scene.shapeUIs.push(uiShape);
        
        currentX += width + gap;
    }
}