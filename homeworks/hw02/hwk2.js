function Params() {
    this.numSegments = 20;

    // leg
    this.footRadius = 5;
    this.legRadius = 1.5;
    this.legLength = 30;
    this.legColor = "rgb(150,0,0)";
    this.footColor = "rgb(0,0,0)";

    // arm
    this.handRadius = 5;
    this.armRadius = 1.5;
    this.armLength = 30;
    this.shoulderRadius = 5;
    this.armColor = "rgb(150,0,0)";
    this.handColor = "rgb(255,255,255)";
    this.shoulderColor = "rgb(0,0,0)";

    // head
    this.headRadius = 15;
    this.headColor = "rgb(255,224,189)";

    // body
    this.bodyDiameter = 30;
    this.bodyHeight = 50;
    this.bodyColor = "rgb(75,75,75)";

    // hat
    this.hatBrimRadius = 25;
    this.hatBrimThickness = 1;
    this.hatBottomRadius = 10;
    this.hatTopRadius = 20;
    this.hatHeight = 20;
    this.hatBrimColor = "rgb(100,0,0)";
    this.hatTopColor = "rgb(150,0,0)";

    this.originInBoundingBox = true; // when true, clown moves relative to axes; when false, axes move relative to clown
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // position
    this.getTransforms = function() {
        return {x: this.x, y: this.y, z: this.z, a: 0, b: 0, c: 0};
    };

    this.getBoundingBox = function() {
        var maxWidth = 2 * this.armLength + this.bodyDiameter;
        var totalHeight = this.legLength + this.bodyHeight + 2 * this.headRadius + this.hatHeight;

        var offsetMultiplier = this.originInBoundingBox ? 0 : 1; // only add the offsets if the origin shouldn't be in the bounding box
        var xOffset = this.x * offsetMultiplier;
        var yOffset = this.y * offsetMultiplier;
        var zOffset = this.z * offsetMultiplier;

        return {
            minx: xOffset - maxWidth / 2, maxx: xOffset + maxWidth / 2,
            miny: yOffset, maxy: yOffset + totalHeight,
            minz: zOffset - maxWidth / 2, maxz: zOffset + maxWidth / 2
        };
    };
}

// Builds a GUI which adjusts the parameters of the scene
function buildGui(scene, params, callback) {
    var gui = new dat.GUI();

    var _addToGui = function(field, folder, min=0.1) {
        folder.add(params, field[0], min, field[1]).onChange(callback);
    };

    var mainFolder = gui.addFolder("Head and body");
    [
        ['headRadius', 40],
        ['bodyDiameter', 50],
        ['bodyHeight', 100]
    ].map(function(field) { _addToGui(field, mainFolder); });

    var legFolder = gui.addFolder("Legs and feet");
    [
        ['footRadius', 10],
        ['legRadius', 3],
        ['legLength', 50]
    ].map(function(field) { _addToGui(field, legFolder); });

    var armFolder = gui.addFolder("Arms and hands");
    [
        ['handRadius', 10],
        ['armRadius', 3],
        ['armLength', 50],
        ['shoulderRadius', 10]
    ].map(function(field) { _addToGui(field, armFolder); });

    var hatFolder = gui.addFolder("Hat");
    [
        ['hatBrimRadius', 40],
        ['hatBrimThickness', 3],
        ['hatBottomRadius', 50],
        ['hatTopRadius', 60],
        ['hatHeight', 50]
    ].map(function(field) { _addToGui(field, hatFolder); });

    var positionBound = 20;
    var positionFolder = gui.addFolder("Position");
    [
        ['originInBoundingBox', true],
        ['x', positionBound],
        ['y', positionBound],
        ['z', positionBound]
    ].map(function(field) { _addToGui(field, positionFolder, min = -positionBound); });
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
    var clownMesh = draw(scene, params);

    buildGui(scene, params, function() {
        // force bounding box to be off while resizing obelisk
        state.sceneBoundingBoxHelper.visible = false;

        // remove and redraw the clown
        scene.remove(clownMesh);
        clownMesh = draw(scene, params);

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
    var clownMesh = new ClownMesh(params);
    scene.add(clownMesh);
    return clownMesh;
}

function ClownMesh(params) {
    var material = createMaterial("red");
    var blue = new THREE.MeshBasicMaterial({color: new THREE.Color("blue")});

    var _createLegMesh = function(transforms) {
        // Origin is at center of top of leg; leg points down towards foot along negative y axis.
        var resultMesh = new THREE.Object3D();

        var footGeometry = new THREE.SphereGeometry(params.footRadius, params.numSegments, params.numSegments, 0, Math.PI * 2, 0, Math.PI / 2);
        var footMesh = new THREE.Mesh(footGeometry, createMaterial(params.footColor));
        footMesh.position.set(0, -params.legLength, 0);
        resultMesh.add(footMesh);

        var legGeometry = new THREE.CylinderGeometry(params.legRadius, params.legRadius, params.legLength);
        var legMesh = new THREE.Mesh(legGeometry, createMaterial(params.legColor));
        legMesh.position.set(0, -params.legLength / 2, 0);
        resultMesh.add(legMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createArmMesh = function(transforms) {
        // Origin is at center of shoulder; arm points down towards hand along negative y axis.
        var resultMesh = new THREE.Object3D();

        var handGeometry = new THREE.SphereGeometry(params.handRadius, params.numSegments, params.numSegments);
        var handMesh = new THREE.Mesh(handGeometry, createMaterial(params.handColor));
        handMesh.position.set(0, -params.armLength, 0);
        resultMesh.add(handMesh);

        var armGeometry = new THREE.CylinderGeometry(params.armRadius, params.armRadius, params.armLength);
        var armMesh = new THREE.Mesh(armGeometry, createMaterial(params.armColor));
        armMesh.position.set(0, -params.armLength / 2, 0);
        resultMesh.add(armMesh);

        var shoulderGeometry = new THREE.SphereGeometry(params.shoulderRadius, params.numSegments, params.numSegments);
        var shoulderMesh = new THREE.Mesh(shoulderGeometry, createMaterial(params.shoulderColor));
        resultMesh.add(shoulderMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createHeadMesh = function(transforms) {
        // Origin is at bottom of head; positive y axis points up through head. Face symmetrical across yz plane.
        var resultMesh = new THREE.Object3D();

        var headGeometry = new THREE.SphereGeometry(params.headRadius, params.numSegments, params.numSegments);
        var headMesh = new THREE.Mesh(headGeometry, createMaterial(params.headColor));
        headMesh.position.set(0, params.headRadius, 0);
        resultMesh.add(headMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createBodyMesh = function(transforms) {
        // Origin is at center of body; positive y axis points up towards neck.
        var resultMesh = new THREE.Object3D();

        var bodyGeometry = new THREE.SphereGeometry(1, params.numSegments, params.numSegments);
        var bodyMesh = new THREE.Mesh(bodyGeometry, createMaterial(params.bodyColor));
        bodyMesh.scale.set(params.bodyDiameter / 2, params.bodyHeight / 2, params.bodyDiameter / 2);
        resultMesh.add(bodyMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createHatMesh = function(transforms) {
        // Origin is at center of bottom of brim of hat; positive y axis points up through top of hat.
        var resultMesh = new THREE.Object3D();

        var brimGeometry = new THREE.CylinderGeometry(params.hatBrimRadius, params.hatBrimRadius, params.hatBrimThickness, params.numSegments, params.numSegments);
        var brimMesh = new THREE.Mesh(brimGeometry, createMaterial(params.hatBrimColor));
        brimMesh.position.set(0, params.hatBrimThickness / 2, 0);
        resultMesh.add(brimMesh);

        var topGeometry = new THREE.CylinderGeometry(params.hatTopRadius, params.hatBottomRadius, params.hatHeight, params.numSegments, params.numSegments);
        var topMesh = new THREE.Mesh(topGeometry, createMaterial(params.hatTopColor));
        topMesh.position.set(0, params.hatBrimThickness + params.hatHeight / 2, 0);
        resultMesh.add(topMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createMarkerMesh = function(transforms) {
        var markerGeometry = new THREE.SphereGeometry(2);
        var markerMesh = new THREE.Mesh(markerGeometry, createMaterial("yellow"));
        markerMesh.position.set(0, -transforms.y, 0);
        return markerMesh;
    };

    var _createMesh = function(transforms) {
        // Origin is between feet; positive y axis points up towards neck.
        var resultMesh = new THREE.Object3D();

        var legXOffset = params.bodyDiameter / 4;
        var legYOffset = params.bodyHeight / 3;
        var armXOffset = params.bodyDiameter / 3;
        var armYOffset = params.bodyHeight / 3;
        var headYOffset = params.bodyHeight / 2.25;
        var hatYOffset = params.headRadius * 1.8;
        var hatZOffset = params.headRadius / 4;
        var originOffset = params.legLength + params.bodyHeight / 3;

        [
            // body
            _createBodyMesh({x: 0, y: 0, z: 0, a: 0, b: 0, c: 0}),

            // left and right legs
            _createLegMesh({x: -legXOffset, y: -legYOffset, z: 0, a: 0, b: 0, c: 0}),
            _createLegMesh({x: legXOffset, y: -legYOffset, z: 0, a: 0, b: 0, c: 0}),

            // left and right arms
            _createArmMesh({x: -armXOffset, y: armYOffset, z: 0, a: 0, b: 0, c: -Math.PI / 4}),
            _createArmMesh({x: armXOffset, y: armYOffset, z: 0, a: 0, b: 0, c: Math.PI / 4}),

            // head and hat
            _createHeadMesh({x: 0, y: headYOffset, z: 0, a: 0, b: 0, c: 0}),
            _createHatMesh({x: 0, y: headYOffset + hatYOffset, z: -hatZOffset, a: -Math.PI / 6, b: 0, c: 0}),

            // origin marker
            _createMarkerMesh({x: 0, y: originOffset, z: 0, a: 0, b: 0, c: 0})
        ].map(function(mesh) {
            resultMesh.add(mesh);
        });

        // Place the origin between the feet instead of at the center of the body
        transforms.y += originOffset;
        return _setTransforms(resultMesh, transforms);
    };

    var _setTransforms = function(mesh, transforms) {
        mesh.position.set(transforms.x, transforms.y, transforms.z);
        mesh.rotation.set(transforms.a, transforms.b, transforms.c);
        return mesh;
    };

    return _createMesh(params.getTransforms());
}

function createMaterial(color) {
    return new THREE.MeshBasicMaterial({color: new THREE.Color(color)});
}