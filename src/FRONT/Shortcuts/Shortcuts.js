const { remote } = require("electron");

const table_common = document.getElementById("table_common");
const tabel_global = document.getElementById("tabel_global");
const table_home = document.getElementById("table_home");
const table_video_home = document.getElementById("table_video_home");
const table_video_item = document.getElementById("table_video_item");
const table_audio_home = document.getElementById("table_audio_home");
const table_audio_item = document.getElementById("table_audio_item");

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
    ["Alt + v", "Toggle screen open input"],
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
    ["Shift + F", "Increase play back speed"],
    ["Shift + B", "Decrease play back speed"],
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

createTable(tabel_global, shortCutArrayGlobal);
createTable(table_common, shortCutArrayCommon);
createTable(table_home, shortCutArrayHome);
createTable(table_video_home, shortCutArrayVideoHome);
createTable(table_video_item, shortCutArrayVideoItem);
createTable(table_audio_home, shortCutArrayAudioHome);
createTable(table_audio_item, shortCutArrayAudioItem);

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
