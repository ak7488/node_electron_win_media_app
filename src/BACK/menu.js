const { Menu, MenuItem } = require("electron");
const { compare } = require("./compare");

// setting menu and shortcuts for videoHomescreen
// win = home screen object
// videoItemWindow = video screen object
// dirURL = current dir in which all the file is being displayed
// homeDir = home dir of the computer
function videoHomeScreenMenu(
    menu,
    win,
    videoItemWindow,
    isSortByTime,
    getAllFileInSpecificDir,
    dirURL,
    homeDir
) {
    menu.append(
        new MenuItem({
            label: "shortcuts",
            submenu: [
                {
                    role: "Minimise",
                    accelerator: "Alt+m+i",
                    click: () => {
                        win.minimize();
                    },
                },
                {
                    role: "Close",
                    accelerator: "Alt+k",
                    click: () => {
                        win.close();
                    },
                },
                {
                    role: "Toggle shortcut input",
                    accelerator: "Alt+v",
                    click: () => {
                        win.webContents.send("toggleV", "k");
                    },
                },
                {
                    role: "Toggle shortcut table",
                    accelerator: "f1",
                    click: () => {
                        win.webContents.send("toggleShwoShortCuts", "k");
                    },
                },
                {
                    role: "Open video in specific directry",
                    accelerator: "f2",
                    click: () => {
                        win.webContents.send("requestFileDir", "k");
                    },
                },
                {
                    role: "open dev tools",
                    accelerator: "f3",
                    click: () => {
                        win.webContents.openDevTools();
                        videoItemWindow.webContents.openDevTools();
                    },
                },
                {
                    role: "sort",
                    accelerator: "f4",
                    click: async () => {
                        const videoNames = await getAllFileInSpecificDir(
                            dirURL,
                            [".mp4"]
                        );
                        if (isSortByTime) {
                            win.webContents.send("kunal", { videoNames });
                            isSortByTime = !isSortByTime;
                        } else {
                            win.webContents.send("kunal", {
                                videoNames: videoNames.sort(compare),
                            });
                            isSortByTime = !isSortByTime;
                        }
                    },
                },
                {
                    role: "reload main screen",
                    accelerator: "r",
                    click: async () => {
                        win.reload();
                        const videoNames = await getAllFileInSpecificDir(
                            `${homeDir}/Videos`,
                            [".mp4"]
                        );
                        setTimeout(() => {
                            win.webContents.send("kunal", { videoNames });
                        }, 1000);
                    },
                },
            ],
        })
    );
    Menu.setApplicationMenu(menu);
}

// creating menu and shortcuts for videoScreen window
// videoItemWinow = video screen object
function videoScreenMenu(menu, videoItemWindow) {
    menu.append(
        new MenuItem({
            label: "Shortucts",
            submenu: [
                {
                    role: "Minimise",
                    accelerator: "CommandOrControl+m",
                    click: () => {
                        videoItemWindow.minimize();
                    },
                },
                {
                    role: "Close",
                    accelerator: "alt+c",
                    click: () => {
                        videoItemWindow.close();
                    },
                },
                {
                    role: "Decrease video speed by 0.5",
                    accelerator: "CommandOrControl+b",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "decreaseVideoSpeed"
                        );
                    },
                },
                {
                    role: "Increase video speed by 0.5",
                    accelerator: "CommandOrControl+f",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "increaseVideoSpeed"
                        );
                    },
                },
                {
                    role: "Previous video",
                    accelerator: "p",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "previousVideo"
                        );
                    },
                },
                {
                    role: "Next video",
                    accelerator: "n",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "nextVideo"
                        );
                    },
                },
                {
                    role: "Volume up",
                    accelerator: "u",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "volumeUp"
                        );
                    },
                },
                {
                    role: "Volume down",
                    accelerator: "d",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "volumeDown"
                        );
                    },
                },
                {
                    role: "10 seconds forward",
                    accelerator: "f",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "Forward"
                        );
                    },
                },
                {
                    role: "10 seconds backward",
                    accelerator: "b",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "Backword"
                        );
                    },
                },
                {
                    role: "Stop or start video",
                    accelerator: "s",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "stopOrStartVideo"
                        );
                    },
                },
                {
                    role: "full screen",
                    accelerator: "Alt+w",
                    click: () => {
                        videoItemWindow.webContents.send(
                            "changeVideo",
                            "FullScreen"
                        );
                    },
                },
            ],
        })
    );
    Menu.setApplicationMenu(menu);
}

module.exports = {
    videoScreenMenu,
    videoHomeScreenMenu,
};
