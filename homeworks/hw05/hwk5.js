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
    // var ballMesh = MESH.createBallMesh(p);
    // UTILS.setPosition(ballMesh, p.ball.position);
    var ballGeometry = new THREE.SphereGeometry(5, 20, 20);
    var ballMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color('green'),
        specular: new THREE.Color(faceParams.specular),
        shininess: faceParams.shininess,
        side: THREE.BackSide
    });
    var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
    scene.add(ballMesh);
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

// Defines parameters
function Params() {
    var gray = 0xaaaaaa;
    var white = 0xffffff;

    var sideLength = 50;

    this.getBoundingBox = function() {
        return {
            minx: 0, maxx: sideLength,
            miny: 0, maxy: sideLength,
            minz: 0, maxz: sideLength
        };
    };

    // light configuration
    this.ambientOn = true;
    this.ambientLight = {
        on: true,
        color: gray
    };

    this.directionalOn = true;
    this.directionalLight = {
        on: true,
        color: white,
        intensity: 0.6,
        position: {
            x: sideLength * 0.6,
            y: sideLength * 0.9,
            z: sideLength
        }
    };
}

var UTILS = {
    setPosition: function(obj, position) {
        obj.position.set(position.x, position.y, position.z);
    },

    setRotation: function(obj, rotation) {
        obj.rotation.set(rotation.a, rotation.b, rotation.c);
    },

    // Builds a GUI which adjusts the parameters of the scene
    buildGui(scene, params, callback) {
        var gui = new dat.GUI();
        ['ambientOn', 'directionalOn'].map(function(key) {
            gui.add(params, key).onChange(function() { callback(key); });
        });
    }
};


// Defines light functions
var LIGHT = {
    // Adds an ambient light to the scene
    // params: lightParams should be object with color key
    // returns: ambientLight
    createAmbientLight: function(scene, lightParams) {
        var ambientLight = new THREE.AmbientLight(lightParams.color);
        scene.add(ambientLight);
        return ambientLight;
    },

    // Adds a directional light to the scene
    // params: lightParams is object with color / intensity / position keys
    // returns: directionalLight
    createDirectionalLight: function(scene, lightParams) {
        var directionalLight = new THREE.DirectionalLight(
            lightParams.color, lightParams.intensity);
        UTILS.setPosition(directionalLight, lightParams.position);
        scene.add(directionalLight);
        return directionalLight;
    }
};