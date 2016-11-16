var UTILS = (function() {
    var exports = {};

    exports.setPosition = function(obj, position) {
        obj.position.set(position.x, position.y, position.z);
    };

    exports.setRotation = function(obj, rotation) {
        obj.rotation.set(rotation.a, rotation.b, rotation.c);
    };

    exports.callTwice = function(fn) {
        fn();
        fn();
    };

    // Returns a random hex color
    // From http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
    exports.getRandomColor = function() {
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

    return exports;
})();
