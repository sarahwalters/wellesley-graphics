function Shapes() {
    var self = this;

    // origin is center of base of cone representing tie-off at bottom of balloon
    // rotationally symmetrical about y axis, which points up through center of balloon
    this.Balloon = function(position) {
        // "normalized" balloon bezier with a height of 1
        var _balloonBezier = new THREE.CubicBezierCurve(
            new THREE.Vector2(-0.05, -0.05),
            new THREE.Vector2(0.35, 0.1),
            new THREE.Vector2(0.8, 0.95),
            new THREE.Vector2(0, 1)
        );
        var _normalizedBalloonPoints = _balloonBezier.getPoints(20);

        var _makeBalloon = function(height) {
            var controlPoints = _normalizedBalloonPoints.map(function(cp) {
                return _.clone(cp).multiplyScalar(height);
            });
            var balloonGeometry = new THREE.LatheGeometry(controlPoints, 20);
            var balloonMaterial = new THREE.MeshPhongMaterial({ // TODO Phong
                color: UTILS.getRandomColor(),
                shininess: PARAMS.balloon.shininess,
                transparent: true,
                opacity: PARAMS.balloon.opacity
            });
            return new THREE.Mesh(balloonGeometry, balloonMaterial);
        };

        var result = _makeBalloon(PARAMS.balloon.height);

        result.calculateRotation = function() {
            // balloon is at positiona
            // ribbons join at (0, -params.ribbonHeight, 0)
            // this function returns a rotation for the balloon which lines its vertical axis up with its ribbon

            var deltaY = position.y + PARAMS.ribbon.height;

            var aRotation = Math.tan(position.z / deltaY);
            var cRotation = -Math.tan(position.x / deltaY);

            return {a: aRotation, b: 0, c: cRotation};
        };

        return result;
    };

    this.Ribbon = function(balloonPosition) {
        var ribbonGeometry = new THREE.Geometry();
        ribbonGeometry.vertices.push(
            new THREE.Vector3(balloonPosition.x, balloonPosition.y, balloonPosition.z),
            new THREE.Vector3(0, -PARAMS.ribbon.height, 0));
        var ribbonMaterial = new THREE.LineBasicMaterial({
            color: PARAMS.ribbon.color
        });
        return new THREE.Line(ribbonGeometry, ribbonMaterial);
    };

    // origin is where the balloons' ribbons gather
    // y axis points up towards the top of the cloud
    this.BalloonCloud = function() {
        var _jitterMeshPosition = function(n) {
            var center = n * PARAMS.balloon.height;
            var rand = Math.random() - 0.5; // random number between -0.5 and 0.5
            return (1 + rand) * center;
        };

        var _generateBalloonPositions = function() {
            var positions = [];
            for (var i = -PARAMS.meshRadius; i < PARAMS.meshRadius; i++) {
                for (var j = -PARAMS.meshRadius; j < PARAMS.meshRadius; j++) {
                    for (var k = -PARAMS.meshRadius; k < PARAMS.meshRadius; k++) {
                        var distanceFromOrigin = Math.sqrt(Math.pow(i, 2) + Math.pow(j, 2) + Math.pow(k, 2));
                        if (distanceFromOrigin <= PARAMS.meshRadius) {
                            UTILS.callTwice(function() {
                                positions.push({
                                    x: _jitterMeshPosition(i),
                                    y: _jitterMeshPosition(j),
                                    z: _jitterMeshPosition(k)
                                });
                            });
                        }
                    }
                }
            }
            return positions;
        };

        var _makeBalloonCloud = function() {
            var cloud = new THREE.Object3D();

            var positions = _generateBalloonPositions();
            positions.map(function(position) {
                var balloon = new self.Balloon(position);
                UTILS.setPosition(balloon, position);
                var rotation = balloon.calculateRotation();
                UTILS.setRotation(balloon, rotation);
                var ribbon = new self.Ribbon(position);
                cloud.add(balloon);
                cloud.add(ribbon);
            });

            return cloud;
        };

        var result = _makeBalloonCloud();
        UTILS.setPosition(result, {x: 0, y: PARAMS.ribbon.height, z: 0});
        return result;
    }
}