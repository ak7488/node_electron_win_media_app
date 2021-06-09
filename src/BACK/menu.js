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

module.exports = {
    videoHomeScreenMenu,
};
