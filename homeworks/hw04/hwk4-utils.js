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
    this.ambientOn = true;
    this.ambientLight = {
        on: true,
        color: gray
    }

    this.directionalOn = true;
    this.directionalLight = {
        on: true,
        color: white,
        intensity: 0.6,
        position: {
            x: sideLength * 0.6,
            y: sideLength * 0.9,
            z: sideLength
        }
    };

    this.spotlightOn = true;
    this.sconceLights = {
        on: true,
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

var UTILS = {
    setPosition: function(obj, position) {
        obj.position.set(position.x, position.y, position.z);
    },

    setRotation: function(obj, rotation) {
        obj.rotation.set(rotation.a, rotation.b, rotation.c);
    },

    // Builds a GUI which adjusts the parameters of the scene
    buildGui(scene, params, callback) {
        var gui = new dat.GUI();
        gui.add(params, 'ambientOn').onChange(function() { callback('ambientOn'); });
        gui.add(params, 'directionalOn').onChange(function() { callback('directionalOn'); });
        gui.add(params, 'spotlightOn').onChange(function() { callback('spotlightOn'); });
    }
};
