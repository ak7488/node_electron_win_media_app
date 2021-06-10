const { BrowserWindow } = require("electron");

//create window function
// filepath = html to load in the created window
const createWindow = async (filePath, height = 720, width = 720) => {
    const win = new BrowserWindow({
        width,
        height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInSubFrames: true,
            enableRemoteModule: true,
        },
        frame: false,
        icon: __dirname + "../assets/1video.ico",
    });

    win.loadFile(filePath);
    return win;
};

module.exports = {
    createWindow,
};
