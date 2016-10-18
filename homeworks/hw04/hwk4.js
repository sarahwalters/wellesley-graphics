// Defines parameters
function Params() {
    var sideLength = 50;
    var ballRadius = 5;
    var ballMargin = 2;
    var purple = 0x993399;
    var white = 0xffffff;
    var tan = 0xffaa55;
    var blue = 0x007799;
    var green = 0x006615;
    var gray = 0xaaaaaa;

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
        color: purple,
        specular: white,
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
            color: tan,
            specular: white,
            shininess: 0
        },
        wall: {
            color: blue,
            specular: white,
            shininess: 0
        },
        ceiling: {
            color: green,
            specular: white,
            shininess: 0
        }
    };

    this.sconce = {
        color: gray,
        specular: white,
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
        color: gray
    }

    this.directionalLight = {
        color: white,
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
            color: white, // white
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
            color: white, // white
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
    var ballMesh = MESH.createBallMesh(params);
    setPosition(ballMesh, params.ball.position);
    scene.add(ballMesh);

    var roomMesh = MESH.createRoomMesh(params);
    scene.add(roomMesh);

    var sconceMesh = MESH.createSconceMesh(params);
    setPosition(sconceMesh, params.sconce.position);
    scene.add(sconceMesh);
}

function light(scene, params) {
    createAmbientLight(scene, params.ambientLight);
    createDirectionalLight(scene, params.directionalLight);
    createSpotLight(scene, params.sconceLights.top);
    createSpotLight(scene, params.sconceLights.bottom);
}

var MESH = {
    // Origin is at bottom center of ball, where it rests on floor.
    createBallMesh: function(params) {
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
    },

    createRoomMesh: function(params) {
        var resultMesh = new THREE.Object3D();

        var roomGeometry = new THREE.BoxGeometry(params.room.side, params.room.side, params.room.side);

        var faceParamsArray = [params.room.wall, params.room.wall, params.room.ceiling, params.room.floor, params.room.wall, params.room.wall];
        var materialArray = faceParamsArray.map(function(faceParams) {
            return new THREE.MeshPhongMaterial({
                color: new THREE.Color(faceParams.color),
                specular: new THREE.Color(faceParams.specular),
                shininess: faceParams.shininess,
                side: THREE.BackSide
            });
        });
        var roomMaterial = new THREE.MeshFaceMaterial(materialArray);

        var roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
        roomMesh.position.set(params.room.side / 2, params.room.side / 2, params.room.side / 2);
        resultMesh.add(roomMesh);

        return resultMesh;
    },

    // Origin is at the center of the "back" of the sconce. z axis
    // parallels the line which points up through the center of the
    // top cone of the sconce.
    createSconceMesh: function(params) {
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
};

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

function setRotation(obj, rotation) {
    obj.rotation.set(rotation.a, rotation.b, rotation.c);
}
