var SWALTER2_PROJECT = (function() {
    var clothGeometry;

    // set up scene parameters
    var params = (function() {
        var loader = new THREE.TextureLoader();

        // pole parameters
        var poleSize = 6;
        var verticalPoleHeight = 375;
        var horizontalPoleLength = 255;
        var poleMat = new THREE.MeshPhongMaterial({
            color: 0xffffff, specular: 0x111111, shininess: 100
        });

        // sail cloth parameters
        var clothTexture = loader.load('assets/img/fabric.jpg');
        clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
        clothTexture.anisotropy = 16;
        var clothMaterial = new THREE.MeshPhongMaterial({
            specular: 0x030303,
            map: clothTexture,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        });

        var pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
                    110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];

        function constraintFunction(particle) {
            // keeps the sail in front of the plane the poles lie in
            pos = particle.position;
            if (pos.z < poleSize / 2) {
                pos.z = poleSize / 2;
            }
        }

        function windForceFunction(time) {
            var windStrength = Math.cos( time / 7000 ) * 20 + 40;
            var windForce = new THREE.Vector3(
                Math.abs( Math.sin( time / 2000 ) ),
                Math.abs( Math.cos( time / 3000 ) ),
                Math.abs( Math.sin( time / 1000 ) )
            );
            return windForce.normalize().multiplyScalar(windStrength);
        }

        // ship parameters
        // (for ship of dimension 1x1x1; use THREE.js scale method to reshape)
        var shipHalfControlPoints = [
            [ [-1/2,2/3,0], [-1/6,-1/3,0], [1/6,-1/3,0], [1/2,2/3,0] ],
            [ [-1/2,2/3,0], [-1/6,0,1], [1/6,0,1], [1/2,2/3,0] ],
            [ [-1/2,2/3,0], [-1/6,1/3,1], [1/6,1/3,1], [1/2,2/3,0] ],
            [ [-1/2,2/3,0], [-1/6,2/3,1], [1/6,2/3,1], [1/2,2/3,0] ]
        ];

        var shipBaseControlPoints = [
            [ [-1/6,0,0], [-1/18,0,-1/3], [1/18,0,-1/3], [1/6,0,0] ],
            [ [-1/6,0,0], [-1/18,0,-1/9], [1/18,0,-1/9], [1/6,0,0] ],
            [ [-1/6,0,0], [-1/18,0,1/9], [1/18,0,1/9], [1/6,0,0] ],
            [ [-1/6,0,0], [-1/18,0,1/3], [1/18,0,1/3], [1/6,0,0] ]
        ];

        var shipBaseHeight = 0.02;

        var shipDims = {length: 600, height: 90, width: 75};

        var shipTexture = loader.load('assets/img/wood.jpg');
        shipTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
        shipTexture.anisotropy = 16;
        var shipMaterial = new THREE.MeshPhongMaterial({
            specular: 0x030303,
            map: shipTexture,
            side: THREE.DoubleSide,
            alphaTest: 0.5
        });

        return {
            // pole parameters
            poleSize: poleSize,
            verticalPoleHeight: verticalPoleHeight,
            horizontalPoleLength: horizontalPoleLength,
            poleMat: poleMat,

            // sail cloth parameters
            pins: pins,
            clothTexture: clothTexture,
            clothMaterial: clothMaterial,
            constraintFunction: constraintFunction,
            windForceFunction: windForceFunction,

            // ship parameters
            shipHalfControlPoints: shipHalfControlPoints,
            shipBaseControlPoints: shipBaseControlPoints,
            shipBaseHeight: shipBaseHeight,
            shipMaterial: shipMaterial,
            shipDims: shipDims
        }
    })();

    // set up cloth simulator
    var CLOTH = new ClothSimulation(params.pins,
                                    params.windForceFunction,
                                    params.constraintFunction);

    // Origin is at center of base of vertical supporting pole
    // X axis runs parallel to horizontal supporting poles
    // Y axis runs along vertical supporting pole
    function Sail() {
        var result = new THREE.Object3D();

        // cloth geometry
        clothGeometry = new THREE.ParametricGeometry(CLOTH.clothFunction, CLOTH.w, CLOTH.h);
        clothGeometry.dynamic = true;

        var uniforms = { texture:  { value: params.clothTexture } };
        var vertexShader = document.getElementById( 'vertexShaderDepth' ).textContent;
        var fragmentShader = document.getElementById( 'fragmentShaderDepth' ).textContent;

        // cloth mesh
        object = new THREE.Mesh(clothGeometry, params.clothMaterial);
        object.position.set(0, 0, params.poleSize / 2);
        object.castShadow = true;
        result.add( object );

        object.customDepthMaterial = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide
        } );

        // poles
        var verticalPoleGeo = new THREE.BoxGeometry(params.poleSize, params.verticalPoleHeight, params.poleSize);
        var crossbarGeo = new THREE.BoxGeometry(params.horizontalPoleLength, params.poleSize, params.poleSize);
        var capGeo = new THREE.BoxGeometry(params.poleSize * 2, params.poleSize * 2, params.poleSize * 2);

        var verticalPole = new THREE.Mesh(verticalPoleGeo, params.poleMat);
        verticalPole.position.set(0, params.verticalPoleHeight / 2, 0);
        verticalPole.receiveShadow = true;
        verticalPole.castShadow = true;
        result.add(verticalPole);

        var topCrossbar = new THREE.Mesh(crossbarGeo, params.poleMat);
        topCrossbar.position.set(0, params.verticalPoleHeight, 0);
        topCrossbar.receiveShadow = true;
        topCrossbar.castShadow = true;
        result.add(topCrossbar);

        var bottomCrossbar = new THREE.Mesh(crossbarGeo, params.poleMat);
        bottomCrossbar.position.set(0, params.verticalPoleHeight / 3, 0);
        bottomCrossbar.receiveShadow = true;
        bottomCrossbar.castShadow = true;
        result.add(bottomCrossbar);

        var cap = new THREE.Mesh(capGeo, params.poleMat);
        cap.position.set(0, 0, 0);
        cap.receiveShadow = true;
        cap.castShadow = true;
        result.add(cap);

        return result;
    }

    function Ship() {
        var result = new THREE.Object3D();

        var shipHalfGeo = new THREE.BezierSurfaceGeometry(params.shipHalfControlPoints, 10, 10);
        var shipBaseGeo = new THREE.BezierSurfaceGeometry(params.shipBaseControlPoints, 10, 10);

        var half1 = new THREE.Mesh(shipHalfGeo, params.shipMaterial);
        half1.receiveShadow = true;
        result.add(half1);

        var half2 = new THREE.Mesh(shipHalfGeo, params.shipMaterial);
        half2.rotation.set(0, Math.PI, 0);
        half2.receiveShadow = true;
        result.add(half2);

        var base = new THREE.Mesh(shipBaseGeo, params.shipMaterial);
        base.position.set(0, params.shipBaseHeight, 0);
        base.receiveShadow = true;
        result.add(base);

        result.scale.set(params.shipDims.length, params.shipDims.height, params.shipDims.width);
        result.rotation.set(0, Math.PI / 2, 0);
        return result;
    }

    function render() {
        var p = CLOTH.particles;

        for ( var i = 0, il = p.length; i < il; i ++ ) {
            clothGeometry.vertices[ i ].copy( p[ i ].position );
        }

        clothGeometry.computeFaceNormals();
        clothGeometry.computeVertexNormals();

        clothGeometry.normalsNeedUpdate = true;
        clothGeometry.verticesNeedUpdate = true;
    }

    function ShipWithSail() {
        var result = new THREE.Object3D();

        var sail = new Sail();
        result.add(sail);

        var ship = new Ship();
        result.add(ship);

        return result;
    }

    function simulate(time) {
        // run simulate method on the geometry
        CLOTH.simulate( time, clothGeometry );
    }

    return {
        ShipWithSail: ShipWithSail,
        render: render,
        simulate: simulate,
        toggleWind: CLOTH.toggleWind
    };
})();
