// Defines light functions
var LIGHT = {
    // Adds an ambient light to the scene
    // params: lightParams should be object with color key
    // returns: ambientLight
    createAmbientLight: function(scene, lightParams) {
        var ambientLight = new THREE.AmbientLight(lightParams.color);
        scene.add(ambientLight);
        return ambientLight;
    },

    // Adds a directional light to the scene
    // params: lightParams is object with color / intensity / position keys
    // returns: directionalLight
    createDirectionalLight: function(scene, lightParams) {
        var directionalLight = new THREE.DirectionalLight(
            lightParams.color, lightParams.intensity);
        UTILS.setPosition(directionalLight, lightParams.position);
        scene.add(directionalLight);
        return directionalLight;
    },

    // Adds a spotlight to the scene
    // params: lightParams is object with color / intensity / distance /
    // cutoffAngle / target / position keys
    // returns: spotLight
    createSpotLight: function(scene, lightParams) {
        var spotLightTarget = new THREE.Object3D();
        UTILS.setPosition(spotLightTarget, lightParams.target);
        scene.add(spotLightTarget);

        var spotLight = new THREE.SpotLight(
            lightParams.color,
            lightParams.intensity,
            lightParams.distance,
            lightParams.cutoffAngle);
        spotLight.castShadow = true;
        UTILS.setPosition(spotLight, lightParams.position);
        spotLight.target = spotLightTarget;
        scene.add(spotLight);
        return spotLight;
    }
};
