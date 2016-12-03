var SWALTER2_PROJECT = (function() {
	var clothGeometry;

	function Sail() {
		var result = new THREE.Object3D();

		// cloth material
		var loader = new THREE.TextureLoader();
		var clothTexture = loader.load( 'textures/circuit_pattern.png' );
		clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
		clothTexture.anisotropy = 16;

		var clothMaterial = new THREE.MeshPhongMaterial( {
			specular: 0x030303,
			map: clothTexture,
			side: THREE.DoubleSide,
			alphaTest: 0.5
		} );

		// cloth geometry
		clothGeometry = new THREE.ParametricGeometry( clothFunction, cloth.w, cloth.h );
		clothGeometry.dynamic = true;

		var uniforms = { texture:  { value: clothTexture } };
		var vertexShader = document.getElementById( 'vertexShaderDepth' ).textContent;
		var fragmentShader = document.getElementById( 'fragmentShaderDepth' ).textContent;

		// cloth mesh
		object = new THREE.Mesh( clothGeometry, clothMaterial );
		object.position.set( 0, -250, 0 );
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
		mesh.position.x = 0;
		mesh.position.y = - 62;
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		var mesh = new THREE.Mesh( crossbarGeo, poleMat );
		mesh.position.y = - 250 + ( 750 / 2 );
		mesh.position.x = 0;
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		var mesh = new THREE.Mesh( crossbarGeo, poleMat );
		mesh.position.y = - 250 + (750 / 6);
		mesh.position.x = 0;
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		var mesh = new THREE.Mesh( capGeo, poleMat );
		mesh.position.y = - 250;
		mesh.position.x = 0;
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		result.add( mesh );

		return result;
	}

	function render() {
		var p = cloth.particles;

		for ( var i = 0, il = p.length; i < il; i ++ ) {

			clothGeometry.vertices[ i ].copy( p[ i ].position );

		}

		clothGeometry.computeFaceNormals();
		clothGeometry.computeVertexNormals();

		clothGeometry.normalsNeedUpdate = true;
		clothGeometry.verticesNeedUpdate = true;
	}

	function call_simulate(time) {
		simulate( time, clothGeometry );
	}

	return {
		Sail: Sail,
		render: render,
		simulate: call_simulate
	};
})();
