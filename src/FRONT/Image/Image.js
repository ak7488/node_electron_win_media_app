const { ipcRenderer, remote } = require("electron");
const fs = require("fs");

let imgData = [],
    imgDataSliced = [],
    pageNum = 1,
    rotate = 0,
    focusedImgPath = "",
    imgIndex = 0;
const pageNumIndicator = document.getElementById("page_num");
const img_show = document.getElementById("img_show");
const img_full_element = document.getElementById("img_full_element");
const img_show_close_button = document.getElementById("img_show_close_button");
const rotate_90 = document.getElementById("rotate_90");
const delete_img = document.getElementById("delete_img");
const img_show_path = document.getElementById("img_show_path");
const previousImgButton = document.getElementById("previousImgButton");
const nextImgButton = document.getElementById("nextImgButton");

ipcRenderer.on("imgURLS", (_, data) => {
    imgData = data.ImagNames;
    imgDataSliced = imgData.slice(0, 50);
    renderImgItem();
});

// main
// create and append img items

const root = document.getElementById("root");

const renderImgItem = () => {
    root.innerHTML = "";
    imgDataSliced.forEach((e, index) => {
        const img = document.createElement("img");
        const name = document.createElement("p");
        const imgItem = document.createElement("div");
        const imgBack = document.createElement("div");

        img.src = e.path;
        img.classList = "img_element";
        name.innerText = e.name;
        name.classList = "name_p_element";

        imgBack.classList = "imgBack";
        imgBack.appendChild(img);

        imgItem.appendChild(imgBack);
        imgItem.appendChild(name);
        imgItem.classList = "imgItem";
        imgItem.onclick = () => {
            img_full_element.style = `transform: rotate(0deg)`;
            img_full_element.src = e.path;
            focusedImgPath = e.path;
            img_show_path.innerText = e.path;
            img_show.classList = "img_show";
            imgIndex = index;
        };

        root.appendChild(imgItem);
    });
    const maxPage = Math.ceil(imgData.length / 50);
    pageNumIndicator.innerText = `Page ${pageNum}/${maxPage}`;
};

const deleteImgHandler = () => {
    if (confirm(`WARNING: Do you want to delete ${focusedImgPath}?`)) {
        imgData = imgData.filter((e) => e.path !== focusedImgPath);
        imgDataSliced = imgDataSliced.filter((e) => e.path !== focusedImgPath);
        fs.unlinkSync(focusedImgPath);
        alert(`${focusedImgPath} has been removed from your computer.`);
        renderImgItem();
    }
};

const rotate90degHandler = () => {
    rotate += 90;
    img_full_element.style = `transform: rotate(${rotate}deg)`;
};

const closeImgFullHandler = () => {
    rotate = 0;
    img_show.classList = "img_show hide";
};

const nextImg = () => {
    if (imgIndex >= imgDataSliced.length) return;
    imgIndex += 1;
    const imgPath = imgDataSliced[imgIndex].path;
    img_full_element.style = `transform: rotate(0deg)`;
    img_full_element.src = imgPath;
    focusedImgPath = imgPath;
    img_show_path.innerText = imgPath;
    img_show.classList = "img_show";
};

const previousImg = () => {
    if (imgIndex <= 0) return;
    imgIndex -= 1;
    const imgPath = imgDataSliced[imgIndex].path;
    img_full_element.style = `transform: rotate(0deg)`;
    img_full_element.src = imgPath;
    focusedImgPath = imgPath;
    img_show_path.innerText = imgPath;
    img_show.classList = "img_show";
};

nextImgButton.onclick = nextImg;
previousImgButton.onclick = previousImg;
img_show_close_button.onclick = closeImgFullHandler;
rotate_90.onclick = rotate90degHandler;
delete_img.onclick = deleteImgHandler;

//header three button controls

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

document.onkeydown = (e) => {
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
        case "J":
            remote.getCurrentWebContents().toggleDevTools();
            break;
        case "r":
            rotate90degHandler();
            break;
        case "C":
            closeImgFullHandler();
            break;
        case "D":
            deleteImgHandler();
            break;
        case "n":
            nextImg();
            break;
        case "p":
            previousImg();
            break;
    }
};

//pageControl

function nextPage() {
    const maxPage = Math.ceil(imgData.length / 50);
    if (pageNum >= maxPage) return;
    pageNum += 1;
    imgDataSliced = imgData.slice((pageNum - 1) * 50, pageNum * 50);
    renderImgItem();
    closeImgFullHandler();
    imgIndex = 0;
}

function previousPage() {
    if (pageNum <= 0) return;
    pageNum -= 1;
    imgDataSliced = imgData.slice((pageNum - 1) * 50, pageNum * 50);
    renderImgItem();
    closeImgFullHandler();
    imgIndex = 0;
}

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
