/// Wrapper which ensures that canvas is supported
function main(mainParams) {
	var canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var innerParams = {
		tileSize: mainParams.tileSize,
		numTilesX: Math.floor(canvas.width / mainParams.tileSize),
		numTilesY: Math.floor(canvas.height / mainParams.tileSize)
	};

	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		draw(ctx, innerParams);
		canvas.addEventListener('mousemove', makeHandler(canvas, ctx, innerParams));
	} else {
		alert('Browser does not support canvases');
	}
}

function draw(ctx, params) {
	for (var i = 0; i < params.numTilesX; i++) {
		for (var j = 0; j < params.numTilesY; j++) {
			colorSquare(ctx, {x: i, y: j}, params);
		}
	}
}

function colorSquare(ctx, coords, params, color) {
	ctx.save(); // save original canvas position
	ctx.fillStyle = color || getColor(coords, params);
	ctx.translate(params.tileSize * coords.x, params.tileSize * coords.y);
	ctx.fillRect(0, 0, params.tileSize, params.tileSize);
	ctx.restore(); // restore original canvas position
}

function getColor(coords, params) {
	var red = rescale(coords.x, {min: 0, max: params.numTilesX}, {min: 0, max: 255});
	var blue = rescale(coords.y, {min: 0, max: params.numTilesY}, {min: 0, max: 255});
	return colorUtils.buildColorString(red, 0, blue);
}

function rescale(n, sourceInterval, targetInterval) {
	var proportion = (n - sourceInterval.min) / (sourceInterval.max - sourceInterval.min);
	var scaled = targetInterval.min + (targetInterval.max - targetInterval.min) * proportion;
	return Math.floor(scaled);
}

function getMouseCoordinates(canvas, evt, params) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: Math.floor((evt.clientX - rect.left) / params.tileSize),
		y: Math.floor((evt.clientY - rect.top) / params.tileSize)
	};
}

function makeHandler(canvas, ctx, params) {
	return function(evt) {
		var mouseCoords = getMouseCoordinates(canvas, evt, params);

		// turn square black
		colorSquare(ctx, mouseCoords, params, "rgb(0, 0, 0)");

		// after timeout, turn square back to original color
		setTimeout(function() {
			colorSquare(ctx, mouseCoords, params);
		}, 1000);
	};
}

var colorUtils = {
	buildColorString: function(r, g, b) {
		return "rgb(" + r + ", " + g + ", " + b + ")";
	}
}
