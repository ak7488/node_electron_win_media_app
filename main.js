const fs = require("fs");
const os = require("os");
const electron = require("electron");
const getAllFileInSpecificDir = require("./src/BACK/getAllFileInSpecificDir");
const { videoHomeScreenMenu } = require("./src/BACK/menu");
const { createWindow } = require("./src/BACK/createWindow");
const crypto = require("crypto");

let isSortByTime = false;
const homeDir = os.homedir();
let videoItemWindow;
let videoHomeWindow;
let AudioHomeWindow;
let SecretFolderWindow;
let AudioItemWindow;
let videoDirURL = "";
let audioDirURL = "";
const { app, globalShortcut, ipcMain, Menu } = electron;
const menu = new Menu();

const main = async () => {
    createHiddenFunctionIfNotExists();
    const win = await app.whenReady().then(async () => {
        return await createWindow("./src/FRONT/Home/Home.html");
    });

    win.on("close", () => {
        app.quit();
    });
    globalShortcut.register("f6", () => {
        if (win.isFocused()) {
            win.webContents.toggleDevTools();
        }
        if (videoItemWindow && videoItemWindow.isFocused()) {
            videoItemWindow.webContents.toggleDevTools();
        }
        if (videoHomeWindow && videoHomeWindow.isFocused()) {
            videoHomeWindow.webContents.toggleDevTools();
        }
        if (AudioHomeWindow && AudioHomeWindow.isFocused()) {
            AudioHomeWindow.webContents.toggleDevTools();
        }
        if (SecretFolderWindow && SecretFolderWindow.isFocused()) {
            SecretFolderWindow.webContents.toggleDevTools();
        }
        if (AudioItemWindow && AudioItemWindow.isFocused()) {
            AudioItemWindow.webContents.toggleDevTools();
        }
    });

    globalShortcut.register("f1", async () => {
        if (
            win.isFocused() ||
            (videoItemWindow && videoItemWindow.isFocused()) ||
            (videoHomeWindow && videoHomeWindow.isFocused()) ||
            (AudioHomeWindow && AudioHomeWindow.isFocused()) ||
            (AudioItemWindow && AudioItemWindow.isFocused()) ||
            (SecretFolderWindow && SecretFolderWindow.isFocused())
        ) {
            return await createWindow("./src/FRONT/Shortcuts/Shortcuts.html");
        }
    });

    globalShortcut.register("f7", () => {
        app.quit();
    });

    ipcMain.on("openSecretFolderWindow", async () => {
        SecretFolderWindow = await createWindow(
            "./src/FRONT/SecretFolder/SecretFolder.html"
        );
    });

    ipcMain.on("openVideoWindow", async () => {
        videoDirURL = `${homeDir}/Videos`;
        videoHomeWindow = await createWindow(
            "./src/FRONT/videoHome/videoHome.html"
        );
        const videoNames = await getAllFileInSpecificDir(videoDirURL, ".mp4");
        videoHomeWindow.once("ready-to-show", () => {
            videoHomeWindow.webContents.send("kunal", { videoNames });
        });

        //setting shortcuts for videoHomeScreenMenu window
        videoHomeScreenMenu(
            menu,
            videoHomeWindow,
            videoItemWindow,
            isSortByTime,
            getAllFileInSpecificDir,
            videoDirURL,
            homeDir
        );

        //gets file from the given path and sends the video paths to videoHomeScreenMenu
        ipcMain.on("reloadVideoInSpecificDir", async (e, d) => {
            videoDirURL = d;
            const videoNames = await getAllFileInSpecificDir(d, ".mp4");
            videoHomeWindow.webContents.send("kunal", { videoNames });
        });
    });

    ipcMain.on("openAudioWindow", async () => {
        audioDirURL = `${homeDir}/Music`;
        AudioHomeWindow = await createWindow(
            "./src/FRONT/AudioHome/AudioHome.html"
        );
        const audioNames = await getAllFileInSpecificDir(audioDirURL, ".mp3");
        AudioHomeWindow.once("ready-to-show", () => {
            AudioHomeWindow.webContents.send("audioURLS", { audioNames });
        });

        //gets file from the given path and sends the audio dir paths to audioHomeScreenMenu
        ipcMain.on("reloadAudioInSpecificDir", async (e, d) => {
            audioDirURL = d;
            const AudioNames = await getAllFileInSpecificDir(d, ".mp3");
            AudioHomeWindow.webContents.send("AudioReloadData", { AudioNames });
        });
        //Reload the same folder
        ipcMain.on("reloadAudioHomeScreenRequestInSameDir", async () => {
            const AudioNames = await getAllFileInSpecificDir(
                audioDirURL,
                ".mp3"
            );
            AudioHomeWindow.webContents.send("AudioReloadData", { AudioNames });
        });
    });

    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    ipcMain.on("videos", async (e, d) => {
        //creating videoScreen and sending video path and other info with 1 sec delay
        videoItemWindow = await createWindow(
            "./src/FRONT/videoItem/VideoItem.html"
        );
        setTimeout(() => {
            videoItemWindow.webContents.send("videoItemData", d);
        }, 1000);
    });

    ipcMain.on("audioItemCall", async (e, data) => {
        AudioItemWindow = await createWindow(
            "./src/FRONT/AudioItem/AudioItem.html",
            325,
            720
        );
        setTimeout(() => {
            AudioItemWindow.webContents.send("audioItemData", data);
        }, 1000);
        AudioItemWindow.resizable = false;
    });

    ipcMain.on("hideFile", (_, { path, password }) => {
        const data = fs.readFileSync(path, { encoding: "base64" });
        const name = path.split("\\").reverse()[0];
        const type = path.split(".").reverse()[0];

        let algorithm = "aes-256-cbc";
        const key = getKey(password);
        const iv = crypto.randomBytes(8).toString("hex").slice(0, 16);
        const randomForName = Math.random().toString().replace(/\./, "");

        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted =
            cipher.update(data, "utf8", "hex") + cipher.final("hex");

        fs.writeFileSync(
            `./hidden/${name}${randomForName}.json`,
            JSON.stringify({
                iv: iv,
                path: path,
                name: name,
                type,
                data: encrypted,
            })
        );
        fs.unlinkSync(path);
    });

    ipcMain.on("getData", () => {
        let dataArray = [];
        const hidden = fs.readdirSync("./hidden");
        const jsonFiles = hidden.filter((e) => e.includes(".json"));

        jsonFiles.forEach((e) => {
            const json = fs.readFileSync(`./hidden/${e}`).toString();
            const { name, path, type } = JSON.parse(json);

            dataArray = [
                ...dataArray,
                {
                    name,
                    path,
                    type,
                },
            ];
        });
        SecretFolderWindow.webContents.send("data", dataArray);
    });

    ipcMain.on("previewDataRequest", (_, { password, name }) => {
        let algorithm = "aes-256-cbc";
        const key = getKey(password);
        const hidden = fs.readdirSync("./hidden");
        const jsonFiles = hidden.filter((e) => e.includes(name));
        const json = fs.readFileSync(`./hidden/${jsonFiles[0]}`).toString();
        const { iv, data, type } = JSON.parse(json);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted =
            decipher.update(data, "hex", "utf8") + decipher.final("utf8");
        SecretFolderWindow.webContents.send("previewDataResponce", {
            data: decrypted,
            type,
            name,
        });
    });

    ipcMain.on("unhideFileRequest", (_, { password, name }) => {
        let algorithm = "aes-256-cbc";
        const key = getKey(password);
        const hidden = fs.readdirSync("./hidden");
        const jsonFiles = hidden.filter((e) => e.includes(name));
        const json = fs.readFileSync(`./hidden/${jsonFiles[0]}`).toString();
        const { iv, data, type, path } = JSON.parse(json);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted =
            decipher.update(data, "hex", "utf8") + decipher.final("utf8");
        fs.writeFileSync(path, decrypted, { encoding: "base64" });
        fs.unlinkSync(`./hidden/${jsonFiles[0]}`);
    });
};

function createHiddenFunctionIfNotExists() {
    const files = fs.readdirSync("./");
    const isHiddenFileExists = files.includes("hidden");
    if (!isHiddenFileExists) {
        fs.mkdirSync("./hidden");
    }
}

function getKey(password) {
    let key = password;
    const len = password.length;
    const needMore = 32 - len;
    for (let i = 0; i < needMore; i++) {
        key += "k";
    }
    return key;
}

main();
