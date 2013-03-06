//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: 'Move along, nothing to see here'
                 ,author: 'Ryan Lucas'
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: 'I would do anything for love, but I won\'t do that'
                 ,author: 'Ryan Lucas'
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var userlist = {};
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');

  socket.on('userId', function(data){
    userlist[socket.id] = data;
    console.log(userlist);
    socket.broadcast.emit('userList', userlist);
    socket.emit('userList', userlist);
  });

  socket.on('drawStart', function(data){
      socket.broadcast.emit('drawStarted',data);
      socket.emit('drawStarted',data);
  });

  socket.on('drawMove', function(data){
      socket.broadcast.emit('drawMoved',data);
      socket.emit('drawStarted',data);
  });

  socket.on('pressStatus', function(data){
     socket.broadcast.emit('pressed', data);
     socket.emit('pressed', data);
  });

  socket.on('colorChange', function(data){
      socket.broadcast.emit('colorChanged',data);
      socket.emit('colorChanged',data);
  });

  socket.on('sizeChange', function(data){
      //VALIDATE THAT SIZE IS BETWEEN 1-100
      if (data > 100 || data < 1 || !isInt(parseInt(data))) {
          data = 10;
      }

      socket.broadcast.emit('sizeChanged',data);
      socket.emit('sizeChanged',data);
  });

  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
    delete userlist[socket.id];
    console.log(userlist);
  });
});

///////////////////////////////////////////
//              Helpers                  //
///////////////////////////////////////////

function isInt(n) {
    return typeof n === 'number' && n % 1 == 0;
}

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Pictionary - with node.js, socket.io, and jquery'
             ,description: 'Proof of concept for browser based Pictionary like game'
             ,author: 'Ryan Lucas'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
