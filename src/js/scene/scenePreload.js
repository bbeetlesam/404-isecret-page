// Import images so Vite bundles them. These imports resolve to URLs at runtime.
import groundImg from '../../assets/images/base-ground.png';
import playImg from '../../assets/images/play-button.png';
import skyImg from '../../assets/images/BG.png';
import mountain1Img from '../../assets/images/FG2.png';
import planetImg from '../../assets/images/PLANET.png';
import starsImg from '../../assets/images/STARS.png';
import mountain2Img from '../../assets/images/FG1.png';
import craterImg from '../../assets/images/FG3.png';
import baseGroundImg from '../../assets/images/base-ground.png';
import stacko1Img from '../../assets/images/block-1.png';
import stacko2Img from '../../assets/images/block-2.png';
import stacko3Img from '../../assets/images/block-3.png';
import stacko4Img from '../../assets/images/block-4.png';
import stacko5Img from '../../assets/images/block-5.png';

// Preload assets for the main scene
export function preloadMain(scene) {
    scene.load.image('ground', groundImg);
    scene.load.image('play', playImg);
    scene.load.image('sky', skyImg);
    scene.load.image('mountain1', mountain1Img);
    scene.load.image('planet', planetImg);
    scene.load.image('stars', starsImg);
    scene.load.image('mountain2', mountain2Img);
    scene.load.image('crater', craterImg);
    scene.load.image('car', './img/car.png');

    // base ground cover texture
    scene.load.image('baseGround', baseGroundImg);

    // stacko textures
    scene.load.image('stacko1', stacko1Img);
    scene.load.image('stacko2', stacko2Img);
    scene.load.image('stacko3', stacko3Img);
    scene.load.image('stacko4', stacko4Img);
    scene.load.image('stacko5', stacko5Img);
    scene.stackoTextures = ['stacko1', 'stacko2', 'stacko3', 'stacko4', 'stacko5'];
}
