function Params() {
    this.meshName = 'clown_mesh';
    this.numSegments = 20;
    this.markerColor = 'rgb(255,255,0)';

    // leg
    this.footRadius = 5;
    this.legRadius = 1.5;
    this.legLength = 30;
    this.legColor = 'rgb(150,0,0)';
    this.footColor = 'rgb(0,0,0)';

    // arm
    this.handRadius = 5;
    this.armRadius = 1.5;
    this.armLength = 30;
    this.shoulderRadius = 5;
    this.armColor = 'rgb(150,0,0)';
    this.handColor = 'rgb(255,255,255)';
    this.shoulderColor = 'rgb(0,0,0)';

    // head
    this.headRadius = 15;
    this.headColor = 'rgb(255,224,189)';

    // face
    this.eyeRadius = 2;
    this.eyeColor = 'rgb(0,150,0)';
    this.earRadius = 3;
    this.noseRadius = 2;
    this.faceFeatureColor = 'rgb(250,219,184)';
    this.mouthRadius = 5;
    this.mouthThickness = 1;
    this.mouthColor = 'rgb(201,130,118)';

    // body
    this.bodyDiameter = 30;
    this.bodyHeight = 50;
    this.bodyColor = 'rgb(75,75,75)';

    // hat
    this.hatBrimRadius = 25;
    this.hatBrimThickness = 1;
    this.hatBottomRadius = 10;
    this.hatTopRadius = 20;
    this.hatHeight = 20;
    this.hatBrimColor = 'rgb(100,0,0)';
    this.hatTopColor = 'rgb(150,0,0)';

    // position
    this.x = 0;
    this.y = 0;
    this.z = 0;

    // when true, clown moves relative to axes
    // when false, axes move relative to clown
    this.originInBoundingBox = true;

    // walking animation
    this.walking = false;
    this.legControl = {
        angleLimit: Math.PI / 6,
        angleStep: 0.1,
        angleDirection: 1,
        angle: 0
    };
    this.armControl = {
        angleLimit: Math.PI / 6,
        angleStep: 0.1,
        angleDirection: 1,
        angle: 0
    };
    this.headControl = {
        angleLimit: Math.PI / 12,
        angleStep: 0.05,
        angleDirection: 1,
        angle: 0
    };

    this.getTransforms = function() {
        return {x: this.x, y: this.y, z: this.z};
    };

    this.getBoundingBox = function() {
        var maxWidth = 2 * this.armLength + this.bodyDiameter;
        var totalHeight = this.legLength + this.bodyHeight +
                          2 * this.headRadius + this.hatHeight;

        // only add the offsets if the origin shouldn't be in the bounding box
        var offsetMultiplier = this.originInBoundingBox ? 0 : 1;
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

    var mainFolder = gui.addFolder('Head and body');
    [
        ['headRadius', 40],
        ['bodyDiameter', 50],
        ['bodyHeight', 100]
    ].map(function(field) { _addToGui(field, mainFolder); });

    var legFolder = gui.addFolder('Legs and feet');
    [
        ['footRadius', 10],
        ['legRadius', 3],
        ['legLength', 50]
    ].map(function(field) { _addToGui(field, legFolder); });

    var armFolder = gui.addFolder('Arms and hands');
    [
        ['handRadius', 10],
        ['armRadius', 3],
        ['armLength', 50],
        ['shoulderRadius', 10]
    ].map(function(field) { _addToGui(field, armFolder); });

    var hatFolder = gui.addFolder('Hat');
    [
        ['hatBrimRadius', 40],
        ['hatBrimThickness', 3],
        ['hatBottomRadius', 50],
        ['hatTopRadius', 60],
        ['hatHeight', 50]
    ].map(function(field) { _addToGui(field, hatFolder); });

    var faceFolder = gui.addFolder('Face');
    [
        ['eyeRadius', 5],
        ['earRadius', 5],
        ['noseRadius', 5]
    ].map(function(field) { _addToGui(field, faceFolder); });

    var positionBound = 20;
    var positionFolder = gui.addFolder('Position');
    [
        ['x', positionBound],
        ['y', positionBound],
        ['z', positionBound],
        ['originInBoundingBox', true],
        ['walking', false]
    ].map(function(field) {
        _addToGui(field, positionFolder, min = -positionBound);
    });
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
    draw(scene, params);

    buildGui(scene, params, function() {
        // force bounding box to be off while resizing obelisk
        state.sceneBoundingBoxHelper.visible = false;
        draw(scene, params);

        // set up the camera again, with the new bounding box
        state = TW.cameraSetup(renderer,
                   scene,
                   params.getBoundingBox());
    });

    render();
    function render() {
        if (params.walking) {
            animate(params.legControl);
            animate(params.armControl);
            animate(params.headControl);
        }

        draw(scene, params);
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

// Draws the scene
function draw(scene, params) {
    var oldMesh = scene.getObjectByName(params.meshName);
    if (oldMesh) scene.remove(oldMesh);

    var newMesh = createClownMesh(params);
    newMesh.name = params.meshName;
    scene.add(newMesh);
}

// Animates an angle control
function animate(control) {
    if (control.angle > control.angleLimit) {
        control.angleDirection = -1;
    } else if (control.angle < -control.angleLimit) {
        control.angleDirection = 1;
    }

    control.angle += control.angleDirection * control.angleStep;
}

// Creates a modularized clown object
function createClownMesh(params) {
    var n = params.numSegments;

    var _createLegMesh = function(transforms) {
        // Origin is at center of top of leg;
        // leg points down towards foot along negative y axis.
        var resultMesh = new THREE.Object3D();

        var footGeometry = new THREE.SphereGeometry(
            params.footRadius, n, n, 0, Math.PI * 2, 0, Math.PI / 2);
        var footMaterial = createMaterial(params.footColor);
        var footMesh = new THREE.Mesh(footGeometry, footMaterial);
        footMesh.position.set(0, -params.legLength, 0);
        resultMesh.add(footMesh);

        var legGeometry = new THREE.CylinderGeometry(
            params.legRadius, params.legRadius, params.legLength);
        var legMaterial = createMaterial(params.legColor);
        var legMesh = new THREE.Mesh(legGeometry, legMaterial);
        legMesh.position.set(0, -params.legLength / 2, 0);
        resultMesh.add(legMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createArmMesh = function(transforms) {
        // Origin is at center of shoulder;
        // arm points down towards hand along negative y axis.
        var resultMesh = new THREE.Object3D();

        var handGeometry = new THREE.SphereGeometry(
            params.handRadius, n, n);
        var handMaterial = createMaterial(params.handColor);
        var handMesh = new THREE.Mesh(handGeometry, handMaterial);
        handMesh.position.set(0, -params.armLength, 0);
        resultMesh.add(handMesh);

        var armGeometry = new THREE.CylinderGeometry(
            params.armRadius, params.armRadius, params.armLength);
        var armMaterial = createMaterial(params.armColor);
        var armMesh = new THREE.Mesh(armGeometry, armMaterial);
        armMesh.position.set(0, -params.armLength / 2, 0);
        resultMesh.add(armMesh);

        var shoulderGeometry = new THREE.SphereGeometry(
            params.shoulderRadius, n, n);
        var shoulderMaterial = createMaterial(params.shoulderColor);
        var shoulderMesh = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        resultMesh.add(shoulderMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createBodyMesh = function(transforms) {
        // Origin is at center of body; positive y axis points up towards neck.
        var resultMesh = new THREE.Object3D();

        var bodyGeometry = new THREE.SphereGeometry(1, n, n);
        var bodyMaterial = createMaterial(params.bodyColor);
        var bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bodyMesh.scale.set(params.bodyDiameter / 2,
                           params.bodyHeight / 2,
                           params.bodyDiameter / 2);
        resultMesh.add(bodyMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createEyeMesh = function(transforms) {
        // Origin is at center of eye.
        var eyeGeometry = new THREE.SphereGeometry(params.eyeRadius);
        var eyeMaterial = createMaterial(params.eyeColor);
        var eyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
        return _setTransforms(eyeMesh, transforms);
    };

    var _createEarMesh = function(transforms) {
        // Origin is at center of ear.
        var earGeometry = new THREE.SphereGeometry(params.earRadius);
        var earMaterial = createMaterial(params.faceFeatureColor);
        var earMesh = new THREE.Mesh(earGeometry, earMaterial);
        return _setTransforms(earMesh, transforms);
    };

    var _createNoseMesh = function(transforms) {
        // Origin is at center of nose.
        var noseGeometry = new THREE.SphereGeometry(params.noseRadius);
        var noseMaterial = createMaterial(params.faceFeatureColor);
        var noseMesh = new THREE.Mesh(noseGeometry, noseMaterial);
        return _setTransforms(noseMesh, transforms);
    };

    var _createMouthMesh = function(transforms) {
        // Origin is at center of arc swept by mouth.
        var resultMesh = new THREE.Object3D();

        var mouthGeometry = new THREE.TorusGeometry(
            params.mouthRadius, params.mouthThickness, n, n, 2 * Math.PI / 3);
        var mouthMaterial = createMaterial(params.mouthColor);
        var mouthMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouthMesh.rotation.z = 7 * Math.PI / 6;
        resultMesh.add(mouthMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createHeadMesh = function(transforms) {
        // Origin is at bottom of head;
        // positive y axis points up through head.
        // Face symmetrical across yz plane.
        var resultMesh = new THREE.Object3D();

        var headGeometry = new THREE.SphereGeometry(params.headRadius, n, n);
        var headMaterial = createMaterial(params.headColor);
        var headMesh = new THREE.Mesh(headGeometry, headMaterial);
        resultMesh.add(headMesh);

        var aroundZ = Math.PI / 4;
        var fromZ = Math.PI / 6;
        var leftEyeMesh = _createEyeMesh({
            x: params.headRadius * Math.cos(aroundZ) * Math.sin(-fromZ),
            y: params.headRadius * Math.sin(aroundZ) * Math.sin(fromZ),
            z: params.headRadius * Math.cos(fromZ)
        });
        var rightEyeMesh = _createEyeMesh({
            x: params.headRadius * Math.cos(aroundZ) * Math.sin(fromZ),
            y: params.headRadius * Math.sin(aroundZ) * Math.sin(fromZ),
            z: params.headRadius * Math.cos(fromZ)
        });
        resultMesh.add(leftEyeMesh);
        resultMesh.add(rightEyeMesh);

        var leftEarMesh = _createEarMesh({x: -params.headRadius});
        var rightEarMesh = _createEarMesh({x: params.headRadius});
        resultMesh.add(leftEarMesh);
        resultMesh.add(rightEarMesh);

        var noseMesh = _createNoseMesh({z: params.headRadius});
        resultMesh.add(noseMesh);

        var fromZ = -Math.PI / 12;
        var mouthMesh = _createMouthMesh({
            x: 0,
            y: params.headRadius * Math.sin(fromZ),
            z: params.headRadius * Math.cos(fromZ),
            a: Math.PI / 6});
        resultMesh.add(mouthMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createHatMesh = function(transforms) {
        // Origin is at center of bottom of brim of hat;
        // positive y axis points up through top of hat.
        var resultMesh = new THREE.Object3D();

        var brimGeometry = new THREE.CylinderGeometry(
            params.hatBrimRadius, params.hatBrimRadius,
            params.hatBrimThickness, n, n);
        var hatBrimMaterial = createMaterial(params.hatBrimColor);
        var brimMesh = new THREE.Mesh(brimGeometry, hatBrimMaterial);
        brimMesh.position.set(0, params.hatBrimThickness / 2, 0);
        resultMesh.add(brimMesh);

        var topGeometry = new THREE.CylinderGeometry(
            params.hatTopRadius, params.hatBottomRadius,
            params.hatHeight, n, n);
        var hatTopMaterial = createMaterial(params.hatTopColor);
        var topMesh = new THREE.Mesh(topGeometry, hatTopMaterial);
        topMesh.position.y = params.hatBrimThickness + params.hatHeight / 2;
        resultMesh.add(topMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createHeadWithHatMesh = function(transforms) {
        // Origin is at bottom of head;
        // positive y axis points up through head.
        // Face symmetrical across yz plane.
        var resultMesh = new THREE.Object3D();

        var headMesh = _createHeadMesh({y: params.headRadius});
        resultMesh.add(headMesh);

        var hatYOffset = params.headRadius * 1.8;
        var hatZOffset = params.headRadius / 4;
        var hatMesh = _createHatMesh({y: hatYOffset, z: -hatZOffset,
                                      a: -Math.PI / 6});
        resultMesh.add(hatMesh);

        return _setTransforms(resultMesh, transforms);
    };

    var _createMarkerMesh = function(transforms) {
        var markerGeometry = new THREE.SphereGeometry(2);
        var markerMaterial = createMaterial(params.markerColor);
        var markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
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
            _createBodyMesh(),

            // left and right legs
            _createLegMesh({x: -legXOffset, y: -legYOffset,
                            a: params.legControl.angle}),
            _createLegMesh({x: legXOffset, y: -legYOffset,
                            a: -params.legControl.angle}),

            // left and right arms
            _createArmMesh({x: -armXOffset, y: armYOffset,
                            a: -params.armControl.angle, c: -Math.PI / 6}),
            _createArmMesh({x: armXOffset, y: armYOffset,
                            a: params.armControl.angle, c: Math.PI / 6}),

            // head and hat
            _createHeadWithHatMesh({y: headYOffset,
                                    b: params.headControl.angle}),

            // origin marker
            _createMarkerMesh({y: originOffset})
        ].map(function(mesh) {
            resultMesh.add(mesh);
        });

        // Place the origin between feet instead of at center of body
        transforms.y += originOffset;
        return _setTransforms(resultMesh, transforms);
    };

    var _setTransforms = function(mesh, transforms) {
        transforms = transforms || {};
        'xyzabc'.split('').map(function(key) {
            transforms[key] = transforms[key] ? transforms[key] : 0;
        });

        mesh.position.set(transforms.x, transforms.y, transforms.z);
        mesh.rotation.set(transforms.a, transforms.b, transforms.c);
        return mesh;
    };

    return _createMesh(params.getTransforms());
}

function createMaterial(color) {
    return new THREE.MeshBasicMaterial({color: new THREE.Color(color)});
}
