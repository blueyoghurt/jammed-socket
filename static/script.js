// Initialize variables
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input for username

var $loginPage = $('.login.page'); // The login page
var $instrumentPage = $('.instrument.page'); // Select instrument page
var $chatPage = $('.chat.page'); // The chatroom page
var $guitarPage = $('.guitar.page');
var $drumPage = $('.drum.page');
var $keyboardPage = $('.keyboard.page');
var $trianglePage = $('.triangle.page');
var $vocalPage = $('.vocal.page');
var gamepause = false;

// Prompt for setting a username
var username;
var instrument;
var note;
var $currentInput = $usernameInput.focus();

var socket = io();

// Hide alert
$('#alertDiv').hide();

// Keyboard events

$window.keydown(function (event) {
  // Auto-focus the current input when a key is typed
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $currentInput.focus();
  }
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
    } else {
      setUsername();
    }
  }
});

// Prevents input from having injected markup
function cleanInput (input) {
  return $('<div/>').text(input).text();
}

// Sets the client's username
function setUsername () {
  username = cleanInput($usernameInput.val().trim());

  // If the username is valid
  if (username) {
    $loginPage.fadeOut();
    $instrumentPage.show();
    $loginPage.off('click');

    // Tell the server your username
    socket.emit('add user', username);
  }
}

// Click events

// Focus input when clicking anywhere on login page
$loginPage.click(function () {
  $currentInput.focus();
});

// Event Listener for selecting instruments
$('.musicInstrument').click(function(){
  instrument = $(this).attr('value');

  $instrumentPage.fadeOut();
  showInstrument(instrument);
  $('.musicInstrument').off('click');

  socket.emit('user joins',{username: username, instrument: instrument});
});

// Event Listener for selecting musical notes
$('.musicalNote').click(function(){
  note = $(this).attr('value');
  socket.emit('playing instrument',{instrument: instrument, note: note});
});

// Event Listener for playback
$('.Playback').click(function(){
  console.log("button clicked, playback song");
  socket.emit('playback');
});

//Event Listener for game pause
$(document).keypress(function(e){
  if (e.which === 32){
    if(gamepause){
      $('#overlay').css("z-index","-1");
      gamepause = false;
    } else{
      $('#overlay').css("z-index","1");
      gamepause = true;
    }
  }
});

// Socket Listening
socket.on('playbacksong',function(data){
  console.log("play the song!");
  playbacksong(data)
});

socket.on('play note', function(data){
  console.log(data.instrument, data.note);
});

socket.on('user left', function(data){
  userLeft(data);
});

socket.on('welcome message', function(data){
  welcome(data);
});

function playbacksong(data){
  counter = 0;
  for (var i = 0; i < data.length; i++) {
    counter += data[i].difference
    playsong(data[i], counter);
  }
}

function playsong(song, counter){
  setTimeout(function() {
    console.log(song.instrument, song.note);
  }, counter);
}

function showInstrument(instrument){
  switch (instrument){
    case "Guitar":
    $guitarPage.show();
    break;
    case "Drums":
    $drumPage.show();
    break;
    case "Keyboard":
    $keyboardPage.show();
    break;
    case "Triangle":
    $trianglePage.show();
    break;
    case "Vocals":
    $vocalPage.show();
    break;
  }
}

function welcome (data){
  $("#alertDiv").removeClass("alert-danger");
  $("#alertDiv").addClass("alert-info");
  var message = data.user + " has joined us on the " + data.instrument.toLowerCase() +". Rock on!";
  $('#alertText').text(message);
  $("#alertDiv").alert();
  $("#alertDiv").fadeTo(2000, 500).slideUp(500, function(){
    $("#alertDiv").slideUp(500);
  });
}

function userLeft (connection){
  $("#alertDiv").removeClass("alert-info");
  $("#alertDiv").addClass("alert-danger");
  var message = connection.user + " has left us for a better place. Goodbye!";
  $('#alertText').text(message);
  $("#alertDiv").alert();
  $("#alertDiv").fadeTo(2000, 500).slideUp(500, function(){
    $("#alertDiv").slideUp(500);
  });
}
