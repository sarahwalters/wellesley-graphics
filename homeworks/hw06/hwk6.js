var SHAPES, PARAMS, UTILS, LIGHTS;
function init() {
    // Before doing anything else, initialize global variables
    SHAPES = new Shapes();
    PARAMS = new Params();
    UTILS = new Utils();
    LIGHTS = new Lights();

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    TW.mainInit(renderer, scene);
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    var state = TW.cameraSetup(renderer,
                   scene,
                   PARAMS.getBoundingBox());
    light(scene);
    draw(scene);

    render();
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

function draw(scene) {
    var upHouse = new SHAPES.UpHouse(PARAMS.house.width);
    UTILS.setRotation(upHouse, {a: 0, b: -Math.PI / 2, c: 0});
    scene.add(upHouse);
};

function light(scene) {
    var ambient = LIGHTS.createAmbientLight(scene, PARAMS.ambientLight);
    scene.add(ambient);

    var directional = LIGHTS.createDirectionalLight(scene, PARAMS.directionalLight);
    scene.add(directional);
};
