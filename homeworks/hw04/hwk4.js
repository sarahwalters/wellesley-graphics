// Configures the scene and calls the draw function
function init() {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    TW.mainInit(renderer, scene);
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    var params = new Params();
    var state = TW.cameraSetup(renderer,
                   scene,
                   params.getBoundingBox());
    draw(scene, params);
    var lights = light(scene, params);

    UTILS.buildGui(scene, params, function(key) {
        lights[key].map(function(light) {
            light.visible = params[key];
        });
    });

    render();
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

// Draws the scene
function draw(scene, p) {
    var ballMesh = MESH.createBallMesh(p);
    UTILS.setPosition(ballMesh, p.ball.position);
    scene.add(ballMesh);

    var roomMesh = MESH.createRoomMesh(p);
    scene.add(roomMesh);

    var sconceMesh = MESH.createSconceMesh(p);
    UTILS.setPosition(sconceMesh, p.sconce.position);
    scene.add(sconceMesh);
}

// Lights the scene
// Returns a map from dat.gui control id to the list of lights the id controls
function light(scene, p) {
    var ambient = LIGHT.createAmbientLight(scene, p.ambientLight);
    var directional = LIGHT.createDirectionalLight(scene, p.directionalLight);
    var spotTop = LIGHT.createSpotLight(scene, p.sconceLights.top);
    var spotBottom = LIGHT.createSpotLight(scene, p.sconceLights.bottom);

    return {
        ambientOn: [ambient],
        directionalOn: [directional],
        spotlightOn: [spotTop, spotBottom]
    };
}
