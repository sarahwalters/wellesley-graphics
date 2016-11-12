function Lights() {
    // Adds an ambient light to the scene
    // returns: ambientLight
    this.createAmbientLight = function(scene) {
        var ambientLight = new THREE.AmbientLight(PARAMS.ambientLight.color);
        return ambientLight;
    };

    // Adds a directional light to the scene
    // returns: directionalLight
    this.createDirectionalLight = function(scene) {
        var directionalLight = new THREE.DirectionalLight(
            PARAMS.directionalLight.color, PARAMS.directionalLight.intensity);
        UTILS.setPosition(directionalLight, PARAMS.directionalLight.position);
        return directionalLight;
    };
};
