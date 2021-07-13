const { ipcRenderer, remote } = require("electron");

let item = {};
let videos = [];
let index = null;
let volume = 0.6;
let videoPlayBackSpeed = 1;
let isPlaying = false;
let isFullScreen = false;
let name = "";
let varNum = 0

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
    name = item.name;
}

function previousVideoHandler() {
    if (videos.length === 0 || index === 0) return;
    setVideo(varNum > 0 ? videos[index - varNum] : videos[index - 1]);
    dis.className = 'dis'
    numInput.innerText = ''
    a = []
}

function nextVideoHandler() {
    if (videos.length === 0 || index === videos.length - 1) return;
    setVideo(varNum > 0 ? videos[index + varNum] : videos[index + 1]);
    dis.className = 'dis'
    numInput.innerText = ''
    a = []
}

function videoVolumeUp(e) {
    video.volume = volume + e;
    volume = volume + e;
    document.getElementById("Volume").innerText = `Volume: ${Math.ceil(
        volume * 10
    )}`;
    dis.className = 'dis'
    numInput.innerText = ''
    a = []
}
function videoVolumeDown(e) {
    video.volume = volume - e;
    volume = volume - e;
    document.getElementById("Volume").innerText = `Volume: ${Math.ceil(
        volume * 10
    )}`;
    dis.className = 'dis'
    numInput.innerText = ''
    a = []
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

const tenSecondsForward = (e) => {
    if (video.duration <= video.currentTime + e) return;
    video.currentTime = video.currentTime + e;
};

const tenSecondsBackword = (e) => {
    if (video.currentTime - e <= 0) {
        video.currentTime = 0;
    } else {
        video.currentTime = video.currentTime - e;
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
    setTimeout(() => {
        remote.getCurrentWindow().close();
    }, 500);
};

minimise.onclick = minimiseHandler;
maximise.onclick = maximiseHandler;
close.onclick = closeWindowHandler;

function sendVideoDataToMain() {
    ipcRenderer.send("sendVideoDataToMain", {
        currentTime: video.currentTime,
        volume: volume,
        name,
        videoPlayBackSpeed,
    });
}

ipcRenderer.on("videoData", (_, data) => {
    const {
        currentTime: ct,
        name: n,
        videoPlayBackSpeed: vpb,
        volume: vol,
    } = data;
    video.currentTime = ct;
    video.playbackRate = vpb;
    video.volume = vol;
    volume = vol;
    videoPlayBackSpeed = vpb;
});

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
            videoVolumeUp(varNum > 0 && varNum <= 10 ? (varNum / 10) : 0.1);
            break;
        case "d":
            videoVolumeDown(varNum > 0 && varNum <= 10 ? varNum / 10 : 0.1);
            break;
        case "s":
            if (isPlaying) {
                stopVideo();
            } else {
                startVideo();
            }
            break;
        case "f":
            tenSecondsForward(varNum > 0 ? varNum : 10);
            dis.className = 'dis'
            numInput.innerText = ''
            a = []
            break;
        case "b":
            tenSecondsBackword(varNum > 0 ? varNum : 10);
            dis.className = 'dis'
            numInput.innerText = ''
            a = []
            break;
        case "F":
            if (varNum > 0) {
                videoPlayBackSpeedHandler(videoPlayBackSpeed + varNum);
                dis.className = 'dis'
                numInput.innerText = ''
                a = []
            } else {
                videoPlayBackSpeedHandler(videoPlayBackSpeed + 0.5);
            }
            break;
        case "B":
            if (varNum > 0) {
                videoPlayBackSpeedHandler(videoPlayBackSpeed - varNum);
                dis.className = 'dis'
                numInput.innerText = ''
                a = []
            } else {
                videoPlayBackSpeedHandler(videoPlayBackSpeed - 0.5);
            }
            break;
        case "w":
            fullScreen();
            break;
        case "o":
            sendVideoDataToMain();
            break;
    }
};

//screen number operation
let a = []
const num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
const dis = document.getElementById('dis')
const numInput = document.getElementById('numInput')

window.onkeydown = (e) => {
    varNum = parseInt(a.toString().replace(/\,/g, ''))
    if (e.key === 'Backspace' && a.length > 0) {
        a.pop();
    } else if (num.includes(e.key)) {
        a.push(e.key)
    } else if (a.length > 0) {
        dis.className = 'dis show'
        numInput.innerText = ' ' + a.toString().replace(/\,/g, '')
    } else {
        dis.className = 'dis'
    }
}