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
                    role: "Open video in specific directry",
                    accelerator: "f2",
                    click: () => {
                        win.webContents.send("requestFileDir", "k");
                    },
                },
                {
                    role: "sort",
                    accelerator: "f4",
                    click: async () => {
                        const videoNames = await getAllFileInSpecificDir(
                            dirURL,
                            ['.mp4', '.mkv']
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
                    role: "reload video main screen",
                    accelerator: "Shift+R",
                    click: async () => {
                        win.reload();
                        const videoNames = await getAllFileInSpecificDir(
                            `${homeDir}/Videos`,
                            ['.mp4', '.mkv']
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
