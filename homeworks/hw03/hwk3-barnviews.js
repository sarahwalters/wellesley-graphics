function Params() {
    this.barnWidth = 10;
    this.barnHeight = 10;
    this.barnLength = 20;

    this.view1 = {
        name: 'View 1',
        fov: 90,
        aspect: 1.5,
        near: 25,
        far: 60,
        eye: {x: 0, y: 0, z: 30},
        up: {x: 0, y: 0, z: 0},
        at: {x: 0, y: 0, z: 0}
    };

    this.view2 = {
        name: 'View 2',
        fov: 60,
        aspect: 2,
        near: 25,
        far: 80,
        eye: {x: 25, y: 0, z: 30},
        up: {x: 0, y: 0, z: 0},
        at: {x: -3, y: 0, z: 25}
    };

    this.view3 = {
        name: 'View 3',
        fov: 45,
        aspect: 1.5,
        near: 1,
        far: 100,
        eye: {x: 25, y: 25, z: 30},
        up: {x: -2, y: 18, z: 0},
        at: {x: 0, y: 0, z: 0}
    };

    this.view4 = {
        name: 'View 4',
        fov: 60,
        aspect: 1.5,
        near: 1,
        far: 65,
        eye: {x: 0, y: 50, z: 0},
        up: {x: 1, y: 0, z: 0},
        at: {x: 0, y: 0, z: 0}
    };

    this.view5 = {
        name: 'View 5',
        fov: 60,
        aspect: 1.5,
        near: 1,
        far: 65,
        eye: {x: 0, y: 50, z: 0},
        up: {x: 1, y: 0, z: -2},
        at: {x: 0, y: 0, z: 0}
    };
}

function init() {
    var params = new Params();

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    document.getElementById('webgl-output').appendChild(renderer.domElement);

    var camera = new THREE.PerspectiveCamera();
    updateCamera(params.view1);
    scene.add(camera);

    function updateCamera(p) {
        camera.fov = p.fov;
        camera.aspect = p.aspect;
        camera.near = p.near;
        camera.far = p.far;
        camera.position.set(p.eye.x, p.eye.y, p.eye.z);
        camera.up.set(p.up.x, p.up.y, p.up.z);
        camera.lookAt(new THREE.Vector3(p.at.x, p.at.y, p.at.z));
        camera.updateProjectionMatrix();

        document.getElementById('header').innerHTML = p.name;
        render();
    }

    TW.mainInit(renderer, scene);
    TW.setKeyboardCallback('1', function() {
        updateCamera(params.view1);
    }, 'camera setup 1');
    TW.setKeyboardCallback('2', function() {
        updateCamera(params.view2);
    }, 'camera setup 2');
    TW.setKeyboardCallback('3', function() {
        updateCamera(params.view3);
    }, 'camera setup 3');
    TW.setKeyboardCallback('4', function() {
        updateCamera(params.view4);
    }, 'camera setup 4');
    TW.setKeyboardCallback('5', function() {
        updateCamera(params.view5);
    }, 'camera setup 5');

    draw(scene, params);

    render();
    function render() {
        renderer.render(scene, camera);
    }
}

function draw(scene, p) {
    var wireBarn = TW.createWireBarn(p.barnWidth, p.barnHeight, p.barnLength);
    scene.add(wireBarn);
}
