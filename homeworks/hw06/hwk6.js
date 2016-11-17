var HWK6 = (function() {
    var LIGHTPARAMS = {
        ambientLight: {
            color: 0xcccccc
        },

        directionalLight: {
            color: 0xffffff,
            intensity: 0.6,
            position: {
                x: -100,
                y: 100,
                z: 30
            }
        }
    };

    function init() {
        var bgScene = new THREE.Scene();
        var bgCam = new THREE.Camera();

        var scene = new THREE.Scene();

        var renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        TW.mainInit(renderer, scene);
        document.getElementById('webgl-output').appendChild(renderer.domElement);

        var state = TW.cameraSetup(renderer,
                       scene,
                       SWALTER2_UP.getBoundingBox());

        light(scene);
        TW.loadTextures(['./textures/clouds.jpg'], function(textures) {
            textures.map(function(texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                var aspectRatio = window.innerHeight / window.innerWidth;
                texture.repeat.set(250, 250 * aspectRatio);
            });
            draw(scene, bgScene, textures[0]);
        });

        render();
        function render() {
            requestAnimationFrame(render);
            renderer.autoClear = false;
            renderer.clear();
            renderer.render(bgScene, bgCam);
            renderer.render(scene, state.cameraObject);
        }
    }

    function draw(scene, bgScene, bgTexture) {
        var background = new SWALTER2_UP.Background(bgTexture);
        bgScene.add(background);

        var upHouse = new SWALTER2_UP.UpHouse();
        upHouse.rotation.set(0, -Math.PI / 2, 0);
        scene.add(upHouse);
    }

    function light(scene) {
        var pa = LIGHTPARAMS.ambientLight;
        var ambient = new THREE.AmbientLight(pa.color);
        scene.add(ambient);

        var pd = LIGHTPARAMS.directionalLight;
        var directional = new THREE.DirectionalLight(pd.color, pd.intensity);
        directional.position.set(pd.position.x, pd.position.y, pd.position.z);
        scene.add(directional);
    }

    return {
        init: init
    };
})();
