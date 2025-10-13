// returns true if any block of the shape at (snapX, snapY) occupies
// a grid cell already taken by scene.grounds or scene.groundBlocks.
// uses grid equality instead of rectangle intersections, so "holes" are allowed.
export function checkOverlapWithGround(scene, snapX, snapY, shape) {
    const blockSize = scene.groundSize;
    const key = (gx, gy) => `${gx},${gy}`;
    
    // build a set of occupied grid cells from grounds and solidified blocks
    const occupied = new Set();
    
    if (scene.grounds) {
        const groundsChildren = typeof scene.grounds.getChildren === 'function'
            ? scene.grounds.getChildren()
            : Array.isArray(scene.grounds) ? scene.grounds : [];

        groundsChildren.forEach(ground => {
            const gx = Math.round((ground.x ?? (ground.sprite && ground.sprite.x) ?? 0) / blockSize);
            const gy = Math.round((ground.y ?? (ground.sprite && ground.sprite.y) ?? 0) / blockSize);
            occupied.add(key(gx, gy));
        });
    }
    
    if (scene.groundBlocks) {
        const blocksChildren = typeof scene.groundBlocks.getChildren === 'function'
            ? scene.groundBlocks.getChildren()
            : Array.isArray(scene.groundBlocks) ? scene.groundBlocks : [];

        blocksChildren.forEach(child => {
            const gx = Math.round((child.x ?? (child.sprite && child.sprite.x) ?? 0) / blockSize);
            const gy = Math.round((child.y ?? (child.sprite && child.sprite.y) ?? 0) / blockSize);
            occupied.add(key(gx, gy));
        });
    }
    
    // test each cell of the shape at the snapped drop position
    for (const pos of shape) {
        const bx = snapX + pos.x * blockSize;
        const by = snapY + pos.y * blockSize;
        const gx = Math.round(bx / blockSize);
        const gy = Math.round(by / blockSize);
        
        if (occupied.has(key(gx, gy))) {
            return true; // overlaps ground or solidified block
        }
    }
    
    return false; // all cells are free, holes are allowed
}

// Place these helper functions near the top of the file (outside the class) or in a utils section
function drawDashedLine(g, x1, y1, x2, y2, dashLen = 10, gapLen = 6) {
    const horizontal = y1 === y2;
    const vertical = x1 === x2;
    if (!horizontal && !vertical) {
        g.lineBetween(x1, y1, x2, y2);
        return;
    }
    const len = horizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1);
    const sign = horizontal ? Math.sign(x2 - x1) : Math.sign(y2 - y1);
    let pos = 0;
    while (pos < len) {
        const seg = Math.min(dashLen, len - pos);
        const s = pos;
        const e = pos + seg;
        if (horizontal) {
            g.lineBetween(x1 + sign * s, y1, x1 + sign * e, y1);
        } else {
            g.lineBetween(x1, y1 + sign * s, x1, y1 + sign * e);
        }
        pos += dashLen + gapLen;
    }
}

export function drawHoleOutlines(scene, holePositions, groundTopRow, blockSize) {
    if (!holePositions || !holePositions.length) return;
    
    if (scene.holeGraphics) scene.holeGraphics.destroy();
    
    // Normalize hole positions so y is an absolute grid row (12..17),
    // regardless of whether incoming y is relative (0..5) or absolute.
    const normalized = holePositions.map(({ x, y }) => ({
        x,
        y: (y >= groundTopRow ? y : groundTopRow + y)
    }));
    
    const holesSet = new Set(normalized.map(h => `${h.x},${h.y}`));
    const isEdge = (x, y) => !holesSet.has(`${x},${y}`);
    
    const g = scene.add.graphics().setDepth(-0.25); // above base_ground, below player
    g.lineStyle(4, 0xffffff, 1);
    
    for (const h of normalized) {
        const px = h.x * blockSize;
        const py = h.y * blockSize;
        
        // Draw only external edges to avoid double lines between adjacent hole tiles
        if (isEdge(h.x, h.y - 1)) drawDashedLine(g, px, px === px ? py : py, px + blockSize, py);                 // top
        if (isEdge(h.x + 1, h.y)) drawDashedLine(g, px + blockSize, py, px + blockSize, py + blockSize);           // right
        if (isEdge(h.x, h.y + 1)) drawDashedLine(g, px + blockSize, py + blockSize, px, py + blockSize);           // bottom
        if (isEdge(h.x - 1, h.y)) drawDashedLine(g, px, py + blockSize, px, py);                                   // left
    }
    
    scene.holeGraphics = g;
}