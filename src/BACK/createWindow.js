const { BrowserWindow } = require("electron");

//create window function
// filepath = html to load in the created window
const createWindow = async (filePath) => {
    const win = new BrowserWindow({
        width: 1200,
        heigh: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInSubFrames: true,
            enableRemoteModule: true,
        },
        frame: false,
        icon: __dirname + "./src/assets/1video.ico",
    });

    win.loadFile(filePath);
    return win;
};

module.exports = {
    createWindow,
};
