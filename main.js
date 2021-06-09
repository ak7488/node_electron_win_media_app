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
let dirURL = "";
const { app, globalShortcut, ipcMain, Menu } = electron;
const menu = new Menu();

const main = async () => {
    const win = await app.whenReady().then(async () => {
        return await createWindow("./src/FRONT/Home/Home.html");
    });

    win.on("close", () => {
        app.quit();
    });
    globalShortcut.register("f6", () => {
        win.webContents.toggleDevTools();
        if (videoItemWindow) {
            videoItemWindow.webContents.toggleDevTools();
        }
        if (videoHomeWindow) {
            videoHomeWindow.webContents.toggleDevTools();
        }
        if (AudioHomeWindow) {
            AudioHomeWindow.webContents.toggleDevTools();
        }
        if (SecretFolderWindow) {
            SecretFolderWindow.webContents.toggleDevTools();
        }
    });

    ipcMain.on("openSecretFolderWindow", async () => {
        SecretFolderWindow = await app.whenReady().then(async () => {
            return await createWindow(
                "./src/FRONT/SecretFolder/SecretFolder.html"
            );
        });
    });

    ipcMain.on("openVideoWindow", async () => {
        dirURL = `${homeDir}/Videos`;
        videoHomeWindow = await app.whenReady().then(async () => {
            return await createWindow("./src/FRONT/videoHome/videoHome.html");
        });
        const videoNames = await getAllFileInSpecificDir(dirURL, [".mp4"]);
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
            dirURL,
            homeDir
        );

        //gets file from the given path and sends the video paths to videoHomeScreenMenu
        ipcMain.on("reloadVideoInSpecificDir", async (e, d) => {
            dirURL = d;
            const videoNames = await getAllFileInSpecificDir(d, [".mp4"]);
            videoHomeWindow.webContents.send("kunal", { videoNames });
        });
    });

    ipcMain.on("openAudioWindow", async () => {
        dirURL = `${homeDir}/Music`;
        AudioHomeWindow = await createWindow(
            "./src/FRONT/AudioHome/AudioHome.html"
        );
        const audioNames = await getAllFileInSpecificDir(dirURL, [".mp3"]);
        AudioHomeWindow.once("ready-to-show", () => {
            AudioHomeWindow.webContents.send("audioURLS", { audioNames });
        });

        //gets file from the given path and sends the video paths to audioHomeScreenMenu
        ipcMain.on("reloadVideoInSpecificDir", async (e, d) => {
            dirURL = d;
            const videoNames = await getAllFileInSpecificDir(d, [".mp3"]);
            AudioHomeWindow.webContents.send("kunal", { videoNames });
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

    ipcMain.on("hideFile", (_, { path, password }) => {
        const data = fs.readFileSync(path, { encoding: "base64" });
        const name = path.split("\\").reverse()[0];
        const type = path.split(".").reverse()[0];
        console.log("name", name, "password", password, "path", path);

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
        console.log(password, name);
        let algorithm = "aes-256-cbc";
        const key = getKey(password);
        const hidden = fs.readdirSync("./hidden");
        console.log("hidden", hidden);
        const jsonFiles = hidden.filter((e) => e.includes(name));
        console.log(jsonFiles.length);
        const json = fs.readFileSync(`./hidden/${jsonFiles[0]}`).toString();
        const { iv, data, type } = JSON.parse(json);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted =
            decipher.update(data, "hex", "utf8") + decipher.final("utf8");
        SecretFolderWindow.webContents.send("previewDataResponce", {
            data: decrypted,
            type,
        });
    });
};

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
