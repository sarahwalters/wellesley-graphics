function Params() {
    this.meshRadius = 4;
    this.ribbon = {
        height: 75, // distance from where ribbons gather to center of balloon cloud
        color: 0xcccccc
    };
    this.balloon = {
        height: 10,
        shininess: 30,
        opacity: 0.7
    };

    this.getBoundingBox = function() {
        var balloonCloudRadius = this.balloon.height * this.meshRadius;
        return {
            minx: -balloonCloudRadius, maxx: balloonCloudRadius,
            miny: -0, maxy: balloonCloudRadius + this.ribbon.height,
            minz: -balloonCloudRadius, maxz: balloonCloudRadius
        };
    };

    this.ambientLight = {
        on: true,
        color: 0xffffff
    };

    this.directionalLight = {
        on: true,
        color: 0xffffff,
        intensity: 0.6,
        position: {
            x: 1000,
            y: 1000,
            z: 1000
        }
    };
}

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
