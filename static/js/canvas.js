/**
 * User: ryan
 * Date: 3/1/13
 * Time: 10:01 PM
 */
$(document).ready(function() {

var moves = new Array();
var pressed;

    var socket = io.connect();

    socket.on('drawStarted', function(data){
        moves = data;
        redraw();
    });

    socket.on('drawMoved', function(data){
        moves = data;
        redraw();
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
        pressed= true;
        moves.push([e.pageX - this.offsetLeft,
            e.pageY - this.offsetTop,
            false]);
        socket.emit('drawStart', moves);
//        redraw();
    });

    $('#canvas').mousemove(function(e){
        if(pressed){
            moves.push([e.pageX - this.offsetLeft,
                e.pageY - this.offsetTop,
                true]);
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
    redraw();
}

function redraw(){
    canvas.width = canvas.width;

    context.strokeStyle = "#0000a0";
    context.lineJoin = "round";
    context.lineWidth = 6;

    for(var i=0; i < moves.length; i++)
    {
        context.beginPath();
        if(moves[i][2] && i){
            context.moveTo(moves[i-1][0], moves[i-1][1]);
        }else{
            context.moveTo(moves[i][0], moves[i][1]);
        }
        context.lineTo(moves[i][0], moves[i][1]);
        context.closePath();
        context.stroke();
    }
}

$('body').bind('onload', initCanvas());

});