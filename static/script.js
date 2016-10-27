// Initialize variables
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input for username
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.inputMessage'); // Input message input box

var $loginPage = $('.login.page'); // The login page
var $instrumentPage = $('.instrument.page'); // Select instrument page
var $chatPage = $('.chat.page'); // The chatroom page
var $guitarPage = $('.guitar.page');
var $drumPage = $('.drum.page');
var $keyboardPage = $('.keyboard.page');
var $trianglePage = $('.triangle.page');
var $vocalPage = $('.vocal.page');

// Prompt for setting a username
var username;
var instrument;
var note;
var connected = false;
var typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();

var socket = io();

// Keyboard events

$window.keydown(function (event) {
  // Auto-focus the current input when a key is typed
  if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    $currentInput.focus();
  }
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
      sendMessage();
      socket.emit('stop typing');
      typing = false;
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
    $currentInput = $inputMessage.focus();

    // Tell the server your username
    socket.emit('add user', username);
  }
}

$inputMessage.on('input', function() {
  updateTyping();
});

// Click events

// Focus input when clicking anywhere on login page
$loginPage.click(function () {
  $currentInput.focus();
});

// Focus input when clicking on the message input's border
$inputMessage.click(function () {
  $inputMessage.focus();
});

// Event Listener for selecting instruments
$('.musicInstrument').click(function(){
  instrument = $(this).attr('value');

  $instrumentPage.fadeOut();
  showInstrument(instrument);
  // $chatPage.show();
  $('.musicInstrument').off('click');
  $currentInput = $inputMessage.focus();

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

// Socket Listening

socket.on('playbacksong',function(data){
  console.log("play the song!");
  playbacksong(data)
});

socket.on('play note', function(data){
  console.log(data.instrument, data.note);
});

socket.on('welcome message', function(data){
  welcome(data);
});

function welcome (data){
  console.log("Welcome",data.user + "! Our lead on",data.instrument);
}

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
