// Main Scene
import GameState from './gameState.js';
import Shapes from './shapes.js';

export class MainScene extends Phaser.Scene {
    constructor()
    {
        super("MainScene");
        console.log("MainScene created");
    }
    quitGame() {
        GameState.isShown = false;
        GameState.resetStates();
        // this.scene.stop("MainScene");
        this.player.setPosition(50, this.groundSize * 11);
    }
    showGame(bool) {
        if (bool) {
            document.getElementById('game-id').style.display = 'block';
        } else {
            document.getElementById('game-id').style.display = 'none';
        }
    }
    
    createShape(x, y, shape) {
        const blockSize = this.groundSize;
        const ghostBlocks = [];
        
        shape.forEach(pos => {
            const block = this.add.rectangle(
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
        
        const dragRect = this.add.rectangle(x, y, width, height, 0x000000, 0)
            .setOrigin(0, 0)
            .setInteractive();
        this.input.setDraggable(dragRect);
        
        let offsetX = 0, offsetY = 0;
        
        this.input.on('dragstart', (pointer, obj) => {
            if (obj === dragRect) {
                offsetX = pointer.x - dragRect.x;
                offsetY = pointer.y - dragRect.y;
            }
        });
        
        this.input.on('drag', (pointer, obj, dragX, dragY) => {
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
        
        this.input.on('dragend', (pointer, obj) => {
            if (obj === dragRect) {
                const finalX = dragRect.x;
                const finalY = dragRect.y;
                
                dragRect.destroy();
                ghostBlocks.forEach(gb => gb.destroy());
                
                if (!this.groundBlocks) {
                    this.groundBlocks = this.physics.add.staticGroup();
                }
                
                shape.forEach(pos => {
                    const block = this.groundBlocks.create(
                        finalX + pos.x * blockSize,
                        finalY + pos.y * blockSize,
                        null
                    );
                    
                    const graphics = this.add.rectangle(
                        finalX + pos.x * blockSize,
                        finalY + pos.y * blockSize,
                        blockSize, blockSize,
                        0x00ffff
                    ).setOrigin(0, 0)
                        .setStrokeStyle(2, 0x000000);
                    
                    block.setSize(blockSize, blockSize);
                    block.setOrigin(0, 0);
                    block.setDisplaySize(blockSize, blockSize);
                    block.refreshBody();
                });
                
                this.physics.add.collider(this.player, this.groundBlocks);
            }
        }); 
        
        return dragRect;

    } 

    createRandomShapes() {
        if (!this.shapeUIs) this.shapeUIs = [];
        this.shapeUIs.forEach(shape => shape.destroy());
        this.shapeUIs = [];
      
        const allShapeKeys = Object.keys(Shapes);
        const shuffled = Phaser.Utils.Array.Shuffle(allShapeKeys);
      
        for (let i = 0; i < 3; i++) {
          const shapeKey = shuffled[i];
          const shape = Shapes[shapeKey];
      
          const x = 100 + i * 200;
          const y = 0;
      
          const uiShape = this.createShape(x, y, shape);
          this.shapeUIs.push(uiShape);
        }
      } 
      
      triggerGameOver(reason = 'Game Over') {
        this.isGameOver = true;
        GameState.isRunning = false;
    
        const centerX = this.cameras.main.scrollX + this.sceneSize.width / 2;
        const centerY = this.sceneSize.height / 2;
    
        this.gameOverText = this.add.text(centerX, centerY - 50, reason, {
            fontSize: '64px',
            fontFamily: 'Clear Sans',
            color: '#f0635a'
        }).setOrigin(0.5);
    
        this.scoreText = this.add.text(centerX, centerY + 10, `Cina Super: ${GameState.score}`, {
            fontSize: '40px',
            fontFamily: 'Clear Sans',
            color: '#ffffff'
        }).setOrigin(0.5);
    
        this.restartButton = this.add.text(centerX, centerY + 80, 'Main Lagi', {
            fontSize: '32px',
            fontFamily: 'Clear Sans',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
        this.restartButton.on('pointerdown', () => {
            this.restartGame();
        });
    }
    
    
    restartGame() {
        // Reset semua variabel penting
        GameState.resetStates();
        GameState.isShown = true;
        GameState.score = 0;
    
        this.scene.restart(); // restart ulang scene dari awal
    }
    

    createRaycastBetween(pos1, pos2, thickness = 10, onDetect = () => {}) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Visual ray
        const ray = this.add.rectangle(pos1.x, pos1.y, length, thickness, 0xff0000, 0.2)
            .setOrigin(0, 0.5)
            .setAngle(Phaser.Math.RadToDeg(angle));
        
        // Store ray info for manual check
        ray.raycastData = { pos1, pos2, thickness };
        
        // In update, check for overlap
        this.events.on('update', () => {
            const player = this.player;
            if (!player) return;
            // Project player center onto the ray
            const px = player.x;
            const py = player.y;
            const { x: x1, y: y1 } = pos1;
            const { x: x2, y: y2 } = pos2;
            const t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (length * length);
            if (t >= 0 && t <= 1) {
                // Closest point on the ray
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
    
    // Load assets
    preload()
    {
        this.load.image("ground", "/img/superunknown.jpeg");
        this.load.image("play", "/img/play-button.png");
    }
    
    // Create game objects
    create()
    {
        
        this.sceneSize = {width: this.scale.width, height: this.scale.height};
        this.grounds = this.physics.add.staticGroup();
        this.cursor = this.input.keyboard.createCursorKeys();
        //this.createRandomShapes();
        this.isGameOver = false;

        this.groundSize = 60;
        this.groundAmount = {x: this.sceneSize.width/this.groundSize, y: this.sceneSize.height/this.groundSize};
        let holeStartPoint = Phaser.Math.Between(this.groundAmount.x / 2, this.groundAmount.x - 7);
        
        this.holePositions = [];
        for (let dx = 0; dx < 6; dx++) {
            for (let dy = 0; dy < 3; dy++) {
                this.holePositions.push({ x: holeStartPoint + dx, y: dy });
            }
        }
        
        this.maxVelocityX = 200;
        this.movePower = 7;
        
        this.scoreText = this.add.text(10, -5, `${GameState.score}`, {
            fontSize: '85px',
            fontFamily: 'Clear Sans',
            color: '#ffffff',
        });
        
        this.playButton = this.add.image(this.sceneSize.width - 5, 2, "play").setScale(2.5)
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
        
        this.playButton.on('pointerup', () => {
            GameState.isRunning = true;
            this.levelStartTime = this.time.now;
        });
        
        for (let i = 0; i < this.sceneSize.height/this.groundSize - 12; i++) { // 1080/60 = 18
            for (let j = 0; j < this.sceneSize.width/this.groundSize; j++) {
                const isHole = this.holePositions.some(hole => hole.x === j && hole.y === i);
                if (isHole) continue;
                
                const ground = this.grounds.create(j * this.groundSize, this.groundSize * (12 + i), 'ground');
                ground.setDisplaySize(this.groundSize, this.groundSize);
                ground.setOrigin(0, 0);
                ground.refreshBody();
            }
        }

        const rayX = 1440;
        this.createRaycastBetween({x: rayX, y: this.groundSize*11}, {x: rayX, y: this.groundSize*13}, 10, (ray, player) => {
            console.log('Player crossed the ray!');
            GameState.isWin = true;
        });
        
        this.player = this.add.circle(50, this.groundSize * 11, 50/2, 0xffffff);
        this.physics.add.existing(this.player);
        this.player.body.setCircle(this.player.radius, 0, 0);
        this.player.body.setBounce(0.5);
        this.player.body.setCollideWorldBounds(true);

        // Kamera mengikuti player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        // Batasi gerakan kamera agar tidak melewati dunia
        this.cameras.main.setBounds(0, 0, this.sceneSize.width, this.sceneSize.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.sceneSize.width, this.sceneSize.height);
        
        this.physics.add.collider(this.player, this.grounds);
        
        this.createShape(100, 0, Shapes.L);
        this.createShape(300, 0, Shapes.T);
        this.createShape(500, 0, Shapes.S);

        //Limit Waktu Game Over
        this.levelTimeLimit = 10000; // 10 detik
        this.isGameOver = false;

        
    }

    // Update game state each frame
    update(time, delta)
    {
        if (!this.isGameOver && GameState.isRunning) {
            const elapsed = this.time.now - this.levelStartTime;
        
            if (elapsed >= this.levelTimeLimit) {
                this.triggerGameOver('Kanjut Badag');
            }
        }
        
        
        this.showGame(GameState.isShown);
        if (!this.player || !this.player.body) return;
        
        if (GameState.isRunning) {
            this.player.body.setVelocityX(
                Phaser.Math.Clamp(this.player.body.velocity.x + this.movePower, -this.maxVelocityX, this.maxVelocityX)
            );
            
        }
        
        else {
            this.player.body.setVelocityX(0);
        }

        if (this.ballIsEntering) {
            if (this.player.x >= 50) {
                this.player.body.setVelocity(0, 0);
                this.player.body.setAllowGravity(true); // aktifkan gravitasi kembali
                this.ballIsEntering = false;
                GameState.isRunning = false; // tunggu klik play lagi
            }
        }

        if (GameState.isWin) {
            const startX = -100;
            const startY = this.groundSize * 11.55;

            this.player.setPosition(startX, startY);
            this.player.body.setVelocity(150, 0); // bergerak horizontal
            this.player.body.setAllowGravity(false); // cegah jatuh dari atas

            GameState.addScore(1);
            this.scoreText.setText(`${GameState.score}`);

            GameState.isWin = false;
            this.levelStartTime = this.time.now; // ⏱️ reset waktu saat lanjut level

            // Tambahkan flag bahwa bola sedang masuk
            this.ballIsEntering = true;

            this.createRandomShapes();
        }
        
    }
}