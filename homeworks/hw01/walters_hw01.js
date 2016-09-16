// Configures the scene and calls the draw function
function init() {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    TW.mainInit(renderer,scene);

    var params = {
        baseWidth: 55,
        pyramidWidth: 34,
        pyramidHeight: 55,
        totalHeight: 555
    };

    var boundingBox = draw(scene, params);

    TW.cameraSetup(renderer,
               scene,
               boundingBox);

    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);
}

// Draws a scene and returns a bounding box which encloses it
function draw(scene, params) {
    var obeliskGeometry = createObeliskGeometry(params);
    var obeliskMesh = TW.createMesh(obeliskGeometry);

    var barnGeometry = TW.createBarn( params.barnWidth, params.barnHeight, params.barnDepth );
    var barnMesh = TW.createMesh( barnGeometry );

    scene.add(obeliskMesh);

    return {
        minx: params.baseWidth, maxx: params.baseWidth,
        miny: 0, maxy: params.totalHeight,
        minz: -params.baseWidth, maxz: params.baseWidth
    };
}

function createObeliskGeometry(params) {

    var obeliskGeometry = new THREE.Geometry();

    var halfBaseWidth = params.baseWidth/2;
    var halfPyramidWidth = params.pyramidWidth/2;
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
        [0, 4, 5],
        [5, 1, 0],

        [1, 5, 6],
        [6, 2, 1],

        [2, 6, 7],
        [7, 3, 2],

        [3, 7, 4],
        [4, 0, 3],

        [4, 8, 5],
        [5, 8, 6],
        [6, 8, 7],
        [7, 8, 4]
    ];

    faces.map(function(face) {
        obeliskGeometry.faces.push(new THREE.Face3(...face));
    });

    obeliskGeometry.computeFaceNormals();

    return obeliskGeometry;
}