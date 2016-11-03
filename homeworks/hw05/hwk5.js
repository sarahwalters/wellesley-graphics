// Configures the scene and calls the draw function
function init() {
    // Set up a scene with a white background
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Set up a renderer and attach it to the DOM
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    TW.mainInit(renderer, scene);
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    // Set up scene parameters
    var params = new Params();

    // Set up camera
    var state = TW.cameraSetup(renderer,
                   scene,
                   params.getBoundingBox());

    // Load the textures attach them to the params object, then draw the scene
    TW.loadTextures(params.texturePaths, function(textures) {
        params.textures = textures;
        params.textures.map(function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3,2);
        });
        draw(scene, params);
    });

    // Light the scene
    var lights = light(scene, params);

    // Build a DAT.gui to control the scene
    var lightCallback = function(key) {
        lights[key].map(function(light) {
            light.visible = params[key];
        });
    };
    var modeCallback = function() {
        draw(scene, params);
    };
    UTILS.buildGui(scene, params, lightCallback, modeCallback);

    // Establish the render loop
    render();
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

// Draws the scene
function draw(scene, params) {
    var barnMesh = MESH.createBarnMesh(params);
    barnMesh.name = 'barnMesh';
    scene.remove(scene.getObjectByName('barnMesh')); // remove any existing barn mesh
    scene.add(barnMesh);
}

// Lights the scene
// Returns a map from dat.gui control id to the list of lights the id controls
function light(scene, p) {
    var ambient = LIGHT.createAmbientLight(scene, p.ambientLight);
    var directional = LIGHT.createDirectionalLight(scene, p.directionalLight);

    return {
        ambientOn: [ambient],
        directionalOn: [directional]
    };
}
