// Main Scene
import { preloadMain } from './scenePreload.js';
import { createMain } from './sceneCreate.js';
import { updateMain } from './sceneUpdate.js';
import GameState from '../gameState.js';
import { rebuildGroundAndHole } from '../groundBuilder.js';

export class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        console.log("MainScene created");
    }

    quitGame() {
        GameState.isShown = false;
        GameState.resetStates();
        if (this.player && this.groundSize) this.player.setPosition(50, this.groundSize * 11);
    }

    showGame(bool) {
        const el = document.getElementById('game-id');
        if (el) el.style.display = bool ? 'block' : 'none';
    }

    preload() {
        preloadMain(this);
    }

    create() {
        createMain(this);
    }

    update(time, delta) {
        updateMain(this, time, delta);
    }

    // keep compatibility for other modules that expected this method on the scene
    rebuildGroundAndHole() {
        rebuildGroundAndHole(this);
    }
}