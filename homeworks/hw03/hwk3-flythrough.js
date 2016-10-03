function Params() {
    this.nameBase = 'Slide ';
    this.frameKeys = '0123456789';
    this.barnWidth = 10;
    this.barnHeight = 10;
    this.barnLength = 20;

    var _cameraConstants = {
        fov: 75,
        aspect: 1.6,
        near: 1,
        far: 200,
        up: {x: 0, y: 1, z: 0},
        eye: {x: 0},
        at: {x: 0, z: 0}
    };

    var _viewStart = {
        eye: {y: 75, z: 62},
        at: {y: 25}
    };

    var _viewEnd = {
        eye: {y: 10, z: 20},
        at: {y: 10}
    };

    var _remap = function(intervalStart, intervalEnd, proportion) {
        return intervalStart + proportion * (intervalEnd - intervalStart);
    };

    this.getCameraParams = function(frameKey) {
        // Clone camera constants to modify
        var result = JSON.parse(JSON.stringify(_cameraConstants));

        var maxFrameKeyIndex = this.frameKeys.length - 1;
        var proportion = this.frameKeys.indexOf(frameKey) / maxFrameKeyIndex;

        result.eye.y = _remap(_viewStart.eye.y, _viewEnd.eye.y, proportion);
        result.eye.z = _remap(_viewStart.eye.z, _viewEnd.eye.z, proportion);
        result.at.y = _remap(_viewStart.at.y, _viewEnd.at.y, proportion);

        return result;
    };
}


function init() {
    var params = new Params();

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    var camera = new THREE.PerspectiveCamera();
    updateCamera(0);
    scene.add(camera);

    function updateCamera(frameKey) {
        var p = params.getCameraParams(frameKey);

        camera.fov = p.fov;
        camera.aspect = p.aspect;
        camera.near = p.near;
        camera.far = p.far;
        camera.position.set(p.eye.x, p.eye.y, p.eye.z);
        camera.up.set(p.up.x, p.up.y, p.up.z);
        camera.lookAt(new THREE.Vector3(p.at.x, p.at.y, p.at.z));
        camera.updateProjectionMatrix();

        var header = params.nameBase + frameKey;
        document.getElementById('header').innerHTML = header;
        render();
    }

    TW.mainInit(renderer, scene);
    params.frameKeys.split('').map(function(key) {
        TW.setKeyboardCallback(key, function() {
            updateCamera(key);
        }, 'camera setup ' + key);
    });

    draw(scene);

    render();
    function render() {
        renderer.render(scene, camera);
    }
}


// this function is a slightly modified version of a function taken from
// the fence demo cs.wellesley.edu/~cs307/readings/05-nested-transforms.shtml
function makeFence(numPickets) {
    /* Makes a fence, with the left end at the origin and proceeding down
       the x axis. The pickets are made from barn objects, scaled to be unit
       height (at the shoulder) and very thin. */

    var fence = new THREE.Object3D();

    var picketG = TW.createBarn(.09, 1, 0.1);
    var picketM = new THREE.MeshNormalMaterial();
    var picket = new THREE.Mesh(picketG, picketM);
    var i;

    for (i = 0; i < numPickets; ++i) {
        picket = picket.clone();
        picket.translateX(0.1);
        fence.add(picket);
    }

    return fence;
}


//create a barn, fence and ground
function draw(scene, params) {
    var barn = new TW.createMesh(TW.createBarn(5, 5, 10));
    scene.add(barn);

    fence1 = makeFence(40);
    fence1.translateX(5);
    scene.add(fence1);

    fence2 = fence1.clone();
    fence2.translateZ(-10);
    scene.add(fence2);

    fence3 = makeFence(100);
    fence3.translateX(9.2);
    fence3.rotation.y = Math.PI / 2;
    scene.add(fence3);

    // ground will go from -10 to +10 in X and Z
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20),
                                createMaterial(THREE.ColorKeywords.darkgreen));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
}

function createMaterial(color) {
    return new THREE.MeshBasicMaterial({color: color});
}
