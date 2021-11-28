const { ipcRenderer, remote } = require("electron");

let URLS = [];
const audioContainer = document.getElementById("AudioContainer");

ipcRenderer.on("audioURLS", (_, urls) => {
  URLS = urls.audioNames;
  loadAudioItems();
});

function loadAudioItems() {
  const root = document.getElementById("root");
  root.innerHTML = "";
  if (URLS.length === 0) {
    const noAudioWarning = document.createElement("p");
    noAudioWarning.classList.add("no_audio_item_warning");
    noAudioWarning.innerText = `No audio found.`;
    root.appendChild(noAudioWarning);
  } else {
    URLS.forEach((data, index) => {
      const audioItem = document.createElement("div");
      const audioName = document.createElement("p");
      const audioPath = document.createElement("abbr");

      audioItem.classList.add("audioItem");
      audioName.classList.add("audioName");
      audioPath.classList.add("audioPath");

      audioName.innerText = `${index + 1}) ${data.name}`;
      audioPath.title = data.path;

      audioItem.onclick = () => {
        onAudioItemClickHandler(data);
      };

      audioPath.appendChild(audioName);
      audioItem.appendChild(audioPath);
      root.appendChild(audioItem);
    });
  }
}

//Audio player code

const range = document.getElementById("range");
const AudioName = document.getElementById("name");
const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const dec = document.getElementById("dec");
const inc = document.getElementById("inc");
const info_p = document.getElementById("info_p");
const Controls_container = document.getElementById("Controls_container");
const volDown = document.getElementById("volDown");
const volUp = document.getElementById("volUp");
const TensecBackward = document.getElementById("10secBackward");
const TensecForward = document.getElementById("10secForward");
const CancelAudio = document.getElementById("CancelAudio");

let playtime = 0;
let duration = 100;
let isPlaying = false;
let playTimeSpeed = 1;
let volume = 0.4;
let currentPath = "";
const audio = document.createElement("audio");

const playPauseHandler = () => {
  if (isPlaying) {
    isPlaying = false;
    audio.pause();
    play.innerText = "Play";
  } else {
    isPlaying = true;
    audio.play();
    play.innerText = "Pause";
  }
};
const increasePlayBackSpeedHandler = () => {
  if (playTimeSpeed >= 5) return;
  playTimeSpeed = playTimeSpeed + 0.25;
  audio.playbackRate = playTimeSpeed;
  setInfo();
};
const decreasePlayBackSpeed = () => {
  if (playTimeSpeed <= 0) return;
  playTimeSpeed = playTimeSpeed - 0.25;
  audio.playbackRate = playTimeSpeed;
  setInfo();
};
const volumeUpHandler = () => {
  if (volume >= 1) return;
  volume += 0.1;
  audio.volume = volume;
  setInfo();
};
const volumeDownHandler = () => {
  if (volume <= 0) return;
  volume -= 0.1;
  audio.volume = volume;
  setInfo();
};
const TenSecondsForwardHandler = () => {
  if (audio.duration <= audio.currentTime + 10) return;
  audio.currentTime = audio.currentTime + 10;
};
const TenSecondsBackWardHandler = () => {
  if (audio.currentTime - 10 <= 0) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = audio.currentTime - 10;
  }
};
const cancelAudioHandler = () => {
  Controls_container.removeChild(audio);
  audioContainer.className = "AudioContainer__hide";
};
const nextAudioHandler = () => {
  const currentIndex = URLS.findIndex((e) => e.path === currentPath);
  if (currentIndex + 1 >= URLS.length) {
    onAudioItemClickHandler(URLS[0]);
  } else {
    onAudioItemClickHandler(URLS[currentIndex + 1]);
  }
};
const previousAudioHandler = () => {
  const currentIndex = URLS.findIndex((e) => e.path === currentPath);
  if (currentIndex === 0) {
    onAudioItemClickHandler(URLS.reverse()[0]);
  } else {
    onAudioItemClickHandler(URLS[currentIndex - 1]);
  }
};

function onAudioItemClickHandler(item) {
  const { name, path } = item;
  currentPath = path;
  AudioName.innerText = name.slice(0, 65);
  audio.src = path;
  range.value = 0;
  playPauseHandler();
  Controls_container.appendChild(audio);
  audioContainer.className = "AudioContainer__show";
}

play.onclick = playPauseHandler;
inc.onclick = increasePlayBackSpeedHandler;
dec.onclick = decreasePlayBackSpeed;
volUp.onclick = volumeUpHandler;
volDown.onclick = volumeDownHandler;
TensecForward.onclick = TenSecondsForwardHandler;
TensecBackward.onclick = TenSecondsBackWardHandler;
CancelAudio.onclick = cancelAudioHandler;
next.onclick = nextAudioHandler;
previous.onclick = previousAudioHandler;

audio.ontimeupdate = (e) => {
  playtime = e.target.currentTime;
  duration = e.target.duration;
  range.min = 0;
  range.max = duration;
  range.value = playtime;
  setInfo();
};

range.onchange = (e) => {
  audio.pause();
  play.innerText = "Play";
  isPlaying = false;
  audio.currentTime = e.target.value;
  audio.play();
  play.innerText = "Pause";
  isPlaying = true;
};

function setInfo() {
  info_p.innerText = `Playback rate: ${playTimeSpeed.toString().slice(0.4)}
        Volume: ${Math.floor(volume * 10)}
        Time: ${Math.floor(audio.duration)}/${Math.floor(audio.currentTime)}`;
}

setInfo();

const openDirSelector = async () => {
  const dialog = remote.dialog;

  var path = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  ipcRenderer.send("reloadAudioInSpecificDir", path.filePaths[0]);
};

ipcRenderer.on("AudioReloadData", (e, { AudioNames }) => {
  URLS = AudioNames;
  loadAudioItems();
});

const reloadSameDirRequest = () => {
  ipcRenderer.send(
    "reloadAudioHomeScreenRequestInSameDir",
    "reloadAudioHomeScreenRequestInSameDir"
  );
};

//Windows three main controls
const minimise = document.getElementById("minimise");
const maximise = document.getElementById("maximise");
const close = document.getElementById("close");

const minimiseHandler = () => {
  remote.getCurrentWindow().minimize();
};
const maximiseHandler = () => {
  remote.getCurrentWindow().maximize();
};
const closeWindowHandler = () => {
  remote.getCurrentWindow().close();
};

minimise.onclick = minimiseHandler;
maximise.onclick = maximiseHandler;
close.onclick = closeWindowHandler;

window.onkeypress = (e) => {
  switch (e.key) {
    case "m":
      minimiseHandler();
      break;
    case "a":
      maximiseHandler();
      break;
    case "c":
      closeWindowHandler();
      break;
    case "s":
      playPauseHandler();
      break;
    case "n":
      nextAudioHandler();
      break;
    case "p":
      previousAudioHandler();
      break;
    case "u":
      volumeUpHandler();
      break;
    case "d":
      volumeDownHandler();
      break;
    case "q":
      cancelAudioHandler();
      break;
    case "f":
      TenSecondsForwardHandler();
      break;
    case "b":
      TenSecondsBackWardHandler();
      break;
    case "Z":
      openDirSelector();
      break;
    case "R":
      reloadSameDirRequest();
      break;
  }
};
