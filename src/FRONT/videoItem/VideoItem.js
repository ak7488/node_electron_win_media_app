const { ipcRenderer, remote } = require("electron");

let item = {};
let videos = [];
let index = null;
let volume = 0.6;
let videoPlayBackSpeed = 1;
let isPlaying = false;
let isFullScreen = false;

ipcRenderer.on("videoItemData", (e, d) => {
    item = d.item;
    videos = d.VideoNames;
    setVideo(item);
});

const video = document.getElementById("video");
function setVideo(item) {
    if (!video || !video.volume || !item.path || !item.name) return;
    video.setAttribute("src", item.path);
    video.volume = volume;
    document.title = item.name;
    index = videos.indexOf(item);
    video.play();
    document.getElementById("WinTitle").innerText = item.name.slice(0, 40);
    document.getElementById("Volume").innerText = `Volume: ${Math.ceil(
        volume * 10
    )}`;
    document.getElementById(
        "playbackSpeed"
    ).innerText = `Playback Speed: ${videoPlayBackSpeed}`;
}

function previousVideoHandler() {
    if (videos.length === 0 || index === 0) return;
    setVideo(videos[index - 1]);
}

function nextVideoHandler() {
    if (videos.length === 0 || index === videos.length - 1) return;
    setVideo(videos[index + 1]);
}

function videoVolumeUp() {
    video.volume = volume + 0.1;
    volume = volume + 0.1;
    document.getElementById("Volume").innerText = `Volume: ${Math.ceil(
        volume * 10
    )}`;
}
function videoVolumeDown() {
    video.volume = volume - 0.1;
    volume = volume - 0.1;
    document.getElementById("Volume").innerText = `Volume: ${Math.ceil(
        volume * 10
    )}`;
}

function startVideo() {
    video.play();
}

function stopVideo() {
    video.pause();
}

// video.addEventListener("timeupdate", ({ target }) => {
//     if (target.currentTime === target.duration) return nextVideoHandler();
// });

video.addEventListener("play", () => {
    isPlaying = true;
});

video.addEventListener("pause", () => {
    isPlaying = false;
});

video.addEventListener("ended", () => {
    isPlaying = false;
    nextVideoHandler();
});

video.addEventListener("fullscreenchange", (e) => {
    isFullScreen = !isFullScreen;
});

const tenSecondsForward = () => {
    if (video.duration <= video.currentTime + 10) return;
    video.currentTime = video.currentTime + 10;
};

const tenSecondsBackword = () => {
    if (video.currentTime - 10 <= 0) {
        video.currentTime = 0;
    } else {
        video.currentTime = video.currentTime - 10;
    }
};

const videoPlayBackSpeedHandler = (e) => {
    if (e < 0) return;
    video.playbackRate = e;
    videoPlayBackSpeed = e;
    document.getElementById("playbackSpeed").innerText = `Playback Speed: ${e}`;
};

const fullScreen = () => {
    video.focus();
    if (isFullScreen) {
        document.exitFullscreen();
    } else {
        video.requestFullscreen();
    }
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

document.onkeypress = (e) => {
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
        case "n":
            nextVideoHandler();
            break;
        case "p":
            previousVideoHandler();
            break;
        case "u":
            videoVolumeUp();
            break;
        case "d":
            videoVolumeDown();
            break;
        case "s":
            if (isPlaying) {
                stopVideo();
            } else {
                startVideo();
            }
            break;
        case "f":
            tenSecondsForward();
            break;
        case "b":
            tenSecondsBackword();
            break;
        case "F":
            videoPlayBackSpeedHandler(videoPlayBackSpeed + 0.5);
            break;
        case "B":
            videoPlayBackSpeedHandler(videoPlayBackSpeed - 0.5);
            break;
        case "w":
            fullScreen();
            break;
    }
};
