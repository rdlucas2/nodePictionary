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

    // prevent elastic scrolling
    document.body.addEventListener('touchmove',function(event){
        event.preventDefault();
    },false);	// end body:touchmove


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

    $('#canvas').bind('mousedown touchstart dragdown draginit', function(e){
        e.preventDefault;
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;
        if('ontouchstart' in window == true){
            x = event.targetTouches[0].pageX;
            y = event.targetTouches[0].pageY;
        }
        pressed = true;
        moves = {x:x,y:y,pressed:pressed}
        socket.emit('drawStart', moves);
        pressed = false;
    });

    $('#canvas').bind('mousemove dragmove touchmove', function(e){
        e.preventDefault;
        if(pressed){
            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop;
            if('ontouchstart' in window == true){
                x = event.targetTouches[0].pageX;
                y = event.targetTouches[0].pageY;
            }
            pressed = true;
            moves = {x:x,y:y,pressed:pressed}
            socket.emit('drawMove', moves);
        }
    });

    $('#canvas').bind('dragend touchend mouseup mouseleave dragout', function(e){
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