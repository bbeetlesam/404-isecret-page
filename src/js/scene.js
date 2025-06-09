// Main Scene
import { GameState } from './gameState.js';

export class MainScene extends Phaser.Scene {
    constructor()
    {
        super("MainScene");
    }
    
    getSceneSize() {
        return {
            width: this.scale.width,
            height: this.scale.height
        };
    }
    
    // Load assets
    preload()
    {
        this.load.image("ground", "/img/superunknown.jpeg");
        this.load.svg({key: "tes", url: "./img/icon.svg", svgConfig: {width: 800, height: 800}});
    }
    
    // Create game objects
    create()
    {
        const sceneSize = this.getSceneSize();
        let width = sceneSize.width;
        let height = sceneSize.height;
        
        const text = this.add.text(10, -5, GameState.score.toString(), {
            fontSize: '85px',
            color: '#ffffff',
            fontFamily: 'Clear Sans',
            resolution: 0,
        });
        
        this.grounds = this.physics.add.staticGroup();
        
        for (let i = 0; i < width/60; i++) {
            for (let j = 0; j < height/60 - 13; j++) {
                const ground = this.grounds.create(i * 60, 60 * (13 + j), 'ground');
                ground.setDisplaySize(60, 60);
                ground.setOrigin(0, 0);
                ground.refreshBody();
            }
        }
        
        this.player = this.add.circle(100, 100, 35, 0xffffff);
        this.physics.add.existing(this.player);
        this.player.body.setBounce(0.4);
        
        this.physics.add.collider(this.player, this.grounds);
    }

    // Update game state per frame
    update(time, delta)
    {

    }
}