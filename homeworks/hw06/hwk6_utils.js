function Params() {
    this.meshRadius = 4;
    this.ribbon = {
        height: 75, // vertical distance from where ribbons gather to center of balloon cloud
        color: 0xcccccc
    };
    this.balloon = {
        height: 10,
        shininess: 30,
        opacity: 0.7
    };
    this.house = {
        width: 50
    };

    this.getBoundingBox = function() {
        var balloonCloudRadius = this.balloon.height * this.meshRadius;
        return {
            minx: -this.house.width * 1.4, maxx: 0,
            miny: 0, maxy: this.house.width * 1.5 + balloonCloudRadius + this.ribbon.height,
            minz: -this.house.width * 0.25, maxz: this.house.width * 1.25
        };
    };

    this.ambientLight = {
        color: 0xcccccc
    };

    this.directionalLight = {
        color: 0xffffff,
        intensity: 0.6,
        position: {
            x: -100,
            y: 100,
            z: 30
        }
    };
}

function Utils() {
    this.setPosition = function(obj, position) {
        obj.position.set(position.x, position.y, position.z);
    };

    this.setRotation = function(obj, rotation) {
        obj.rotation.set(rotation.a, rotation.b, rotation.c);
    };

    this.callTwice = function(fn) {
        fn();
        fn();
    };

    // Returns a random hex color
    // From http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
    this.getRandomColor = function() {
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
    };
};
