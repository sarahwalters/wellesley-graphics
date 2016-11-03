// Defines parameters
function Params() {
    var gray = 0xaaaaaa;
    var white = 0xffffff;

    var barnWidth = 40;
    var barnHeight = 25;
    var barnLength = 100;

    this.getBoundingBox = function() {
        return {
            minx: 0, maxx: barnWidth,
            miny: 0, maxy: barnHeight,
            minz: -barnLength, maxz: 0
        };
    };

    this.barnDimensions = {
        width: barnWidth,
        height: barnHeight,
        length: barnLength
    };

    // light configuration
    this.ambientOn = true;
    this.ambientLight = {
        on: true,
        color: gray
    };

    this.directionalOn = true;
    this.directionalLight = {
        on: true,
        color: white,
        intensity: 0.6,
        position: {
            x: barnWidth / 2,
            y: barnHeight * 1.5,
            z: 50
        }
    };

    // textureIndices[i] is n, where n is an index into texturePaths
    this.textureIndices = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];
    this.texturePaths = ['textures/barnSiding.jpg', 'textures/barnRoofing.jpg'];
    this.triangularFaces = [2, 5]; // indices of non-quad triangular faces

    this.mode = 'showLighting';
}


var UTILS = {
    setPosition: function(obj, position) {
        obj.position.set(position.x, position.y, position.z);
    },

    setRotation: function(obj, rotation) {
        obj.rotation.set(rotation.a, rotation.b, rotation.c);
    },

    addTextureCoords: function(barnGeom) {
        if (!barnGeom instanceof THREE.Geometry) {
            throw "not a THREE.Geometry: " + barnGeom;
        }

        // array of face descriptors
        var UVs = [];
        function faceCoords(as,at, bs,bt, cs,ct) {
            UVs.push( [ new THREE.Vector2(as,at),
                        new THREE.Vector2(bs,bt),
                        new THREE.Vector2(cs,ct)] );
        }

        // front
        faceCoords(0,0, 1,0, 1,1);
        faceCoords(0,0, 1,1, 0,1);
        faceCoords(0,1, 1,1, 1,1);  // special for the upper triangle
        // back.  Vertices are not quite analogous to the front, alas
        faceCoords(1,0, 0,1, 0,0);
        faceCoords(1,0, 1,1, 0,1);
        faceCoords(0,1, 1,1, 1,1);  // special for upper triangle
        //roof
        faceCoords(1,0, 1,1, 0,0);
        faceCoords(1,1, 0,1, 0,0);
        faceCoords(0,0, 1,0, 1,1);
        faceCoords(0,1, 0,0, 1,1);
        // sides
        faceCoords(1,0, 0,1, 0,0);
        faceCoords(1,1, 0,1, 1,0);
        faceCoords(1,0, 1,1, 0,0);
        faceCoords(1,1, 0,1, 0,0);
        // floor
        faceCoords(0,0, 1,0, 0,1);
        faceCoords(1,0, 1,1, 0,1);

        // Finally, attach this to the geometry
        barnGeom.faceVertexUvs = [UVs];
    },

    createTextureMaterial: function(barnGeom, params) {
        var mats = barnGeom.faces.map(function(face, i) {
            face.materialIndex = i;
            var textureIndex = params.textureIndices[i];

            if (params.triangularFaces.indexOf(i) > -1) {
                var uv = barnGeom.faceVertexUvs[0][i];
                uv[0].y = 1 - uv[0].y;
                uv[1].y = 1 - uv[1].y;
            }

            var material = new THREE.MeshPhongMaterial();
            material.map = params.textures[textureIndex];
            return material;
        });

        return new THREE.MeshFaceMaterial(mats);
    },

    createPlainMaterial: function() {
        return new THREE.MeshPhongMaterial({
            color: 0xaaaaaa,
            specular: 'white',
            shininess: 0
        });
    },

    // Builds a GUI which adjusts the parameters of the scene
    buildGui: function(scene, params, lightCallback, modeCallback) {
        var gui = new dat.GUI();

        // lights
        ['ambientOn', 'directionalOn'].map(function(key) {
            gui.add(params, key).onChange(function() { lightCallback(key); });
        });

        // mode
        gui.add(params, 'mode', ['showLighting', 'showResult']).onChange(function() { modeCallback(); });
    }
};
