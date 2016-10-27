var express = require('express');
//var ejsLayouts = require('express-ejs-layouts');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var song = [] ;
var connections = [];

app.use(express.static('static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log("There are",socket.server.eio.clientsCount, "connected clients");

  // listen for a disconnect event
  socket.once('disconnect', () => {
    // find the connection and remove  from the collection
    let connection = findConnection(socket.id)
    if (connection) {
      socket.broadcast.emit('user left', connection);
      connections.splice(connections.indexOf(connection), 1)
      if (connection.user) {
        console.log(`## ${connection.user}(${connection.id}) disconnected. Remaining: ${connections.length}.`)
      } else {
        console.log(`## Connection (${connection.id}) (${socket.id}) disconnected. Remaining: ${connections.length}.`)
      }
    }
    socket.disconnect()
  })

  socket.on('user joins', function(data){
    connections.push({id: socket.id, user: data.username});
    socket.broadcast.emit('welcome message',{user: data.username, instrument: data.instrument});
  });

  // When one user request to play back the song
  socket.on('playback',function(){
    socket.emit('playbacksong', song )
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

function findConnection (id) {
  return connections.filter(function (c) { return c.id === id })[0]
}
