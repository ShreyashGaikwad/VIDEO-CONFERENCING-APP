const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const userName = prompt("Enter your name");
let myVideoStream;

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: location.port || (location.protocol === 'https:' ? 443 : 80),
});

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  peer.on("call", call => {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on("user-connected", userId => {
    connectToNewUser(userId, stream);
  });

  const text = $("#chat_message");

  $("html").keydown(function (e) {
    if (e.which === 13 && text.val().trim() !== "") {
      socket.emit("message", {
        user: userName,
        text: text.val()
      });
      text.val("");
    }
  });

  socket.on("createMessage", ({ user, text }) => {
    $(".messages").append(`<li class="message"><b>${user}</b><br/>${text}</li>`);
    scrollToBottom();
  });
});

peer.on("open", id => {
  socket.emit("join-room", ROOM_ID, id, userName);
});

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function scrollToBottom() {
  const chatWindow = $(".main__chat_window");
  chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
}

// Mute/Unmute
function muteUnmute() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  myVideoStream.getAudioTracks()[0].enabled = !enabled;
  enabled ? setUnmuteButton() : setMuteButton();
}

function setMuteButton() {
  document.querySelector(".main__mute_button").innerHTML = `
    <i class="fas fa-microphone"></i><span>Mute</span>`;
}

function setUnmuteButton() {
  document.querySelector(".main__mute_button").innerHTML = `
    <i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`;
}

// Video Play/Stop
function playStop() {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  myVideoStream.getVideoTracks()[0].enabled = !enabled;
  enabled ? setPlayVideo() : setStopVideo();
}

function setStopVideo() {
  document.querySelector(".main__video_button").innerHTML = `
    <i class="fas fa-video"></i><span>Stop Video</span>`;
}

function setPlayVideo() {
  document.querySelector(".main__video_button").innerHTML = `
    <i class="stop fas fa-video-slash"></i><span>Play Video</span>`;
}
