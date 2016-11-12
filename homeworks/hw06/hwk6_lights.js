var LIGHT = {
    // Adds an ambient light to the scene
    // params: lightParams should be object with color key
    // returns: ambientLight
    createAmbientLight: function(scene, lightParams) {
        var ambientLight = new THREE.AmbientLight(lightParams.color);
        return ambientLight;
    },

    // Adds a directional light to the scene
    // params: lightParams is object with color / intensity / position keys
    // returns: directionalLight
    createDirectionalLight: function(scene, lightParams) {
        var directionalLight = new THREE.DirectionalLight(
            lightParams.color, lightParams.intensity);
        UTILS.setPosition(directionalLight, lightParams.position);
        return directionalLight;
    }
};
