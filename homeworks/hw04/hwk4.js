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
function draw(scene, params) {
    var ballMesh = MESH.createBallMesh(params);
    UTILS.setPosition(ballMesh, params.ball.position);
    scene.add(ballMesh);

    var roomMesh = MESH.createRoomMesh(params);
    scene.add(roomMesh);

    var sconceMesh = MESH.createSconceMesh(params);
    UTILS.setPosition(sconceMesh, params.sconce.position);
    scene.add(sconceMesh);
}

// Lights the scene
// Returns a map from dat.gui control id to the list of lights the id controls
function light(scene, params) {
    var ambientLight = LIGHT.createAmbientLight(scene, params.ambientLight);
    var directionalLight = LIGHT.createDirectionalLight(scene, params.directionalLight);
    var spotLightTop = LIGHT.createSpotLight(scene, params.sconceLights.top);
    var spotLightBottom = LIGHT.createSpotLight(scene, params.sconceLights.bottom);

    return {
        ambientOn: [ambientLight],
        directionalOn: [directionalLight],
        spotlightOn: [spotLightTop, spotLightBottom]
    };
}
