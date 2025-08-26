export function createRaycastBetween(scene, pos1, pos2, thickness = 10, onDetect = () => {}) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const ray = scene.add.rectangle(pos1.x, pos1.y, length, thickness, 0xff0000, 0.2)
        .setOrigin(0, 0.5)
        .setAngle(Phaser.Math.RadToDeg(angle));
    
    ray.raycastData = { pos1, pos2, thickness };
    
    scene.events.on('update', () => {
        const player = scene.player;
        if (!player) return;
        const px = player.x;
        const py = player.y;
        const { x: x1, y: y1 } = pos1;
        const { x: x2, y: y2 } = pos2;
        const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (length * length);
        if (t >= 0 && t <= 1) {
            const closestX = x1 + t * (x2 - x1);
            const closestY = y1 + t * (y2 - y1);
            const dist = Phaser.Math.Distance.Between(px, py, closestX, closestY);
            if (dist <= thickness / 2 + player.radius) {
                onDetect(ray, player);
            }
        }
    });
    
    return ray;
}