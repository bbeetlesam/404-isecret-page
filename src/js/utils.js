export function checkOverlapWithGround(scene, x, y, shape) {
    const blockSize = scene.groundSize;
    for (const pos of shape) {
        const bx = x + pos.x * blockSize;
        const by = y + pos.y * blockSize;
        const bounds1 = new Phaser.Geom.Rectangle(bx, by, blockSize, blockSize);
        
        const overlapping = scene.groundBlocks.getChildren().some(child => {
            const bounds2 = child.getBounds();
            return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);
        });
        
        if (overlapping) {
            return true;
        }
    }
    
    const overlappingGround = scene.grounds.getChildren().some(ground => {
        const bounds1 = new Phaser.Geom.Rectangle(x + pos.x * blockSize, y + pos.y * blockSize, blockSize, blockSize);
        const bounds2 = ground.getBounds();
        return Phaser.Geom.Intersects.RectangleToRectangle(bounds1, bounds2);
    });
    
    if (overlappingGround) {
        return true;
    }
    
    return false;
}