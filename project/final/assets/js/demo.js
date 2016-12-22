var DEMO = {
	defaultShipAngle: - Math.PI / 4,
	shipWithSail: null,
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null,
	ms_Scene: null,
	ms_Controls: null,
	ms_Water: null,

    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),

	initialize: function initialize(inIdCanvas, inParameters) {
		this.ms_Canvas = $('#'+inIdCanvas);

		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();
		this.ms_Scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8, -inParameters.height);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));

		// Initialize Orbit control
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		this.ms_Controls.userPan = false;
		this.ms_Controls.userPanSpeed = 0.0;
		this.ms_Controls.maxDistance = 5000.0;
		this.ms_Controls.maxPolarAngle = Math.PI * 0.495;

		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffffaa, 1);
		directionalLight.position.set(-600, 300, 600);
		this.ms_Scene.add(directionalLight);

		var ambientLight =  new THREE.AmbientLight(0x333333);
		this.ms_Scene.add(ambientLight);

		// Create ship

		this.shipWithSail = new SWALTER2_PROJECT.ShipWithSail();
		this.shipWithSail.position.set(1500, 0, -1500);
		this.shipWithSail.rotation.set(0, this.defaultShipAngle, 0);
		this.ms_Scene.add(this.shipWithSail);

		// Load textures
		var waterNormals = new THREE.ImageUtils.loadTexture('assets/img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 50.0
		});
		this.aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10),
			this.ms_Water.material
		);
		this.aMeshMirror.add(this.ms_Water);
		this.aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.ms_Scene.add(this.aMeshMirror);

		this.loadSkyBox();
	},

	loadSkyBox: function loadSkyBox() {
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

		this.ms_Scene.add(aSkybox);
	},

	display: function display() {
		SWALTER2_PROJECT.render();
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},

	update: function update() {
		this.aMeshMirror.rotation.z = WINDOW.ms_WaveDirection;

		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;

		// Do the geometry to "drive" the position/direction of the boat using the direction of the waves.
		// this.aMeshMirror.rotation.z represents the direction of the waves.
		// -> when it's equal to zero, the waves move towards the back right corner.
		// -> increasing it rotates the direction of the waves counterclockwise.
		var defaultShipDirection = new THREE.Vector2(
			Math.cos(this.defaultShipAngle),
			Math.sin(this.defaultShipAngle)
		);
		var rot = this.aMeshMirror.rotation.z;
		var shipDirection = new THREE.Vector2(
			- defaultShipDirection.x * Math.cos(rot) - defaultShipDirection.y * Math.sin(rot),
			- defaultShipDirection.y * Math.cos(rot) + defaultShipDirection.x * Math.sin(rot)
		);
		this.shipWithSail.position.x = this.shipWithSail.position.x + shipDirection.x;
		this.shipWithSail.position.z = this.shipWithSail.position.z + shipDirection.y;
		this.shipWithSail.rotation.y = this.defaultShipAngle + rot;

		SWALTER2_PROJECT.simulate(Date.now());
		this.ms_Controls.update();
		this.display();
	},

	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}
};
