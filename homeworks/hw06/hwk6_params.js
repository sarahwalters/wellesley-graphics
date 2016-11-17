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

    var texturePaths = ['./textures/clouds.jpg'];

    function getBoundingBox() {
        var balloonCloudRadius = balloon.height * meshRadius;
        return {
            minx: -house.width * 1.4, maxx: 0,
            miny: 0, maxy: house.width * 1.5 + balloonCloudRadius + ribbon.height,
            minz: -house.width * 0.25, maxz: house.width * 1.25
        };
    }

    var ambientLight = {
        color: 0xcccccc
    };

    var directionalLight = {
        color: 0xffffff,
        intensity: 0.6,
        position: {
            x: -100,
            y: 100,
            z: 30
        }
    };

    return {
        meshRadius: meshRadius,
        ribbon: ribbon,
        balloon: balloon,
        house: house,
        texturePaths: texturePaths,
        getBoundingBox: getBoundingBox,
        ambientLight: ambientLight,
        directionalLight: directionalLight
    };
})();
