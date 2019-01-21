/* 
    Created on : 20.01.2019, 16:46:52
    Author     : Dennis Lange
    Project    : Pixelscreensaver - ps

    POSSIBLE IMPROVEMENTS 
    - CREATE PIXEL AS CLASS  (TO GET RID OF 2 LOOPS)
      - PIXEL CAN MOVE & 
      - DRAW 
    - ALLOW USER TO PLAY AROUND WITH CONFIG FOR PIXELS

    IDEAS:
    - APPLY RANDOM CONFIG FOR PIXELS EACH TIME YOU LOAD THE PAGE
    - INSTEAD OF HSL AS COLOUR DRAW IMAGE OF SOMETHING
    - ENABLE DIFFRENT SHAPES ASWELL

*/

var ps = ps || {
    
    config : {
        canvas : {
            id: "pixelcanvas",
            appendToId: "canvassection",
            width: "500",
            height: "500",
            clearOnClick : true
        },

        pixels: {
            spawnAmount: 20,
            createPixelRateMil: 100,
            widthAndHeight : 10,
            gapBetweenSteps : 0,
            lineWidth : 10,
            maxLifetimeMil : 5000,
            minLifetimeMil : 1200,
            drawShape : "rect", // can either be rect for rectangles or arc for circles
            style : "fill", // can either be fill or stroke
            opacity: 0.8,
        }
    },
    
    data : {
        canvas : {
            placedCanvas : false  
        },
        pixels : []
    },
    
    
    canvas : {
        
        clearCanvas : function () {
            var context = ps.canvas.getContext();
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        },
        
        getContext : function() {
            var canvasconfig = ps.config.canvas;
            var canvas = document.getElementById(canvasconfig.id);
            var context = canvas.getContext("2d");
            return context;
        },
        
        placeCanvas: function () {
            var canvasconfig = ps.config.canvas;
            if (ps.data.canvas.placedCanvas === false) {
                var gc = document.createElement("canvas");
                gc.id = canvasconfig.id;
                gc.width = canvasconfig.width;
                gc.height = canvasconfig.height;
                var wrapperElement = document.getElementById(canvasconfig.appendToId);
                wrapperElement.appendChild(gc);
                ps.data.canvas.placedCanvas = true;
                // append onclick clear if set in settings
                if (canvasconfig.clearOnClick) {
                    gc.onclick = function () {
                        ps.canvas.clearCanvas();
                    };
                }
            } 
        }
        
    },

    pixels : {
        createPixels: function () {
            var config = ps.config.pixels;
            var width = parseInt(ps.config.canvas.width);
            var height = parseInt(ps.config.canvas.height);
            for (var i = 0; i < config.spawnAmount; i++) {
                ps.data.pixels.push({
                    s: Date.now(), // creationdate timestamp
                    t: (Math.random() * (config.maxLifetimeMil - config.minLifetimeMil)) + config.maxLifetimeMil, // lifetime in miliseconds
                    x: Math.ceil((Math.random() * width) / (config.widthAndHeight + config.gapBetweenSteps)) * (config.widthAndHeight + config.gapBetweenSteps), // random x based on width of the canvas
                    y: Math.ceil((Math.random() * height) / (config.widthAndHeight + config.gapBetweenSteps)) * (config.widthAndHeight + config.gapBetweenSteps), // random x based on height of the canvas
                });
            }
        },

        draw: function () {
            var pixels = ps.data.pixels;
            var config = ps.config.pixels;
            var context = ps.canvas.getContext();
            // for each pixel
            for (var i = 0; i < pixels.length; i++) {
                context.beginPath();
                // set opacity, & paintings
                context.globalAlpha = config.opacity;
                context.lineWidth = config.lineWidth;
                // based on sum of pixel position, set stroke & fillstyle color
                var sum = pixels[i].x + pixels[i].y;
                context.strokeStyle = "hsl(" + sum + ",50%,50%)";
                context.fillStyle = "hsl(" + sum + ",50%,50%)";
                // rect or circle
                if (config.drawShape === "rect") {
                    context.rect(pixels[i].x, pixels[i].y, config.widthAndHeight, config.widthAndHeight);
                } else if (config.drawShape === "arc") {
                    context.arc(pixels[i].x, pixels[i].y, config.widthAndHeight, 0, 2 * Math.PI);
                }
                // stroke or filled
                if (config.style === "stroke") {
                    context.stroke();
                } else if (config.style === "fill") {
                    context.fill();
                }
                context.closePath();
            }
        },

        move: function () {
            var pixels = ps.data.pixels;
            var config = ps.config.pixels;
            for (var i = 0; i < pixels.length; i++) {
                // check if pixel is still alowed to move based on current time
                if ((pixels[i].s + pixels[i].t) < Date.now()) {
                    // if not, remove from pixels array
                    pixels.splice(i, 1);
                } else {
                    // Move to direction, x for west (+) or east (-), y for north (-) and south (+)
                    var directions = [
                        { x: "STAY", y: "DECREASE" }, // NORTH
                        { x: "INCREASE", y: "DECREASE" }, // NORTH EAST
                        { x: "INCREASE", y: "STAY" }, // EAST
                        { x: "INCREASE", y: "INCREASE" }, // SOUTH EAST
                        { x: "STAY", y: "INCREASE" }, // SOUTH
                        { x: "DECREASE", y: "INCREASE" }, // SOUTHWEST
                        { x: "DECREASE", y: "STAY" }, // WEST
                        { x: "DECREASE", y: "DECREASE" }, // NORTHWEST
                    ];
                    var random = Math.floor(Math.random() * directions.length);
                    var direction = directions[random];
                    var stepvalue = config.gapBetweenSteps + config.widthAndHeight;
                    if (direction.x === "INCREASE") {
                        pixels[i].x += stepvalue;
                    }
                    if (direction.x === "DECREASE") {
                        pixels[i].x -= stepvalue;
                    }
                    if (direction.y === "INCREASE") {
                        pixels[i].y += stepvalue;
                    }
                    if (direction.y === "DECREASE") {
                        pixels[i].y -= stepvalue;
                    }
                }
            }
            return true;
        },

        drawNextState : function() {
            if (ps.pixels.move()) {
                ps.pixels.draw();
                window.requestAnimationFrame(ps.pixels.drawNextState);
            }
        }
    },
    
    init: function () {
        ps.canvas.placeCanvas();
        ps.pixels.createPixels();
        // create new pixels over time
        setInterval(ps.pixels.createPixels, ps.config.pixels.createPixelRateMil);
        window.requestAnimationFrame(ps.pixels.drawNextState);
    }
  
    
};

window.onload = function () {
    ps.config.canvas.width = window.innerWidth;
    ps.config.canvas.height = window.innerHeight;
    ps.init();
};

window.addEventListener('orientationchange', function () {
    screenchange();
});

window.onresize = function () {
    screenchange();
};

function screenchange() {
    ps.config.canvas.width = window.innerWidth;
    ps.config.canvas.height = window.innerHeight;
    document.getElementById(ps.config.canvas.id).width = ps.config.canvas.width;
    document.getElementById(ps.config.canvas.id).height = ps.config.canvas.height;
}