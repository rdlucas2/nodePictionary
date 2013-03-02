/**
 * User: ryan
 * Date: 3/1/13
 * Time: 10:01 PM
 */
$(document).ready(function() {

var moves = {};
var pressed;
var x;
var y;

    var socket = io.connect();

    socket.on('drawStarted', function(data){
        moves = data;
        x = moves['x'];
        y = moves['y'];
        pressed = moves['pressed'];
        console.log(data);
        redraw(moves);
    });

    socket.on('drawMoved', function(data){
        moves = data;
        x = moves['x'];
        y = moves['y'];
        pressed = moves['pressed'];
        console.log(data);
        redraw(moves);
    });


function initCanvas() {
    var canvasDiv = document.getElementById('canvas');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', 200);
    canvas.setAttribute('height', 200);
    canvas.setAttribute('id', 'canvas');
    canvasDiv.appendChild(canvas);
    if(typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }
    context = canvas.getContext("2d");

    $('#canvas').mousedown(function(e){
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;
        pressed = true;
        moves = {x:x,y:y,pressed:pressed}
        socket.emit('drawStart', moves);
        pressed = false;
//        redraw();
    });

    $('#canvas').mousemove(function(e){
        if(pressed){
            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop;
            pressed = true;
            moves = {x:x,y:y,pressed:pressed}
            socket.emit('drawMove', moves);
//        redraw();
        }
    });

    $('#canvas').mouseup(function(e){
        pressed = false;
    });

    $('#canvas').mouseleave(function(e){
        pressed = false;
    });
    redraw(moves);
}

function redraw(moves){
    width = canvas.width;
    height = canvas.height;
    context.fillStyle = "#000000"
    context.beginPath();
    context.moveTo(moves['x'], moves['y']);
    context.arc(moves['x'], moves['y'], 5, 0, Math.PI * 2, false)
    context.fill();
}

$('body').bind('onload', initCanvas());

});