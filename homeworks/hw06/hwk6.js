function init() {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    TW.mainInit(renderer, scene);
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    var shapes = new Shapes();
    var params = new Params();
    var state = TW.cameraSetup(renderer,
                   scene,
                   params.getBoundingBox());
    light(scene, params);
    draw(scene, params, shapes);

    render();
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

function draw(scene, params, shapes) {
    var balloonCloud = new shapes.BalloonCloud(params);
    scene.add(balloonCloud);
};

function light(scene, p) {
    var ambient = LIGHT.createAmbientLight(scene, p.ambientLight);
    scene.add(ambient);

    var directional = LIGHT.createDirectionalLight(scene, p.directionalLight);
    scene.add(directional);
};