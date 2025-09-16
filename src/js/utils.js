// returns true if any block of the shape at (snapX, snapY) occupies
// a grid cell already taken by scene.grounds or scene.groundBlocks.
// uses grid equality instead of rectangle intersections, so "holes" are allowed.
export function checkOverlapWithGround(scene, snapX, snapY, shape) {
    const blockSize = scene.groundSize;
    const key = (gx, gy) => `${gx},${gy}`;
    
    // build a set of occupied grid cells from grounds and solidified blocks
    const occupied = new Set();
    
    if (scene.grounds) {
        scene.grounds.getChildren().forEach(ground => {
            // all these are placed on the grid with origin (0, 0)
            const gx = Math.round(ground.x / blockSize);
            const gy = Math.round(ground.y / blockSize);
            occupied.add(key(gx, gy));
        });
    }
    
    if (scene.groundBlocks) {
        scene.groundBlocks.getChildren().forEach(child => {
            // solidified blocks and their visuals are also aligned to the grid
            const gx = Math.round(child.x / blockSize);
            const gy = Math.round(child.y / blockSize);
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