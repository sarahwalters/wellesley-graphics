(function() {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var container, stats;
    var camera, scene, renderer;

    var object;

    init();
    animate();

    function init() {

        container = document.createElement( 'div' );
        document.body.appendChild( container );

        // scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

        // camera
        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.x = 1000;
        camera.position.y = 300;
        camera.position.z = 1500;
        scene.add( camera );

        // lights
        var light, materials;

        scene.add( new THREE.AmbientLight( 0x666666 ) );

        light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
        light.position.set( 50, 200, 100 );
        light.position.multiplyScalar( 1.3 );

        light.castShadow = true;

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        var d = 300;

        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.far = 1000;

        scene.add( light );

        // sail
        var sail = new SWALTER2_PROJECT.Sail();
        scene.add(sail);

        // ship
        var ship = new SWALTER2_PROJECT.Ship();
        scene.add(ship);

        // ground
        var loader = new THREE.TextureLoader();
        var groundTexture = loader.load( 'textures/grasslight-big.jpg' );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;

        var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );

        var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 20000, 20000 ), groundMaterial );
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add( mesh );

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( scene.fog.color );

        container.appendChild( renderer.domElement );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;

        renderer.shadowMap.enabled = true;

        // controls
        var controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 1000;
        controls.maxDistance = 7500;

        // performance monitor
        stats = new Stats();
        container.appendChild( stats.dom );

        //
        window.addEventListener( 'resize', onWindowResize, false );
    }

    //
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    //
    function animate() {
        requestAnimationFrame( animate );
        var time = Date.now();
        SWALTER2_PROJECT.simulate( time );
        render();
        stats.update();
    }

    function render() {
        SWALTER2_PROJECT.render();
        camera.lookAt( scene.position );
        renderer.render( scene, camera );
    }
})();
