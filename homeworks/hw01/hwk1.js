// Defines a parameters object which configures the scene
function Params() {
    this.baseWidth = 55;
    this.pyramidWidth = 34;
    this.pyramidHeight = 55;
    this.totalHeight = 555;

    // Colors written in different formats to demonstrate RGB/hex understanding
    this.colors = [
        'rgb(255,215,179)', // light orange
        'rgb(249, 150, 131)', // coral pink
        'rgb(206, 50, 89)', // cherry red
        'rgb(74, 102, 124)', // slate grey
        0xff983d, // darker version of light orange
        0xf65b3c, // darker version of coral pink
        0x87213a, // darker version of cherry red
        0x304250 // darker version of slate grey
    ];

    this.getBoundingBox = function() {
        var maxWidth = Math.max(this.baseWidth, this.pyramidWidth);
        return {
            minx: -maxWidth / 2, maxx: maxWidth / 2,
            miny: 0, maxy: this.totalHeight,
            minz: -maxWidth / 2, maxz: maxWidth / 2
        };
    };
}

// Builds a GUI which adjusts the parameters of the scene
function buildGui(scene, params, callback) {
    var gui = new dat.GUI();
    gui.add(params, 'baseWidth', 0, 500).onChange(callback);
    gui.add(params, 'pyramidWidth', 0, 500).onChange(callback);
    gui.add(params, 'pyramidHeight', 0, 500).onChange(callback);
    gui.add(params, 'totalHeight', 0, 1000).onChange(callback);
}


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
    var obeliskMesh = draw(scene, params);

    buildGui(scene, params, function() {
        // force bounding box to be off while resizing obelisk
        state.sceneBoundingBoxHelper.visible = false;

        // remove and redraw the obelisk
        scene.remove(obeliskMesh);
        obeliskMesh = draw(scene, params);

        // set up the camera again, with the new bounding box
        state = TW.cameraSetup(renderer,
                   scene,
                   params.getBoundingBox());
    });

    render();
    function render() {
        requestAnimationFrame(render);
        state.render();
    }
}


// Draws the scene; returns the obelisk mesh
function draw(scene, params) {
    var obeliskGeometry = createObeliskGeometry(params);
    var obeliskMaterial = createObeliskMaterial(params);
    var obeliskMesh = new THREE.Mesh(obeliskGeometry, obeliskMaterial);

    scene.add(obeliskMesh);
    return obeliskMesh;
}


// Creates a geometry for the obelisk
function createObeliskGeometry(params) {
    var obeliskGeometry = new THREE.Geometry();

    var halfBaseWidth = params.baseWidth / 2;
    var halfPyramidWidth = params.pyramidWidth / 2;
    var shaftHeight = params.totalHeight - params.pyramidHeight;
    var totalHeight = params.totalHeight;

    var vertices = [
        // base of the obelisk
        [-halfBaseWidth, 0, -halfBaseWidth],
        [halfBaseWidth, 0, -halfBaseWidth],
        [halfBaseWidth, 0, halfBaseWidth],
        [-halfBaseWidth, 0, halfBaseWidth],

        // base of the pyramid
        [-halfPyramidWidth, shaftHeight, -halfPyramidWidth],
        [halfPyramidWidth, shaftHeight, -halfPyramidWidth],
        [halfPyramidWidth, shaftHeight, halfPyramidWidth],
        [-halfPyramidWidth, shaftHeight, halfPyramidWidth],

        // tip of the pyramid
        [0, totalHeight, 0]
    ];

    vertices.map(function(vertex) {
        obeliskGeometry.vertices.push(new THREE.Vector3(...vertex));
    });

    var faces = [
        // first wall of obelisk shaft
        [0, 4, 5],
        [5, 1, 0],

        // second wall of obelisk shaft
        [1, 5, 6],
        [6, 2, 1],

        // third wall of obelisk shaft
        [2, 6, 7],
        [7, 3, 2],

        // fourth wall of obelisk shaft
        [3, 7, 4],
        [4, 0, 3],

        // pyramid at top of obelisk
        [4, 8, 5],
        [5, 8, 6],
        [6, 8, 7],
        [7, 8, 4]
    ];

    // each wall of the obelisk shaft is a single color
    // the four faces of the pyramid at the top are different colors
    var materialIndices = [0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7];

    faces.map(function(face, index) {
        var threeFace = new THREE.Face3(...face);
        threeFace.materialIndex = materialIndices[index];
        obeliskGeometry.faces.push(threeFace);
    });

    obeliskGeometry.computeFaceNormals();
    return obeliskGeometry;
}


// Creates a face material for the obelisk
function createObeliskMaterial(params) {
    var materials = params.colors.map(function(color) {
        return new THREE.MeshBasicMaterial({color: new THREE.Color(color)});
    });

    return new THREE.MeshFaceMaterial(materials);
}
