var SHAPES = (function() {
    // Origin is center of base of cone representing tie-off at bottom of balloon
    // Rotationally symmetrical about y axis, which points up through center of balloon
    function Balloon(position) {
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
    }

    function Ribbon(balloonPosition) {
        var ribbonGeometry = new THREE.Geometry();
        ribbonGeometry.vertices.push(
            new THREE.Vector3(balloonPosition.x, balloonPosition.y, balloonPosition.z),
            new THREE.Vector3(0, -PARAMS.ribbon.height, 0));
        var ribbonMaterial = new THREE.LineBasicMaterial({
            color: PARAMS.ribbon.color
        });
        return new THREE.Line(ribbonGeometry, ribbonMaterial);
    }

    // origin is where the balloons' ribbons gather
    // y axis points up towards the top of the cloud
    function BalloonCloud() {
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
                var balloon = new Balloon(position);
                UTILS.setPosition(balloon, position);
                var rotation = balloon.calculateRotation();
                UTILS.setRotation(balloon, rotation);
                var ribbon = new Ribbon(position);
                cloud.add(balloon);
                cloud.add(ribbon);
            });

            return cloud;
        };

        var result = new THREE.Object3D();
        var cloud = _makeBalloonCloud();
        UTILS.setPosition(cloud, {x: 0, y: PARAMS.ribbon.height, z: 0});
        result.add(cloud);
        return result;
    }

    // Origin is at one of the lower corners; length along z axis and width along x axis
    // Has 16 triangular faces
    function Barn(width, length, height, roofProportion, colors) {
        var extrudeSettings = {
            amount: length,
            bevelEnabled: false
        };

        var roofStartY = 1 - roofProportion;
        var pts = [[0,0], [1,0], [1,roofStartY], [0.5,1], [0,roofStartY], [0,0]].map(function(pt) {
            return new THREE.Vector2(pt[0] * width, pt[1] * height);
        });
        var shape = new THREE.Shape(pts);
        var barnGeometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
        barnGeometry.faces.map(function(face, i) {
            face.materialIndex = i;
        });

        var materials = colors.map(function(color) {
            return new THREE.MeshLambertMaterial({color: color});
        });
        var barnMaterial = new THREE.MeshFaceMaterial(materials);

        var mesh = new THREE.Mesh(barnGeometry, barnMaterial);
        return mesh;
    }

    // Origin is at the center; length along z axis and width along x axis
    function Box(width, length, height, color) {
        var boxGeometry = new THREE.BoxGeometry(width, length, height);
        boxGeometry.faces.map(function(face, i) {
            face.materialIndex = i;
        });

        var boxMaterial;
        if (color == null) {
            boxMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
        } else if (typeof(color) == 'number') { // single color
            boxMaterial = new THREE.MeshLambertMaterial({color: color});
        } else { // array of colors
            var materials = color.map(function(c) {
                return new THREE.MeshLambertMaterial({color: c});
            });
            boxMaterial = new THREE.MeshFaceMaterial(materials);
        }
        return new THREE.Mesh(boxGeometry, boxMaterial);
    }

    // Origin is at center of base of chimney
    function Chimney(width, height, color) {
        var result = new THREE.Object3D();

        var stem = new Box(width, height, width, color);
        UTILS.setPosition(stem, {x: 0, y: height / 2, z: 0});
        result.add(stem);

        var top = new Box(width * 1.2, height * 0.3, width * 1.2, color);
        UTILS.setPosition(top, {x: 0, y: height - height * 0.2, z: 0});
        result.add(top);

        return result;
    }

    // Origin is at center of base of post
    // y axis runs up through post
    function Post(radius, height, color) {
        var result = new THREE.Object3D();

        var postGeometry = new THREE.CylinderGeometry(radius, radius, height, 20, 20);
        var postMaterial = new THREE.MeshLambertMaterial({color: color});
        var postMesh = new THREE.Mesh(postGeometry, postMaterial);
        UTILS.setPosition(postMesh, {x: 0, y: height / 2, z: 0});
        result.add(postMesh);

        return result;
    }

    // Origin is in center of window box
    // x axis is perpendicular to window; width along z and height along y
    function Window(width, height, thickness, trimColor, paneColor) {
        var result = new THREE.Object3D();

        var trimThickness = thickness * 2;
        var trimWidth = thickness / 3;

        var pane = new Box(thickness, height, width, paneColor);
        result.add(pane);

        var frameTop = new Box(trimThickness, trimWidth, width, trimColor);
        UTILS.setPosition(frameTop, {x: 0, y: height / 2, z: 0});
        result.add(frameTop);

        var frameMiddle = new Box(trimThickness, trimWidth, width, trimColor);
        result.add(frameMiddle);

        var frameBottom = new Box(trimThickness, trimWidth, width, trimColor);
        UTILS.setPosition(frameBottom, {x: 0, y: -height / 2, z: 0});
        result.add(frameBottom);

        var frameLeft = new Box(trimThickness, height + trimWidth, trimWidth, trimColor);
        UTILS.setPosition(frameLeft, {x: 0, y: 0, z: width / 2});
        result.add(frameLeft);

        var frameRight = new Box(trimThickness, height + trimWidth, trimWidth, trimColor);
        UTILS.setPosition(frameRight, {x: 0, y: 0, z: -width / 2});
        result.add(frameRight);

        return result;
    }

    // Origin is in center of door box
    // x axis is perpendicular to window; width along z and height along y
    function Door(width, height, thickness, color) {
        // A door is modeled as a window with trim the same color as the pane
        return Window(width, height, thickness, color, color);
    }

    // Entire house is parameterized by width
    // The "front" of the house is the side with the porch
    // Origin is in back right bottom corner
    function UpHouse(width) {
        var result = new THREE.Object3D();

        var white = 0xffffff;
        var yellow = 0xfff07f;
        var pink = 0xf9acb9;
        var orange = 0xffbb7c;
        var babyBlue = 0xaccef9;
        var skyBlue = 0x4286f4;
        var taupe = 0x8e8e84;
        var brick = 0xb85a51;
        var black = 0x000000;

        /** BASE BARN **/
        var modBaseBarnColors = [
            pink, pink, pink, pink, pink, pink, pink, pink, pink, pink, pink, // pentagonal face
            yellow, yellow, yellow, yellow, yellow, yellow, yellow, yellow, yellow, // pentagonal face with cutout
            babyBlue, babyBlue, babyBlue, babyBlue, babyBlue, babyBlue, babyBlue, // front rectangle, with cutout
            taupe, taupe, taupe, taupe, taupe, taupe, taupe, taupe, // roof
            babyBlue, babyBlue, // back rectangle
            taupe, taupe, taupe, taupe, taupe, taupe, // base
            orange, orange, orange, // back face of cutout
            orange, orange, // top face of cutout
            pink, pink, pink // side face of cutout
        ];
        var baseBarn = new Barn(width, width * 1.4, width * 1.2, 0.4, modBaseBarnColors);
        var baseBarnBSP = new ThreeBSP(baseBarn);
        var entryway = new Box(width * 0.5, width * 0.5, width * 0.7);
        UTILS.setPosition(entryway, {x: width, y: width * 0.25, z: width * 1.05});
        var entrywayBSP = new ThreeBSP(entryway);
        var modBaseBarnBSP = baseBarnBSP.subtract(entrywayBSP);
        var modBaseBarn = modBaseBarnBSP.toMesh();
        modBaseBarn.geometry.computeFaceNormals();
        modBaseBarn.geometry.computeVertexNormals();
        modBaseBarn.geometry.faces.map(function(face, i) {
            face.materialIndex = i;
        });
        modBaseBarn.material = baseBarn.material;
        result.add(modBaseBarn);

        /** CROSS BARN **/
        var crossBarnColors = [
            pink, pink, pink, // one pentagonal face
            yellow, yellow, yellow, // the other pentagonal face
            babyBlue, babyBlue, // the front face
            taupe, taupe, taupe, taupe, // the roof
            pink, pink, // the back face
            taupe, taupe // the underside
        ];
        var crossBarn = new Barn(width * 0.6, width * 1.2, width * 1.3, 0.45, crossBarnColors);
        UTILS.setPosition(crossBarn, {x: -width * 0.1, y: 0, z: width * 0.7});
        UTILS.setRotation(crossBarn, {a: 0, b: Math.PI / 2, c: 0});
        result.add(crossBarn);

        /** GABLE **/
        var gableColors = [
            white, white, white, // one pentagonal face (not visible)
            yellow, yellow, yellow, // the other pentagonal face
            orange, orange, // the front face
            taupe, taupe, taupe, taupe, // the roof
            orange, orange, // the back face
            white, white // the underside (not visible)
        ];
        var gable = new Barn(width * 0.3, width * 0.3, width * 0.3, 0.4, gableColors);
        UTILS.setPosition(gable, {x: width * 0.55, y: width * 0.85, z: width * 1.15});
        UTILS.setRotation(gable, {a: 0, b: Math.PI / 2, c: 0});
        result.add(gable);

        /** PORCH **/
        var porchColors = [
            babyBlue, babyBlue, // front of box
            white, white, // not visible
            taupe, taupe, // top of box
            taupe, taupe, // bottom of box
            yellow, yellow, // side of box
            white, white // not visible
        ];
        var porch = new Box(width * 0.35, width * 0.15, width * 0.7, porchColors);
        UTILS.setPosition(porch, {x: width * 0.925, y: width * 0.075, z: width * 1.05});
        result.add(porch);

        /** POSTS FOR PORCH **/
        var post1 = new Post(width * 0.02, width * 0.4, white);
        UTILS.setPosition(post1, {x: width * 0.96, y: width * 0.15, z: width * 1.35});
        result.add(post1);

        var post2 = new Post(width * 0.02, width * 0.4, white);
        UTILS.setPosition(post2, {x: width * 0.96, y: width * 0.15, z: width * 1.05});
        result.add(post2);

        /** WINDOWS **/
        var crossBarnWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(crossBarnWindow, {x: width * 1.08, y: width * 0.95, z: width * 0.4});
        result.add(crossBarnWindow);

        var gableWindow = new Window(width * 0.1, width * 0.14, width * 0.05, pink, skyBlue);
        UTILS.setPosition(gableWindow, {x: width * 0.83, y: width * 0.98, z: width});
        result.add(gableWindow);

        var porchWindow = new Window(width * 0.1, width * 0.14, width * 0.05, white, skyBlue);
        UTILS.setPosition(porchWindow, {x: width * 0.73, y: width * 0.35, z: width * 1.2});
        result.add(porchWindow);

        var topLeftWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(topLeftWindow, {x: width * 0.5, y: width * 0.95, z: width * 1.38});
        UTILS.setRotation(topLeftWindow, {a: 0, b: Math.PI / 2, c: 0});
        result.add(topLeftWindow);

        var bottomLeftWindow = new Window(width * 0.08, width * 0.15, width * 0.05, pink, skyBlue);
        UTILS.setPosition(bottomLeftWindow, {x: width * 0.2, y: width * 0.5, z: width * 1.38});
        UTILS.setRotation(bottomLeftWindow, {a: 0, b: Math.PI / 2, c: 0});
        result.add(bottomLeftWindow);

        var bottomBackWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(bottomBackWindow, {x: width * 0.02, y: width * 0.4, z: width * 1.18});
        UTILS.setRotation(bottomBackWindow, {a: Math.PI / 2, b: 0, c: 0});
        result.add(bottomBackWindow);

        var topBackWindow = new Window(width * 0.12, width * 0.2, width * 0.05, white, skyBlue);
        UTILS.setPosition(topBackWindow, {x: -width * 0.08, y: width * 0.95, z: width * 0.4});
        result.add(topBackWindow);

        /** DOORS **/
        var frontDoor = new Door(width * 0.2, width * 0.3, width * 0.05, brick);
        UTILS.setPosition(frontDoor, {x: width * 0.73, y: width * 0.3, z: width * 0.85});
        result.add(frontDoor);

        var backDoor = new Door(width * 0.2, width * 0.3, width * 0.05, brick);
        UTILS.setPosition(backDoor, {x: width * 0.02, y: width * 0.3, z: width * 0.85});
        result.add(backDoor);

        /** CHIMNEY **/
        var chimney = new Chimney(width * 0.15, width * 0.3, brick);
        UTILS.setPosition(chimney, {x: width * 0.5, y: width * 1.1, z: width * 0.65});
        result.add(chimney);

        /** BALLOON CLOUD **/
        var balloonCloud = new BalloonCloud();
        UTILS.setPosition(balloonCloud, {x: width * 0.5, y: width * 1.35, z: width * 0.65})
        result.add(balloonCloud);

        return result;
    }

    function Background(texture) {
        var backgroundGeometry = new THREE.PlaneGeometry(1000, 1000, 0);
        var backgroundMaterial = new THREE.MeshBasicMaterial({map: texture});
        return new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    }

    return {
        Background: Background,
        UpHouse: UpHouse
    };
})();
