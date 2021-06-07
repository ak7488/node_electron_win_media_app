const { ipcRenderer } = require("electron");

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
    document.getElementById("name").innerText = item.name;
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
}
function videoVolumeDown() {
    video.volume = volume - 0.1;
    volume = volume - 0.1;
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

ipcRenderer.on("changeVideo", (_, d) => {
    switch (d) {
        case "nextVideo":
            nextVideoHandler();
            break;
        case "previousVideo":
            previousVideoHandler();
            break;
        case "volumeUp":
            videoVolumeUp();
            break;
        case "volumeDown":
            videoVolumeDown();
            break;
        case "stopOrStartVideo":
            if (isPlaying) {
                stopVideo();
            } else {
                startVideo();
            }
            break;
        case "Forward":
            tenSecondsForward();
            break;
        case "Backword":
            tenSecondsBackword();
            break;
        case "increaseVideoSpeed":
            videoPlayBackSpeedHandler(videoPlayBackSpeed + 0.5);
            break;
        case "decreaseVideoSpeed":
            videoPlayBackSpeedHandler(videoPlayBackSpeed - 0.5);
            break;
        case "FullScreen":
            fullScreen();
            break;
    }
});
