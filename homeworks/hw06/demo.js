var DEMO = (function() {
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
        var scene = new THREE.Scene();

        var renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        TW.mainInit(renderer, scene);
        document.getElementById('webgl-output').appendChild(renderer.domElement);

        var state = TW.cameraSetup(renderer,
                       scene,
                       SWALTER2_UP.getBoundingBox());

        light(scene);
        draw(scene);

        render();
        function render() {
            requestAnimationFrame(render);
            renderer.render(scene, state.cameraObject);
        }
    }

    function draw(scene) {
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
