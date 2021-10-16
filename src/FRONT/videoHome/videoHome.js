const { ipcRenderer, remote } = require("electron");

let VideoNames = [],
    videoNamesShort = [],
    pageNum = 1;
const pageNumIndicator = document.getElementById("page_num");

const onVideoItemClickHandler = (item) => {
    if (!item.path || !item.name) return;
    ipcRenderer.send("videos", { VideoNames, item });
};

const videoItemRenderer = async () => {
    const VideoElementContainer = document.createElement("div");
    videoNamesShort.map((e, index) => {
        const videoItem = document.createElement("div");
        const video = document.createElement("video");
        const name = document.createElement("p");

        video.preload = false;
        video.src = e.path;
        video.classList = "videoItem_video";
        name.innerText = `${index + 1}). ${e.name}`;
        name.classList = "videoItem_name_p";

        videoItem.appendChild(video);
        videoItem.appendChild(name);
        videoItem.classList = "videoItem";
        videoItem.onclick = () => {
            onVideoItemClickHandler(e);
        };

        VideoElementContainer.appendChild(videoItem);
        VideoElementContainer.classList = "videoElementContainer";
    });
    document.getElementById("root").innerHTML = "";
    document.getElementById("root").appendChild(VideoElementContainer);
};

ipcRenderer.on("kunal", (e, { videoNames }) => {
    VideoNames = videoNames;
    videoNamesShort = videoNames.slice(0, 20);
    videoItemRenderer();
    const maxPage = Math.ceil(VideoNames.length / 20);
    pageNumIndicator.innerText = `Page ${pageNum}/${maxPage}`;
});

ipcRenderer.on("requestFileDir", async () => {
    const dialog = remote.dialog;

    var path = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    ipcRenderer.send("reloadVideoInSpecificDir", path.filePaths[0]);
});

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
    }
};

//video open by number
let a = [];
const num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const dis = document.getElementById("dis");
const numInput = document.getElementById("numInput");

window.onkeydown = (e) => {
    const b = parseInt(a.toString().replace(/\,/g, ""));
    if (e.key === "Backspace" && a.length > 0) {
        a.pop();
    } else if (num.includes(e.key)) {
        a.push(e.key);
    } else if (e.key === "Enter" && b < videoNamesShort.length && b > 0) {
        onVideoItemClickHandler(videoNamesShort[b - 1]);
        dis.className = "dis";
        numInput.innerText = "";
    }
    if (a.length > 0) {
        dis.className = "dis show";
        numInput.innerText = "Video num: " + a.toString().replace(/\,/g, "");
    } else {
        dis.className = "dis";
    }
};

//pageControl

const nextPage = () => {
    const maxPage = Math.ceil(VideoNames.length / 20);
    if (pageNum >= maxPage) return;
    pageNum += 1;
    pageNumIndicator.innerText = `Page ${pageNum}/${maxPage}`;
    videoNamesShort = VideoNames.slice((pageNum - 1) * 20, pageNum * 20);
    videoItemRenderer();
};

const previousPage = () => {
    const maxPage = Math.ceil(VideoNames.length / 20);
    if (pageNum <= 0) return;
    pageNum -= 1;
    pageNumIndicator.innerText = `Page ${pageNum}/${maxPage}`;
    videoNamesShort = VideoNames.slice((pageNum - 1) * 20, pageNum * 20);
    videoItemRenderer();
};

window.onkeydown = (e) => {
    switch (e.key) {
        case "ArrowRight":
            nextPage();
            break;
        case "ArrowLeft":
            previousPage();
            break;
    }
};

document.getElementById("next").onclick = nextPage;

document.getElementById("previous").onclick = previousPage;
