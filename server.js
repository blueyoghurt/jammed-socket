var express = require('express');
//var ejsLayouts = require('express-ejs-layouts');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var song = [] ;


app.use(express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log("There are",socket.server.eio.clientsCount, "connected clients");
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });

  socket.on('disconnect',function(){
    console.log('User disconnected');
    console.log("There are",socket.server.eio.clientsCount, "connected clients");
  });

  socket.on('user joins', function(data){
    socket.broadcast.emit('welcome message',{user: data.username, instrument: data.instrument});
  });

// When one user request to play back the song
  socket.on('playback',function(){
    socket.broadcast.emit('playbacksong', song )
  });

  socket.on('playing instrument',function(data){
    var d = new Date();
    if(song.length === 0){
      song.push({
        instrument: data.instrument,
        note: data.note,
        time: d,
        difference: 0
      })
    } else {
      song.push({
        instrument: data.instrument,
        note: data.note,
        time: d,
        difference: d - song[song.length-1].time
      })
    };
      io.sockets.emit('play note',{instrument:data.instrument, note:data.note});
    });
  });
