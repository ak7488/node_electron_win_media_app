const { ipcRenderer, remote } = require("electron");

const btn_1 = document.getElementById("main_btn_1");
const btn_2 = document.getElementById("main_btn_2");
const btn_3 = document.getElementById("main_btn_3");
const minimise = document.getElementById("minimise");
const maximise = document.getElementById("maximise");
const close = document.getElementById("close");

const openVideoWindowHandler = () => {
    ipcRenderer.send("openVideoWindow", "openVideoWindow");
    console.log("ok");
};
const openAudioWindowHandler = () => {
    ipcRenderer.send("openAudioWindow", "openAudioWindow");
    console.log("ok");
};
const openSecretFolderWindowHandler = () => {
    ipcRenderer.send("openSecretFolderWindow", "openSecretFolderWindow");
    console.log("ok");
};
const minimiseHandler = () => {
    remote.getCurrentWindow().minimize();
};
const maximiseHandler = () => {
    remote.getCurrentWindow().maximize();
};
const closeWindowHandler = () => {
    remote.getCurrentWindow().close();
};

btn_1.onclick = openVideoWindowHandler;
btn_2.onclick = openAudioWindowHandler;
btn_3.onclick = openSecretFolderWindowHandler;
minimise.onclick = minimiseHandler;
maximise.onclick = maximiseHandler;
close.onclick = closeWindowHandler;

document.onkeypress = (e) => {
    switch (e.key) {
        case "1":
            openVideoWindowHandler();
            break;
        case "2":
            openAudioWindowHandler();
            break;
        case "3":
            openSecretFolderWindowHandler();
            break;
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
