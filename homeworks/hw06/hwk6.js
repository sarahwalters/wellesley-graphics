function init() {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    TW.mainInit(renderer, scene);
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    var state = TW.cameraSetup(renderer,
                   scene,
                   PARAMS.getBoundingBox());
    light(scene);
    TW.loadTextures(PARAMS.texturePaths, function(textures) {
        PARAMS.textures = textures;
        PARAMS.textures.map(function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3,2);
        });
        draw(scene);
    });

    render();
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

function draw(scene) {
    //var background = new SHAPES.Background(PARAMS.textures[0]);
    //scene.add(background);
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
