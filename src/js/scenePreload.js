// Preload assets for the main scene
export function preloadMain(scene) {
    scene.load.image("ground", "/img/superunknown.jpeg");
    scene.load.image("play", "/img/play-button.png");
    scene.load.image("sky", "/img/BG.png");
    scene.load.image("mountain1", "/img/FG2.png");
    scene.load.image("planet", "/img/PLANET.png");
    scene.load.image("stars", "/img/STARS.png");
    scene.load.image("mountain2", "/img/FG1.png");
    scene.load.image("crater", "/img/FG3.png");
    scene.load.image("car", "/img/mobil.png");

    // base ground cover texture
    scene.load.image("baseGround", "/img/base-ground.png");

    // stacko textures
    scene.load.image('stacko1', '/img/block-1.png');
    scene.load.image('stacko2', '/img/block-2.png');
    scene.load.image('stacko3', '/img/block-3.png');
    scene.load.image('stacko4', '/img/block-4.png');
    scene.load.image('stacko5', '/img/block-5.png');
    scene.stackoTextures = ['stacko1', 'stacko2', 'stacko3', 'stacko4', 'stacko5'];
}
