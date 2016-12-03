var SWALTER2_PROJECT = (function() {
	var clothGeometry;

	// set up cloth simulator
	var pins = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
				 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];
	function windForceFunction(time) {
		var windStrength = Math.cos( time / 7000 ) * 20 + 40;
		var windForce = new THREE.Vector3(
			Math.abs( Math.sin( time / 2000 ) ),
			Math.abs( Math.cos( time / 3000 ) ),
			Math.abs( Math.sin( time / 1000 ) )
		);
		return windForce.normalize()
			            .multiplyScalar( windStrength );
	}
	function constraintFunction(particle) {
		// keeps the sail in front of the plane the poles lie in
		pos = particle.position;
		if ( pos.z < 5 / 2 ) {
			pos.z = 5 / 2;
		}
	}
	var CLOTH = new ClothSimulation(pins, windForceFunction, constraintFunction);

	// Origin is at center of base of vertical supporting pole
	// X axis runs parallel to horizontal supporting poles
	// Y axis runs along vertical supporting pole
	function Sail() {
		var result = new THREE.Object3D();

		// cloth material
		var loader = new THREE.TextureLoader();
		var clothTexture = loader.load( 'textures/fabric.jpg' );
		clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
		clothTexture.anisotropy = 16;

		var clothMaterial = new THREE.MeshPhongMaterial( {
			specular: 0x030303,
			map: clothTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5
		} );

		// cloth geometry
		clothGeometry = new THREE.ParametricGeometry( CLOTH.clothFunction, CLOTH.w, CLOTH.h );
		clothGeometry.dynamic = true;

		var uniforms = { texture:  { value: clothTexture } };
		var vertexShader = document.getElementById( 'vertexShaderDepth' ).textContent;
		var fragmentShader = document.getElementById( 'fragmentShaderDepth' ).textContent;

		// cloth mesh
		object = new THREE.Mesh( clothGeometry, clothMaterial );
		object.position.set(0, 0, 5 / 2);
		object.castShadow = true;
		result.add( object );

		object.customDepthMaterial = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.DoubleSide
		} );

		// poles
		var poleGeo = new THREE.BoxGeometry( 5, 375, 5 );
		var crossbarGeo = new THREE.BoxGeometry( 255, 5, 5 );
		var capGeo = new THREE.BoxGeometry( 10, 10, 10 );
		var poleMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 100 } );

		var mesh = new THREE.Mesh( poleGeo, poleMat );
		mesh.position.set(0, 375 / 2, 0);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		var mesh = new THREE.Mesh( crossbarGeo, poleMat );
		mesh.position.set(0, 750 / 2, 0);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		var mesh = new THREE.Mesh( crossbarGeo, poleMat );
		mesh.position.set(0, 750 / 6, 0);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		var mesh = new THREE.Mesh( capGeo, poleMat );
		mesh.position.set(0, 0, 0);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		return result;
	}

	function Ship() {
		var ballGeo = new THREE.SphereGeometry(5);

		var loader = new THREE.TextureLoader();
		var clothTexture = loader.load( 'textures/fabric.jpg' );
		var ballMat = new THREE.MeshPhongMaterial( {
			specular: 0x030303,
			map: clothTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5
		} );

		return new THREE.Mesh(ballGeo, ballMat);
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

	function simulate(time) {
		// run simulate method on the geometry
		CLOTH.simulate( time, clothGeometry );
	}

	return {
		Sail: Sail,
		Ship: Ship,
		render: render,
		simulate: simulate,
		toggleWind: CLOTH.toggleWind
	};
})();
