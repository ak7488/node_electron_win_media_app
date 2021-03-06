const { ipcRenderer, remote } = require("electron");

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

function onAudioItemClickHandler({ name, path }) {
    currentPath = path;
    AudioName.innerText = name.slice(0, 65);
    audio.src = path;
    range.value = 0;
    audio.play();
    Controls_container.appendChild(audio);
}

ipcRenderer.on("audioItemData", (_, item) => {
    onAudioItemClickHandler(item);
});

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
    closeWindowHandler();
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
function closeWindowHandler() {
    remote.getCurrentWindow().close();
}

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
    }
};
