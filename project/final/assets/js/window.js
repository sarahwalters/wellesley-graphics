var WINDOW = (function() {
    var ms_Width = 0;
    var ms_Height = 0;
    var ms_RotationStepSize = 0.005;            // how much one keypress changes the wave direction, in radians
    var ms_WaveDirection = 0;
    var ms_Callbacks = {
        70: "toggleFullScreen()",        // Toggle fullscreen with "F"
        83: "rotateWavesCCW()",          // rotate waves counterclockwise with "S"
        68: "rotateWavesCW()"            // rotate waves clockwise with "D"
    };

    function initialize() {
        updateSize();

        // Create callbacks from keyboard
        $(document).keydown(function(inEvent) { callAction(inEvent.keyCode); }) ;
        $(window).resize(function(inEvent) {
            updateSize();
            resizeCallback(ms_Width, ms_Height);
        });
    }

    function updateSize() {
        ms_Width = $(window).width();
        ms_Height = $(window).height() - 4;
    }

    function callAction(inId) {
        if (inId in ms_Callbacks) {
            eval(ms_Callbacks[inId]);
            return false;
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (document.documentElement.requestFullscreen)
                document.documentElement.requestFullscreen();
            else if (document.documentElement.mozRequestFullScreen)
                document.documentElement.mozRequestFullScreen();
            else if (document.documentElement.webkitRequestFullscreen)
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        else  {
            if (document.cancelFullScreen)
                document.cancelFullScreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen)
                document.webkitCancelFullScreen();
        }
    }

    function rotateWavesCW() {
        ms_WaveDirection -= ms_RotationStepSize;
    }

    function rotateWavesCCW() {
        ms_WaveDirection += ms_RotationStepSize;
    }

    function resizeCallback(inWidth, inHeight) {}

    return {
        initialize: initialize,
        resizeCallback: resizeCallback,
        get_ms_Width: function() { return ms_Width; },
        get_ms_Height: function() { return ms_Height; },
        get_ms_WaveDirection: function() { return ms_WaveDirection; }
    };
})();
