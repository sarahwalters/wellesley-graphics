var MESH = {
    // Creates a barn mesh with material dependent on params.mode.
    // Origin is front bottom left corner of one of the pentagonal faces.
    createBarnMesh: function(params) {
        var barnGeometry = TW.createBarn(params.barnDimensions.width,
                                         params.barnDimensions.height,
                                         params.barnDimensions.length);
        UTILS.addTextureCoords(barnGeometry);
        var barnMaterial = (params.mode == "showResult") ?
                            UTILS.createTextureMaterial(barnGeometry, params) :
                            UTILS.createPlainMaterial();
        return new THREE.Mesh(barnGeometry, barnMaterial);
    }
};
