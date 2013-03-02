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
var fillColor = "#000000";
var radius = 10;
var options = {};
var cssObject;
    var socket = io.connect();

    socket.on('drawStarted', function(data){
        moves = data;
        pressed = moves['pressed'];
        redraw(moves);
    });

    socket.on('drawMoved', function(data){
        moves = data;
        x = moves['x'];
        y = moves['y'];
        pressed = moves['pressed'];
        redraw(moves);
    });


function initCanvas() {
    var canvasDiv = document.getElementById('canvas');
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
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

    $('#canvas').touchstart(function(e){
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

    $('#canvas').touchmove(function(e){
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

    $('#canvas').touchend(function(e){
        pressed = false;
    });

    $('#canvas').mouseleave(function(e){
        pressed = false;
    });

    $('.colorChange').click(function(e){
        fillColor = $(this).children('span').text();
        socket.emit('colorChange', fillColor);
    });

    socket.on('colorChanged', function(data){
        console.log(data);
        $('.colorChange').removeClass('selected');
        $(".colorChange:contains('" + data + "')").addClass('selected');
        fillColor = data;
    });

    $('.sizeChange').click(function(e){
        radius = $(this).children('span').text();
        socket.emit('sizeChange', radius);
    });

    socket.on('sizeChanged', function(data){
        console.log(data);
        $('.sizeChange').removeClass('selected');
        $(".sizeChange:contains('" + data + "')").addClass('selected');
        radius = data;
    });

        redraw(moves);
}

function redraw(moves){
    width = canvas.width;
    height = canvas.height;
    context.fillStyle = fillColor;
    context.beginPath();
    context.moveTo(moves['x'], moves['y']);
    context.arc(moves['x'], moves['y'], radius, 0, Math.PI * 2, false);
    context.fill();
}

$('body').bind('onload', initCanvas());

});