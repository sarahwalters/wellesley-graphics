/*
THREE.js model of the house from Pixar's Up.
Copyright (C) 2016 Sarah Walters (swalters4925@gmail.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var SWALTER2_UP = (function() {
    var PARAMS = (function() {
        var meshRadius = 4;
        var ribbon = {
            height: 75, // vertical distance from where ribbons gather to center of balloon cloud
            color: 0xcccccc
        };
        var balloon = {
            height: 10,
            shininess: 50,
            opacity: 0.7
        };
        var house = {
            width: 50
        };

        function getBoundingBox() {
            var balloonCloudRadius = balloon.height * meshRadius;
            return {
                minx: -house.width * 1.4, maxx: 0,
                miny: 0, maxy: house.width * 1.5 + balloonCloudRadius + ribbon.height,
                minz: -house.width * 0.25, maxz: house.width * 1.25
            };
        }

        return {
            meshRadius: meshRadius,
            ribbon: ribbon,
            balloon: balloon,
            house: house,
            getBoundingBox: getBoundingBox
        };
    })();

    var UTILS = {
        setPosition: function(obj, position) {
            obj.position.set(position.x, position.y, position.z);
        },

        setRotation: function(obj, rotation) {
            obj.rotation.set(rotation.a, rotation.b, rotation.c);
        },

        callTwice: function(fn) {
            fn();
            fn();
        },

        // Returns a random hex color
        // From http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
        getRandomColor: function() {
            var colors = [
                0xf442b9, // pink
                0xf44242, // red
                0xf47a42, // orange
                0xf4d142, // yellow
                0x8cf442, // lime green
                0x42e2f4, // light blue
                0x4274f4, // dark blue
                0x7d42f4 // purple
            ]
            return colors[Math.floor(Math.random() * colors.length)];
        }
    };


    // Origin is center of base of cone representing tie-off at bottom of balloon
    // Rotationally symmetrical about y axis, which points up through center of balloon
    function Balloon(position) {
        // "normalized" balloon profile bezier with a height of 1
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
            var balloonMaterial = new THREE.MeshPhongMaterial({
                color: UTILS.getRandomColor(),
                shininess: PARAMS.balloon.shininess,
                transparent: true,
                opacity: PARAMS.balloon.opacity
            });
            return new THREE.Mesh(balloonGeometry, balloonMaterial);
        };

        var result = _makeBalloon(PARAMS.balloon.height);

        // balloon is at position
        // ribbons join at (0, -PARAMS.ribbonHeight, 0)
        // this function returns a rotation for the balloon which lines its vertical axis up with its ribbon
        result.calculateRotation = function() {
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
    function Box(width, length, height, color, shininess) {
        shininess = shininess || 0;

        var boxGeometry = new THREE.BoxGeometry(width, length, height);
        boxGeometry.faces.map(function(face, i) {
            face.materialIndex = i;
        });

        var boxMaterial;
        if (color == null) {
            boxMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, shininess: shininess});
        } else if (typeof(color) == 'number') { // single color
            boxMaterial = new THREE.MeshPhongMaterial({color: color, shininess: shininess});
        } else { // array of colors
            var materials = color.map(function(c) {
                return new THREE.MeshPhongMaterial({color: c, shininess: shininess});
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

    // Origin is in center of door box
    // x axis is perpendicular to window; width along z and height along y
    function PaneBase(width, height, thickness, trimColor, paneColor, paneShininess) {
        var result = new THREE.Object3D();

        var trimThickness = thickness * 2;
        var trimWidth = thickness / 3;

        var pane = new Box(thickness, height, width, paneColor, paneShininess);
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

    // Origin is in center of window box
    // x axis is perpendicular to window; width along z and height along y
    function Window(width, height, thickness, trimColor, paneColor) {
        return PaneBase(width, height, thickness, trimColor, paneColor, 30);
    }

    function Door(width, height, thickness, color) {
        return PaneBase(width, height, thickness, color, color, 0);
    }

    // Origin is in the center of the bottom of the back face of the stairs
    // x axis runs parallel to step edge; y axis points upwards
    function Steps(width, height, color) {
        var result = new THREE.Object3D();
        var stepDepth = height / 3;

        var topStep = new Box(width, stepDepth, stepDepth, color);
        UTILS.setPosition(topStep, {x: 0, y: stepDepth * 5 / 2, z: stepDepth / 2});
        result.add(topStep);

        var middleStep = new Box(width, stepDepth, stepDepth * 2, color);
        UTILS.setPosition(middleStep, {x: 0, y: stepDepth * 3 / 2, z: stepDepth});
        result.add(middleStep);

        var bottomStep = new Box(width, stepDepth, height, color);
        UTILS.setPosition(bottomStep, {x: 0, y: stepDepth / 2, z: stepDepth * 3 / 2})
        result.add(bottomStep);

        return result;
    }

    // Entire house is parameterized by width
    // The "front" of the house is the side with the porch
    // Origin is in back right bottom corner
    function UpHouse() {
        var width = PARAMS.house.width;
        var result = new THREE.Object3D();

        var white = 0xffffff;
        var yellow = 0xfff07f;
        var pink = 0xf9acb9;
        var orange = 0xffbb7c;
        var babyBlue = 0xd7e0ef;
        var skyBlue = 0x8fb7f7;
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
        var crossBarnTopWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(crossBarnTopWindow, {x: width * 1.08, y: width * 0.95, z: width * 0.4});
        result.add(crossBarnTopWindow);

        var crossBarnBottomLeftWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(crossBarnBottomLeftWindow, {x: width * 1.08, y: width * 0.42, z: width * 0.6});
        result.add(crossBarnBottomLeftWindow);

        var crossBarnBottomMiddleWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(crossBarnBottomMiddleWindow, {x: width * 1.08, y: width * 0.42, z: width * 0.4});
        result.add(crossBarnBottomMiddleWindow);

        var crossBarnBottomRightWindow = new Window(width * 0.12, width * 0.2, width * 0.05, pink, skyBlue);
        UTILS.setPosition(crossBarnBottomRightWindow, {x: width * 1.08, y: width * 0.42, z: width * 0.2});
        result.add(crossBarnBottomRightWindow);

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

        /** STEPS **/
        var frontSteps = new Steps(width * 0.4, width * 0.15, taupe);
        UTILS.setPosition(frontSteps, {x: width * 1.1, y: 0, z: width * 0.9});
        UTILS.setRotation(frontSteps, {a: 0, b: Math.PI / 2, c: 0});
        result.add(frontSteps);

        var backSteps = new Steps(width * 0.4, width * 0.15, taupe);
        UTILS.setPosition(backSteps, {x: width * 0, y: 0, z: width * 0.9});
        UTILS.setRotation(backSteps, {a: 0, b: -Math.PI / 2, c: 0});
        result.add(backSteps);

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
        // Adapted from http://stackoverflow.com/questions/11178637/threejs-creating-a-background-image-that-exactly-fits-the-window
        var backgroundGeometry = new THREE.PlaneGeometry(500, 500, 0);
        var backgroundMaterial = new THREE.MeshBasicMaterial({map: texture});

        // The bg plane shouldn't care about the z-buffer
        backgroundMaterial.depthTest = false;
        backgroundMaterial.depthWrite = false;

        return new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    }

    return {
        Background: Background,
        UpHouse: UpHouse,
        getBoundingBox: PARAMS.getBoundingBox
    };
})();