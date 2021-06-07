const os = require("os");
const electron = require("electron");
const getAllFileInSpecificDir = require("./src/BACK/getAllFileInSpecificDir");
const { videoHomeScreenMenu, videoScreenMenu } = require("./src/BACK/menu");
const { createWindow } = require("./src/BACK/createWindow");

let isSortByTime = false;
const homeDir = os.homedir();
let dirURL = `${homeDir}/Videos`;
const { app, globalShortcut, ipcMain, Menu } = electron;

const main = async () => {
    const win = await app.whenReady().then(async () => {
        return await createWindow("./src/FRONT/index.html");
    });
    const videoNames = await getAllFileInSpecificDir(dirURL, [".mp4"]);
    win.once("ready-to-show", () => {
        win.webContents.send("kunal", { videoNames });
    });

    win.on("close", () => {
        app.quit();
    });

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    const menu = new Menu();
    let videoItemWindow;

    ipcMain.on("videos", async (e, d) => {
        //creating videoScreen and sending video path and other info with 1 sec delay
        videoItemWindow = await createWindow("./src/FRONT/VideoItem.html");
        setTimeout(() => {
            videoItemWindow.webContents.send("videoItemData", d);
        }, 1000);

        //setting global shortcut for maximising video screen
        globalShortcut.register("CommandOrControl+a", () => {
            videoItemWindow.maximize();
        });

        //setting shortcuts for videoscreen
        videoScreenMenu(menu, videoItemWindow);
    });

    //setting global shortcut for maximising home screen
    globalShortcut.register("Alt+m+a", () => {
        win.maximize();
    });

    //setting shortcuts for videoHomeScreenMenu window where win is videoHomeScreenMenu object
    videoHomeScreenMenu(
        menu,
        win,
        videoItemWindow,
        isSortByTime,
        getAllFileInSpecificDir,
        dirURL,
        homeDir
    );

    //gets file from the given path and sends the video paths to videoHomeScreenMenu
    ipcMain.on("reloadVideoInSpecificDir", async (e, d) => {
        dirURL = d;
        const videoNames = await getAllFileInSpecificDir(d, [".mp4"]);
        win.webContents.send("kunal", { videoNames });
    });
};

main();
