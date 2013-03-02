/* Author: Ryan Lucas

$(document).ready(function() {   

  var socket = io.connect();

  $('#sender').bind('click', function() {
   var name = $('#name').val();
   socket.emit('message', 'Hello ' + name);
  });

  socket.on('server_message', function(data){
   $('#receiver').append('<li>' + data + '</li>');  
  });

});

*/