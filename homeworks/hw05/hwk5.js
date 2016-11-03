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

var MESH = {
    // Creates a barn mesh with material dependent on params.mode.
    // Origin is front bottom left corner of one of the pentagonal faces.
    createBarnMesh: function(params) {
        var barnGeometry = TW.createBarn(params.barnDimensions.width,
                                         params.barnDimensions.height,
                                         params.barnDimensions.length);
        UTILS.addTextureCoords(barnGeometry);
        var barnMaterial = (params.mode == "showResult") ?
                            UTILS.createTextureMaterial(barnGeometry, params) :
                            UTILS.createPlainMaterial();
        return new THREE.Mesh(barnGeometry, barnMaterial);
    }
};

// Defines parameters
function Params() {
    var gray = 0xaaaaaa;
    var white = 0xffffff;

    var barnWidth = 40;
    var barnHeight = 25;
    var barnLength = 100;

    this.getBoundingBox = function() {
        return {
            minx: 0, maxx: barnWidth,
            miny: 0, maxy: barnHeight,
            minz: -barnLength, maxz: 0
        };
    };

    this.barnDimensions = {
        width: barnWidth,
        height: barnHeight,
        length: barnLength
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
            x: barnWidth / 2,
            y: barnHeight * 1.5,
            z: 50
        }
    };

    // textureIndices[i] is n, where n is an index into texturePaths
    this.textureIndices = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
    this.texturePaths = ['textures/barnSiding.jpg', 'textures/barnRoofing.jpg'];
    this.triangularFaces = [2, 5]; // indices of non-quad triangular faces

    this.mode = 'showLighting';
}

var UTILS = {
    setPosition: function(obj, position) {
        obj.position.set(position.x, position.y, position.z);
    },

    setRotation: function(obj, rotation) {
        obj.rotation.set(rotation.a, rotation.b, rotation.c);
    },

    addTextureCoords: function(barnGeom) {
        if (!barnGeom instanceof THREE.Geometry) {
            throw "not a THREE.Geometry: " + barnGeom;
        }

        // array of face descriptors
        var UVs = [];
        function faceCoords(as,at, bs,bt, cs,ct) {
            UVs.push( [ new THREE.Vector2(as,at),
                        new THREE.Vector2(bs,bt),
                        new THREE.Vector2(cs,ct)] );
        }

        // front
        faceCoords(0,0, 1,0, 1,1);
        faceCoords(0,0, 1,1, 0,1);
        faceCoords(0,1, 1,1, 1,1);  // special for the upper triangle
        // back.  Vertices are not quite analogous to the front, alas
        faceCoords(1,0, 0,1, 0,0);
        faceCoords(1,0, 1,1, 0,1);
        faceCoords(0,1, 1,1, 1,1);  // special for upper triangle
        //roof
        faceCoords(1,0, 1,1, 0,0);
        faceCoords(1,1, 0,1, 0,0);
        faceCoords(0,0, 1,0, 1,1);
        faceCoords(0,1, 0,0, 1,1);
        // sides
        faceCoords(1,0, 0,1, 0,0);
        faceCoords(1,1, 0,1, 1,0);
        faceCoords(1,0, 1,1, 0,0);
        faceCoords(1,1, 0,1, 0,0);
        // floor
        faceCoords(0,0, 1,0, 0,1);
        faceCoords(1,0, 1,1, 0,1);

        // Finally, attach this to the geometry
        barnGeom.faceVertexUvs = [UVs];
    },

    createTextureMaterial: function(barnGeom, params) {
        var mats = barnGeom.faces.map(function(face, i) {
            face.materialIndex = i;
            var textureIndex = params.textureIndices[i];

            if (params.triangularFaces.indexOf(i) > -1) {
                var uv = barnGeom.faceVertexUvs[0][i];
                uv[0].y = 1 - uv[0].y;
                uv[1].y = 1 - uv[1].y;
            }

            var material = new THREE.MeshPhongMaterial();
            material.map = params.textures[textureIndex];
            return material;
        });

        return new THREE.MeshFaceMaterial(mats);
    },

    createPlainMaterial: function() {
        return new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            specular: 'white',
            shininess: 0
        });
    },

    // Builds a GUI which adjusts the parameters of the scene
    buildGui: function(scene, params, lightCallback, modeCallback) {
        var gui = new dat.GUI();

        // lights
        ['ambientOn', 'directionalOn'].map(function(key) {
            gui.add(params, key).onChange(function() { lightCallback(key); });
        });

        // mode
        gui.add(params, 'mode', ['showLighting', 'showResult']).onChange(function() { modeCallback(); });
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
