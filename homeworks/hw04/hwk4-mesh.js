// Defines mesh functions
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
