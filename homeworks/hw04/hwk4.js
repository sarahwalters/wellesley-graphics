// Defines parameters
function Params() {
    var sideLength = 50;
    var ballRadius = 5;
    var ballMargin = 2;

    this.getBoundingBox = function() {
        return {
            minx: 0, maxx: sideLength,
            miny: 0, maxy: sideLength,
            minz: 0, maxz: sideLength
        };
    };

    // draw configuration
    this.ball = {
        radius: ballRadius,
        margin: ballMargin,
        segments: 20,
        color: 0x993399, // purple
        specular: 'white',
        shininess: 20,
        position: {
            x: ballRadius + ballMargin,
            y: 0,
            z: ballRadius + ballMargin
        }
    };

    this.room = {
        side: sideLength,
        floor: {
            color: 0xffaa55, // tan
            specular: 'white',
            shininess: 0
        },
        wall: {
            color: 0x007799, // blue
            specular: 'white',
            shininess: 0
        },
        ceiling: {
            color: 0x006615, // dark green
            specular: 'white',
            shininess: 0
        },
        wallTransforms: [
            {
                x: 0, y: sideLength / 2, z: sideLength / 2,
                a: 0, b: Math.PI / 2, c: 0
            },
            {
                x: sideLength / 2, y: sideLength / 2, z: sideLength,
                a: 0, b: Math.PI, c: 0
            },
            {
                x: sideLength, y: sideLength / 2, z: sideLength / 2,
                a: 0, b: - Math.PI / 2, c: 0
            },
            {
                x: sideLength / 2, y: sideLength / 2, z: 0,
                a: 0, b: 0, c: 0
            }
        ]
    };

    this.sconce = {
        color: 'gray',
        specular: 'white',
        shininess: 5,
        radius: 2.5,
        height: 4.5,
        segments: 10,
        position: {
            x: sideLength * 0.15,
            y: sideLength * 0.6,
            z: 0
        }
    };

    // light configuration
    this.ambientLight = {
        color: 0xaaaaaa // light gray
    }

    this.directionalLight = {
        color: 0xffffff, // white
        intensity: 0.6,
        position: {
            x: sideLength * 0.6,
            y: sideLength * 0.9,
            z: sideLength
        },
        on: true
    };

    this.sconceLights = {
        top: {
            color: 0xffffff, // white
            intensity: 2,
            distance: 200,
            cutoffAngle: 0.5,
            target: {
                x: this.sconce.position.x,
                y: sideLength,
                z: this.sconce.radius
            },
            position: {
                x: this.sconce.position.x,
                y: this.sconce.position.y,
                z: this.sconce.position.z + this.sconce.radius
            }
        },
        bottom: {
            color: 0xffffff, // white
            intensity: 2,
            distance: 200,
            cutoffAngle: 0.5,
            target: {
                x: this.sconce.position.x,
                y: 0,
                z: this.sconce.radius
            },
            position: {
                x: this.sconce.position.x,
                y: this.sconce.position.y,
                z: this.sconce.position.z + this.sconce.radius
            }
        }
    }
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
    light(scene, params);

    render();
    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, state.cameraObject);
    }
}

// Draws the scene
function draw(scene, params) {
    var ballMesh = createBallMesh(params);
    setPosition(ballMesh, params.ball.position);
    scene.add(ballMesh);

    var roomMesh = createRoomMesh(params);
    scene.add(roomMesh);

    var sconceMesh = createSconceMesh(params);
    setPosition(sconceMesh, params.sconce.position);
    scene.add(sconceMesh);
}

function light(scene, params) {
    createAmbientLight(scene, params.ambientLight);
    createDirectionalLight(scene, params.directionalLight);
    createSpotLight(scene, params.sconceLights.top);
    createSpotLight(scene, params.sconceLights.bottom);
}

// Origin is at bottom center of ball, where it rests on floor.
function createBallMesh(params) {
    var resultMesh = new THREE.Object3D();

    var ballGeometry = new THREE.SphereGeometry(
        params.ball.radius,
        params.ball.segments,
        params.ball.segments);
    var ballMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(params.ball.color),
        specular: new THREE.Color(params.ball.specular),
        shininess: params.ball.shininess,
        shading: THREE.SmoothShading
    });
    var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballMesh.position.set(0, params.ball.radius, 0);
    resultMesh.add(ballMesh);

    return resultMesh;
}

// Origin is at one corner of the floor -- x and z axes along the
// edges of the floor, y axis pointing up between two walls.
function createRoomMesh(params) {
    var resultMesh = new THREE.Object3D();

    var floorMesh = createFloorMesh(params);
    resultMesh.add(floorMesh);

    params.room.wallTransforms.map(function(transforms) {
        var wallMesh = new createWallMesh(params, transforms);
        resultMesh.add(wallMesh);
    });

    var ceilingMesh = createCeilingMesh(params);
    resultMesh.add(ceilingMesh);

    return resultMesh;
}

// Origin is at the corner of the room to which the floor belongs.
function createFloorMesh(params) {
    var floorGeometry = new THREE.PlaneGeometry(
        params.room.side, params.room.side);
    var floorMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(params.room.floor.color),
        specular: new THREE.Color(params.room.floor.specular),
        shininess: params.room.floor.shininess
    });
    var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.set(-Math.PI / 2, 0, 0);
    floorMesh.position.set(
        params.room.side / 2,
        0,
        params.room.side / 2);
    return floorMesh;
}

// Origin is at the corner of the room to which the wall belongs.
function createWallMesh(params, transforms) {
    var wallGeometry = new THREE.PlaneGeometry(
        params.room.side, params.room.side);
    var wallMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(params.room.wall.color),
        specular: new THREE.Color(params.room.wall.specular),
        shininess: params.room.wall.shininess
    });
    var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.rotation.set(transforms.a, transforms.b, transforms.c);
    wallMesh.position.set(transforms.x, transforms.y, transforms.z);
    return wallMesh;
}

// Origin is at the corner of the room to which the ceiling belongs.
function createCeilingMesh(params) {
    var ceilingGeometry = new THREE.PlaneGeometry(
        params.room.side, params.room.side);
    var ceilingMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(params.room.ceiling.color),
        specular: new THREE.Color(params.room.ceiling.specular),
        shininess: params.room.ceiling.shininess
    });
    var ceilingMesh = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceilingMesh.rotation.set(Math.PI / 2, 0, 0);
    ceilingMesh.position.set(
        params.room.side / 2,
        params.room.side,
        params.room.side / 2);
    return ceilingMesh;
}

// Origin is at the center of the "back" of the sconce. z axis
// parallels the line which points up through the center of the
// top cone of the sconce.
function createSconceMesh(params) {
    var resultMesh = new THREE.Object3D();

    var sconceMaterial = new THREE.MeshPhongMaterial({
        color: params.sconce.color,
        specular: new THREE.Color(params.sconce.specular),
        shininess: params.sconce.shininess,
        side: THREE.DoubleSide
    });

    var topGeometry = new THREE.ConeGeometry(
        params.sconce.radius,
        params.sconce.height,
        params.sconce.segments,
        params.sconce.segments,
        true);
    var topMesh = new THREE.Mesh(topGeometry, sconceMaterial);
    topMesh.rotation.set(Math.PI, 0, 0);
    topMesh.position.set(
        0,
        params.sconce.height / 2,
        params.sconce.radius);
    resultMesh.add(topMesh);

    var bottomGeometry = new THREE.ConeGeometry(
        params.sconce.radius,
        params.sconce.height,
        params.sconce.segments,
        params.sconce.segments,
        true);
    var bottomMesh = new THREE.Mesh(bottomGeometry, sconceMaterial);
    bottomMesh.position.set(
        0,
        -params.sconce.height / 2,
        params.sconce.radius);
    resultMesh.add(bottomMesh);

    return resultMesh;
}

function createSpotLight(scene, lightParams) {
    var spotLightTarget = new THREE.Object3D();
    setPosition(spotLightTarget, lightParams.target);
    scene.add(spotLightTarget);

    var spotLight = new THREE.SpotLight(
        lightParams.color,
        lightParams.intensity,
        lightParams.distance,
        lightParams.cutoffAngle);
    spotLight.castShadow = true;
    setPosition(spotLight, lightParams.position);
    spotLight.target = spotLightTarget;
    scene.add(spotLight);
}

function createAmbientLight(scene, lightParams) {
    var ambientLight = new THREE.AmbientLight(lightParams.color);
    scene.add(ambientLight);
}

function createDirectionalLight(scene, lightParams) {
    var directionalLight = new THREE.DirectionalLight(
        lightParams.color, lightParams.intensity);
    setPosition(directionalLight, lightParams.position);
    scene.add(directionalLight);
}

function setPosition(obj, position) {
    obj.position.set(position.x, position.y, position.z);
}
