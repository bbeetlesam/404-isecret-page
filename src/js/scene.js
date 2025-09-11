// Main Scene
import GameState from './gameState.js';
import Shapes from './shapes.js';
import { createRandomShapesCenter, solidifyStacko } from './shapeManager.js';
import { createRaycastBetween } from './raycastUtils.js';
import { triggerGameOver /*, restartGame*/ } from './gameOverManager.js';
// import { checkOverlapWithGround } from './utils.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        console.log("MainScene created");
    }
    
    quitGame() {
        GameState.isShown = false;
        GameState.resetStates();
        this.player.setPosition(50, this.groundSize * 11);
    }
    
    showGame(bool) {
        document.getElementById('game-id').style.display = bool ? 'block' : 'none';
    }
    
    preload() {
        this.load.image("ground", "/img/superunknown.jpeg");
        this.load.image("play", "/img/PLAYBUTTON.png");
        this.load.image("sky", "/img/BG.png");
        this.load.image("mountain1", "/img/FG2.png");
        this.load.image("planet", "/img/PLANET.png");
        this.load.image("stars", "/img/STARS.png");
        this.load.image("mountain2", "/img/FG1.png");
        this.load.image("crater", "/img/FG3.png");
        this.load.image("car", "/img/mobil.png");
    }
    
    create() {
        this.sceneSize = { width: this.scale.width, height: this.scale.height };
        this.grounds = this.physics.add.staticGroup();
        this.groundBlocks = this.physics.add.staticGroup();
        // this.cursor = this.input.keyboard.createCursorKeys();
        
        this.isGameOver = false;
        this.groundSize = 60;
        this.groundAmount = { x: this.sceneSize.width / this.groundSize, y: this.sceneSize.height / this.groundSize };
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
        
        this.playButton = this.add.image(this.sceneSize.width - 5, 2, "play")
            .setScale(0.2)
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true });
        
        // start the game when the play button is clicked
        this.playButton.on('pointerup', () => {
            GameState.isRunning = true;
            this.levelStartTime = this.time.now;
            
            // lock stackos and turn them blue
            if (this.stackos) {
                this.stackos.forEach(stacko => {
                    stacko.dragRect.disableInteractive();
                    stacko.ghostBlocks.forEach(gb => gb.setFillStyle(0x00ffff)); // turns to blue
                    solidifyStacko(this, stacko, stacko.shape);
                });
                this.stackos = [];
            }
        });
        
        for (let i = 0; i < this.sceneSize.height / this.groundSize - 12; i++) {
            for (let j = 0; j < this.sceneSize.width / this.groundSize; j++) {
                const isHole = this.holePositions.some(hole => hole.x === j && hole.y === i);
                if (isHole) continue;
                
                const ground = this.grounds.create(j * this.groundSize, this.groundSize * (12 + i), 'ground');
                ground.setDisplaySize(this.groundSize, this.groundSize);
                ground.setOrigin(0, 0);
                ground.refreshBody();
            }
        }
        
        this.sky = this.add.image(0, 0, 'sky').setOrigin(0, 0).setScrollFactor(0).setDepth(-6);
        this.mountain2 = this.add.image(0, 0, 'mountain2').setOrigin(0, 0).setScrollFactor(0).setDepth(-5);
        this.mountain1 = this.add.image(0, 0, 'mountain1').setOrigin(0, 0).setScrollFactor(0).setDepth(-4);
        this.crater = this.add.image(0, -20, 'crater').setOrigin(0, 0).setScrollFactor(0.2).setDepth(-3);
        this.stars = this.add.image(0, 0, 'stars').setDisplaySize(1100, 331).setOrigin(0, 0).setScrollFactor(0.2).setDepth(-2);
        this.planet = this.add.image(0, 0, 'planet').setOrigin(0, 0).setScrollFactor(0.4).setDepth(-1);
        
        const rayX = 1440;
        createRaycastBetween(this, { x: rayX, y: this.groundSize * 11 }, { x: rayX, y: this.groundSize * 13 }, 10, (ray, player) => {
            console.log('Player crossed the ray!');
            GameState.isWin = true;
        });
        
        // car falling physics
        this.player = this.physics.add.image(50, this.groundSize * 11, "car");
        this.player.setScale(0.2);
        this.player.body.setBounce(0.2);
        this.player.body.setAllowGravity(true);
        this.player.body.setCollideWorldBounds(true);
        this.player.setDrag(0.5);

        // Izinkan rotasi manual (Arcade Physics tidak mendukung rotasi fisika otomatis)
        this.player.setOrigin(0.5, 0.5);
        this.player.rotationSpeed = 0; // custom property untuk rotasi manual

        this.physics.add.collider(this.player, this.grounds, () => {
            // Saat menyentuh tanah, hentikan gerakan dan rotasi
            this.player.body.setVelocity(150, 0);
            this.player.body.setAngularVelocity(0);
            this.player.body.setAllowGravity(true);
            this.player.rotationSpeed = 0;
            
        });
        this.bridgeCollider = this.physics.add.collider(this.player, this.groundBlocks);

        this.blockColliders = [];
        this.groundBlocks.getChildren().forEach(block => {
            let c = this.physics.add.collider(this.player, block);
            this.blockColliders.push({ block, collider: c });
        });

        
        
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.sceneSize.width, this.sceneSize.height);
        
        this.physics.add.collider(this.player, this.grounds);
        
        // create random initial stackos
        createRandomShapesCenter(this, Shapes, 4,this.sceneSize.width / 2, 20, 30);
        
        this.levelTimeLimit = 10000; // 10 seconds
        this.isGameOver = false;
    }
    
    update(time, delta) {
        if (!this.isGameOver && GameState.isRunning) {
            const elapsed = this.time.now - this.levelStartTime;
            if (elapsed >= this.levelTimeLimit) {
                triggerGameOver(this, 'Kanjut Badag');
            }
        }
        

        
        this.showGame(GameState.isShown);
        if (!this.player || !this.player.body) return;
        
        if (GameState.isRunning) {
            this.player.body.setVelocityX(
                Phaser.Math.Clamp(this.player.body.velocity.x + this.movePower, -this.maxVelocityX, this.maxVelocityX)
            );

            if (this.player.body.velocity.y > 10) {
                this.player.rotationSpeed = 0.01; // kecepatan rotasi saat jatuh
            }

        } else {
            this.player.body.setVelocityX(0);
            this.player.rotationSpeed = 0;
        }

        this.player.rotation += this.player.rotationSpeed;
        
        if (this.ballIsEntering) {
            if (this.player.x >= 50) {
                this.player.body.setVelocity(0, 0);
                this.player.body.setAllowGravity(true);
                this.ballIsEntering = false;
                GameState.isRunning = false;
            }
        }
        
        if (GameState.isWin) {
            const startX = -100;
            const startY = this.groundSize * 11.55;
            
            this.player.setPosition(startX, startY);
            this.player.body.setVelocity(150, 0);
            this.player.body.setAllowGravity(false);
            
            GameState.addScore(1);
            this.scoreText.setText(`${GameState.score}`);
            

            if (this.groundBlocks) {
                this.groundBlocks.clear(true, true);
            }
            
            // create 3 new random shapes each new round
            createRandomShapesCenter(this, Shapes, 4,this.sceneSize.width / 2, 20, 30);
            
            GameState.isWin = false;
            this.levelStartTime = this.time.now;
            this.ballIsEntering = true;
        }
        
        const blockSize = this.groundSize;
        let hasBlockBelow = false;

        this.blockColliders.forEach(entry => {
            const block = entry.block;
            const withinX = Math.abs(block.x - this.player.x) < blockSize * 0.5;
            const belowY  = block.y >= this.player.y && block.y - this.player.y < blockSize;
        
            // aktifkan collider hanya untuk blok di bawah
            entry.collider.active = withinX && belowY;
        
            if (entry.collider.active) {
                hasBlockBelow = false;
            }
        });
        
        if (!hasBlockBelow) {
            // mobil jatuh mulus (kasih rotasi pelan biar kelihatan real)
            this.player.rotationSpeed = 0.0;
        } else {
            this.player.rotationSpeed = 0;
        }
        
    }
}