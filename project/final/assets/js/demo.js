var DEMO = (function() {
    var defaultShipAngle = - Math.PI / 4;
    var shipWithSail = null;
    var aMeshMirror = null;
    var ms_Canvas = null;
    var ms_Renderer = null;
    var ms_Camera = null;
    var ms_Scene = null;
    var ms_Controls = null;
    var ms_Water = null;

    function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    }

    function initialize(inIdCanvas, inParameters) {
        ms_Canvas = $('#'+inIdCanvas);

        // Initialize Renderer, Camera, Projector and Scene
        ms_Renderer = enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
        ms_Canvas.html(ms_Renderer.domElement);
        ms_Scene = new THREE.Scene();
        ms_Scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

        ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.get_ms_Width() / WINDOW.get_ms_Height(), 0.5, 3000000);
        ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8, -inParameters.height);
        ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Initialize Orbit control
        ms_Controls = new THREE.OrbitControls(ms_Camera, ms_Renderer.domElement);
        ms_Controls.userPan = false;
        ms_Controls.userPanSpeed = 0.0;
        ms_Controls.maxDistance = 5000.0;
        ms_Controls.maxPolarAngle = Math.PI * 0.495;

        // Add light
        var directionalLight = new THREE.DirectionalLight(0xffffaa, 1);
        directionalLight.position.set(-600, 300, 600);
        ms_Scene.add(directionalLight);

        var ambientLight =  new THREE.AmbientLight(0x333333);
        ms_Scene.add(ambientLight);

        // Create ship

        shipWithSail = new SWALTER2_PROJECT.ShipWithSail();
        shipWithSail.position.set(1500, 0, -1500);
        shipWithSail.rotation.set(0, defaultShipAngle, 0);
        ms_Scene.add(shipWithSail);

        // Load textures
        var waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg');
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

        // Create the water effect
        ms_Water = new THREE.Water(ms_Renderer, ms_Camera, ms_Scene, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            alpha:  1.0,
            sunDirection: directionalLight.position.normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 50.0
        });
        aMeshMirror = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10),
            ms_Water.material
        );
        aMeshMirror.add(ms_Water);
        aMeshMirror.rotation.x = - Math.PI * 0.5;
        ms_Scene.add(aMeshMirror);

        loadSkyBox();
    }

    function loadSkyBox() {
        var aCubeMap = THREE.ImageUtils.loadTextureCube([
          'assets/img/px.jpg',
          'assets/img/nx.jpg',
          'assets/img/py.jpg',
          'assets/img/ny.jpg',
          'assets/img/pz.jpg',
          'assets/img/nz.jpg'
        ]);
        aCubeMap.format = THREE.RGBFormat;

        var aShader = THREE.ShaderLib['cube'];
        aShader.uniforms['tCube'].value = aCubeMap;

        var aSkyBoxMaterial = new THREE.ShaderMaterial({
          fragmentShader: aShader.fragmentShader,
          vertexShader: aShader.vertexShader,
          uniforms: aShader.uniforms,
          depthWrite: false,
          side: THREE.BackSide
        });

        var aSkybox = new THREE.Mesh(
          new THREE.BoxGeometry(1000000, 1000000, 1000000),
          aSkyBoxMaterial
        );

        ms_Scene.add(aSkybox);
    }

    function display() {
        SWALTER2_PROJECT.render();
        ms_Water.render();
        ms_Renderer.render(ms_Scene, ms_Camera);
    }

    function update() {
        aMeshMirror.rotation.z = WINDOW.get_ms_WaveDirection();

        ms_Water.material.uniforms.time.value += 1.0 / 60.0;

        // Do the geometry to "drive" the position/direction of the boat using the direction of the waves.
        // aMeshMirror.rotation.z represents the direction of the waves.
        // -> when it's equal to zero, the waves move towards the back right corner.
        // -> increasing it rotates the direction of the waves counterclockwise.
        var defaultShipDirection = new THREE.Vector2(
            Math.cos(defaultShipAngle),
            Math.sin(defaultShipAngle)
        );
        var rot = aMeshMirror.rotation.z;
        var shipDirection = new THREE.Vector2(
            - defaultShipDirection.x * Math.cos(rot) - defaultShipDirection.y * Math.sin(rot),
            - defaultShipDirection.y * Math.cos(rot) + defaultShipDirection.x * Math.sin(rot)
        );
        shipWithSail.position.x = shipWithSail.position.x + shipDirection.x;
        shipWithSail.position.z = shipWithSail.position.z + shipDirection.y;
        shipWithSail.rotation.y = defaultShipAngle + rot;

        SWALTER2_PROJECT.simulate(Date.now());
        ms_Controls.update();
        display();
    }

    function resize(inWidth, inHeight) {
        ms_Camera.aspect =  inWidth / inHeight;
        ms_Camera.updateProjectionMatrix();
        ms_Renderer.setSize(inWidth, inHeight);
        ms_Canvas.html(ms_Renderer.domElement);
        display();
    }

    return {
        initialize: initialize,
        update: update,
        resize: resize
    };
})();
