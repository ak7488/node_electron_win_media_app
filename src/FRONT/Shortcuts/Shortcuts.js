const { remote } = require("electron");

const table_common = document.getElementById("table_common");
const tabel_global = document.getElementById("tabel_global");
const table_home = document.getElementById("table_home");
const table_video_home = document.getElementById("table_video_home");
const table_video_item = document.getElementById("table_video_item");
const table_audio_home = document.getElementById("table_audio_home");
const table_audio_item = document.getElementById("table_audio_item");
const table_image_item = document.getElementById("table_image_item");

const createTable = (table, array = []) => {
    array.forEach((e) => {
        const tr = document.createElement("tr");
        const tdOne = document.createElement("td");
        const tdTwo = document.createElement("td");
        tdOne.innerText = e[0];
        tdTwo.innerText = e[1];
        tr.appendChild(tdOne);
        tr.appendChild(tdTwo);
        table.appendChild(tr);
        console.log(array);
    });
};

const shortCutArrayCommon = [
    ["c", "Close current window"],
    ["m", "Minimise"],
    ["a", "Maximise"],
];

const shortCutArrayGlobal = [
    ["f1", "Open shortcut window"],
    ["f6", "Toggle dev tools"],
    ["f7", "Close all windows"],
];

const shortCutArrayHome = [
    ["1", "Open Video Home"],
    ["2", "Open Audio Home"],
    ["3", "Open Secret Folder"],
];

const shortCutArrayVideoHome = [
    ["f2", "Open video in specific file"],
    ["f4", "Sort video (name/time)"],
    ["Shift + R", "Reload video list"],
    ["1,2,3,4,5,6,7,8,9,0", "select and open video by index"],
    ["ArrowLeft", "Previous page"],
    ["ArrowRight", "Next page"],
];

const shortCutArrayVideoItem = [
    ["n", "Next video"],
    ["p", "Previous video"],
    ["u", "Volume up"],
    ["d", "Volume down"],
    ["s", "Start / stop video"],
    ["f", "10 sec forward"],
    ["b", "10 sec backward"],
    ["w", "Toggle full screen"],
    ["o", "save video data to open it again with same configration"],
    ["Shift + F", "Increase play back speed"],
    ["Shift + B", "Decrease play back speed"],
    [
        "1,2,3,4,5,6,7,8,9,0",
        "Mangnitude by which to increase or deccrease ([3 + Shift + F] to increase playback speed by 3)",
    ],
];

const shortCutArrayAudioHome = [
    ["n", "Next video"],
    ["p", "Previous video"],
    ["u", "Volume up"],
    ["d", "Volume down"],
    ["s", "Start / stop video"],
    ["f", "10 sec forward"],
    ["b", "10 sec backward"],
    ["q", "Close audio player"],
    ["Shift + Z", "Open in specific dir"],
    ["Shift + R", "Reload audio list"],
];

const shortCutArrayAudioItem = [
    ["n", "Next video"],
    ["p", "Previous video"],
    ["u", "Volume up"],
    ["d", "Volume down"],
    ["s", "Start / stop video"],
    ["f", "10 sec forward"],
    ["b", "10 sec backward"],
    ["q", "Close audio player"],
];

const shortCutArrayImageItem = [
    ["n", "Next image"],
    ["p", "Previous image"],
    ["Arrow Left", "Previous page"],
    ["Arrow Right", "Next page"],
    ["Shift + D", "Delete image"],
    ["Shift + C", "close full image"],
    ["Shift + J", "open dev tools"],
    ["r", "rotate image by 90 deg"],
];

createTable(tabel_global, shortCutArrayGlobal);
createTable(table_common, shortCutArrayCommon);
createTable(table_home, shortCutArrayHome);
createTable(table_video_home, shortCutArrayVideoHome);
createTable(table_video_item, shortCutArrayVideoItem);
createTable(table_audio_home, shortCutArrayAudioHome);
createTable(table_audio_item, shortCutArrayAudioItem);
createTable(table_image_item, shortCutArrayImageItem);

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
