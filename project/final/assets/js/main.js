function mainLoop() {
    requestAnimationFrame(mainLoop);
    DEMO.update();
}

$(function() {
    WINDOW.initialize();

    var parameters = {
        width: 2000,
        height: 2000
    };

    DEMO.initialize('canvas-3d', parameters);

    WINDOW.resizeCallback = function(inWidth, inHeight) { DEMO.resize(inWidth, inHeight); };
    DEMO.resize(WINDOW.get_ms_Width(), WINDOW.get_ms_Height());

    mainLoop();
});
