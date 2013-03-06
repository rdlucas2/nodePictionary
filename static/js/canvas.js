/**
 * Author: Ryan Lucas
 * Date: 3/1/13
 * Time: 10:01 PM
 */
$(document).ready(function() {

    //Initialize Variables
    var socket = io.connect();
    var moves = {};
    var pressed = false;
    var x;
    var y;
    var prevx;
    var prevy;
    var fillColor = "#000000";
    var radius = 10;
    var userlist = {};
    var userId = Math.round((new Date().getTime() / 1000)*Math.random());

    //give the client a unique id
    socket.emit('userId', userId);

    socket.on('userList', function(data){
        userlist = data;
        console.log(userlist);
    });

    // prevent elastic scrolling on mobile/touch
    document.body.addEventListener('touchmove',function(event){
        event.preventDefault();
    },false);	// end body:touchmove

    //INITIALIZE CANVAS AND CANVAS HELPERS
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
    }

    function draw(moves){
            context.strokeStyle = fillColor;
            context.lineWidth = radius;
            context.lineCap = 'round';
            context.fillStyle = fillColor;
            context.beginPath();
            if(prevx != null) {
                context.moveTo(prevx, prevy);
            }
            else {
            context.moveTo(moves['x'], moves['y']);
            }
            context.lineTo(moves['x'], moves['y']);
        context.stroke();
        prevx = moves['x'];
        prevy = moves['y'];
    }

    $('body').bind('onload', initCanvas());
    //************************************************************************************

    //RECEIVE DRAWING INFORMATION TO DISPLAY ON ALL CLIENTS
    socket.on('drawStarted', function(data){
        draw(data);
    });

    socket.on('drawMoved', function(data){
        draw(data);
    });
    //******************************************************

    //WHEN THE DRAWING BEGINS AND THE MOUSE/TOUCH IS ACTIVE, SEND THE INFORMATION TO THE SERVER
    $('#canvas').bind('mousedown touchstart', function(e){
        e.preventDefault;
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;
        if('ontouchstart' in window == true){
            x = event.targetTouches[0].pageX;
            y = event.targetTouches[0].pageY;
        }
        pressed = true;
        socket.emit('pressStatus', pressed)
        prevx = x;
        prevy = y;
        moves = {x:x,y:y,prevx:prevx,prevy:prevy}
        socket.emit('drawStart', moves);
    });

    $('#canvas').bind('mousemove touchmove', function(e){
        e.preventDefault;
        if(pressed) {
            x = e.pageX - this.offsetLeft;
            y = e.pageY - this.offsetTop;
            if('ontouchstart' in window == true){
                x = event.targetTouches[0].pageX;
                y = event.targetTouches[0].pageY;
            }
            moves = {x:x,y:y,pressed:pressed};
            socket.emit('drawMove', moves);
        }
    });

    //stop drawing when your finger leaves or the mouse is up (or out of bounds)
    $('#canvas').bind('touchend mouseup mouseleave', function(e){
        pressed = false;
        socket.emit('pressStatus', pressed);
    });

    //get pressed status for everyone (Someone is or isn't drawing)
    socket.on('pressed', function(data){
        prevx = null;
        prevy = null;
        pressed = data;
    });

    //******************************************************************************************

    //OPTIONS - color, size
    $('.colorChange').click(function(e){
        fillColor = $(this).children('span').text();
        socket.emit('colorChange', fillColor);
    });

    socket.on('colorChanged', function(data){
        $('.colorChange').removeClass('selected');
        $(".colorChange:contains('" + data + "')").addClass('selected');
        fillColor = data;
    });

    $('#sizeSlider').on('mouseup', function(e){
        radius = $('#sizeValue').text();
        socket.emit('sizeChange', radius);
    });

    socket.on('sizeChanged', function(data){
        $('#sizeSlider').val(data);
        $("#sizeValue").val(data);
        radius = data;
    });

    $('#sizeValue').on('keydown', function(e){
        if(e.keyCode == 13) {
            radius = $('#sizeValue').val();
            socket.emit('sizeChange', radius);
        }
    });

    //******************************************************************************************

});