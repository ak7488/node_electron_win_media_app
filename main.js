const fs = require("fs");
const os = require("os");
const electron = require("electron");
const getAllFileInSpecificDir = require("./src/BACK/getAllFileInSpecificDir");
const { videoHomeScreenMenu } = require("./src/BACK/menu");
const { createWindow } = require("./src/BACK/createWindow");
const crypto = require("crypto");
const { BrowserWindow } = require("electron");

let isSortByTime = false;
const homeDir = os.homedir();
let videoItemWindow;
let videoHomeWindow;
let AudioHomeWindow;
let ImageHomeWindow;
let SecretFolderWindow;
let AudioItemWindow;
let videoDirURL = "";
let audioDirURL = "";
let imgDirUrl = "";
const { app, globalShortcut, ipcMain, Menu } = electron;
const menu = new Menu();
const audioTypes = [".mp3", ".mpeg", ".wav", ".ogg"];
const videoTypes = [".mp4", ".mkv", ".webm", ".opgg"];
const imageTypes = [".png", ".jpg", ".jpeg", ".webp"];

const main = async () => {
  createFolderOrFileIfNotExists(homeDir, "hidden", true);
  const win = await app.whenReady().then(async () => {
    return await createWindow("./src/FRONT/Home/Home.html");
  });

  win.on("close", () => {
    app.quit();
  });

  globalShortcut.register("f6", () => {
    BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
  });

  globalShortcut.register("f1", async () => {
    if (win.isFocused() || BrowserWindow.getFocusedWindow()) {
      return await createWindow("./src/FRONT/Shortcuts/Shortcuts.html");
    }
  });

  // globalShortcut.register("f1", () => {
  //   if (BrowserWindow.getFocusedWindow()) {
  //     BrowserWindow.getFocusedWindow().webContents.reload();
  //   }
  // });

  globalShortcut.register("f7", () => {
    app.quit();
  });

  ipcMain.on("openSecretFolderWindow", async () => {
    SecretFolderWindow = await createWindow(
      "./src/FRONT/SecretFolder/SecretFolder.html"
    );
  });

  ipcMain.on("close", () => {
    BrowserWindow.getFocusedWindow().close();
  });

  ipcMain.on("minimize", () => {
    BrowserWindow.getFocusedWindow().minimize();
  });

  ipcMain.on("maximize", () => {
    BrowserWindow.getFocusedWindow().maximize();
  });

  ipcMain.on("openVideoWindow", async () => {
    videoDirURL = `${homeDir}/Videos`;
    videoHomeWindow = await createWindow(
      "./src/FRONT/videoHome/videoHome.html"
    );
    const videoNames = await getAllFileInSpecificDir(videoDirURL, videoTypes);
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
      homeDir,
      videoTypes
    );

    //gets file from the given path and sends the video paths to videoHomeScreenMenu
    ipcMain.on("reloadVideoInSpecificDir", async (e, d) => {
      videoDirURL = d;
      const videoNames = await getAllFileInSpecificDir(d, videoTypes);
      videoHomeWindow.webContents.send("kunal", { videoNames });
      videoHomeScreenMenu(
        menu,
        videoHomeWindow,
        videoItemWindow,
        isSortByTime,
        getAllFileInSpecificDir,
        videoDirURL,
        homeDir,
        videoTypes
      );
    });
  });

  ipcMain.on("openAudioWindow", async () => {
    audioDirURL = `${homeDir}/Music`;
    AudioHomeWindow = await createWindow(
      "./src/FRONT/AudioHome/AudioHome.html"
    );
    const audioNames = await getAllFileInSpecificDir(audioDirURL, audioTypes);
    AudioHomeWindow.once("ready-to-show", () => {
      AudioHomeWindow.webContents.send("audioURLS", { audioNames });
    });

    //gets file from the given path and sends the audio dir paths to audioHomeScreenMenu
    ipcMain.on("reloadAudioInSpecificDir", async (e, d) => {
      audioDirURL = d;
      const AudioNames = await getAllFileInSpecificDir(d, audioTypes);
      AudioHomeWindow.webContents.send("AudioReloadData", { AudioNames });
    });
    //Reload the same folder
    ipcMain.on("reloadAudioHomeScreenRequestInSameDir", async () => {
      const AudioNames = await getAllFileInSpecificDir(audioDirURL, audioTypes);
      AudioHomeWindow.webContents.send("AudioReloadData", { AudioNames });
    });
  });

  ipcMain.on("openImageWindow", async () => {
    imgDirUrl = `${homeDir}/Pictures`;
    ImageHomeWindow = await createWindow("./src/FRONT/Image/Image.html");
    const ImagNames = await getAllFileInSpecificDir(imgDirUrl, imageTypes);
    ImageHomeWindow.once("ready-to-show", () => {
      ImageHomeWindow.webContents.send("imgURLS", { ImagNames });
    });

    ipcMain.on("reloadImageInSpecificDir", async (e, d) => {
      imgDirUrl = d;
      const ImageNames = await getAllFileInSpecificDir(d, imageTypes);
      ImageHomeWindow.webContents.send("ImageReloadData", { ImageNames });
    });

    ipcMain.on("reloadImageHomeScreenRequestInSameDir", async () => {
      const ImageNames = await getAllFileInSpecificDir(imgDirUrl, imageTypes);
      ImageHomeWindow.webContents.send("ImageReloadData", { ImageNames });
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  ipcMain.on("videos", async (e, data) => {
    createFolderOrFileIfNotExists(
      homeDir,
      "videoData.json",
      false,
      JSON.stringify([])
    );
    const VideoDataJson = fs
      .readFileSync(`${homeDir}/videoData.json`)
      .toString();
    let VideoDataArray = JSON.parse(VideoDataJson);
    VideoDataArray = VideoDataArray.filter((e) => e.name == data.item.name);

    //creating videoScreen and sending video path and other info with 1 sec delay
    videoItemWindow = await createWindow(
      "./src/FRONT/videoItem/VideoItem.html"
    );
    setTimeout(() => {
      if (VideoDataArray.length !== 0) {
        videoItemWindow.webContents.send("videoData", VideoDataArray[0]);
      }
      videoItemWindow.webContents.send("videoItemData", data);
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
    let encrypted = cipher.update(data, "utf8", "hex") + cipher.final("hex");

    fs.writeFileSync(
      `${homeDir}/hidden/${name}${randomForName}.json`,
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
    const hidden = fs.readdirSync(`${homeDir}/hidden`);
    const jsonFiles = hidden.filter((e) => e.includes(".json"));

    jsonFiles.forEach((e) => {
      const json = fs.readFileSync(`${homeDir}/hidden/${e}`).toString();
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
    const hidden = fs.readdirSync(`${homeDir}/hidden`);
    const jsonFiles = hidden.filter((e) => e.includes(name));
    const json = fs
      .readFileSync(`${homeDir}/hidden/${jsonFiles[0]}`)
      .toString();
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
    const hidden = fs.readdirSync(`${homeDir}/hidden`);
    const jsonFiles = hidden.filter((e) => e.includes(name));
    const json = fs
      .readFileSync(`${homeDir}/hidden/${jsonFiles[0]}`)
      .toString();
    const { iv, data, type, path } = JSON.parse(json);

    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted =
      decipher.update(data, "hex", "utf8") + decipher.final("utf8");
    fs.writeFileSync(path, decrypted, { encoding: "base64" });
    fs.unlinkSync(`${homeDir}/hidden/${jsonFiles[0]}`);
  });

  ipcMain.on(
    "sendVideoDataToMain",
    (_, { currentTime, volume, name, videoPlayBackSpeed }) => {
      createFolderOrFileIfNotExists(
        homeDir,
        "videoData.json",
        false,
        JSON.stringify([])
      );
      const dataJson = fs.readFileSync(`${homeDir}/videoData.json`).toString();
      let data = JSON.parse(dataJson);
      data = data.filter((e) => e.name !== name);
      const VideoData = [
        ...data,
        { currentTime, volume, name, videoPlayBackSpeed },
      ];
      fs.writeFileSync(`${homeDir}/videoData.json`, JSON.stringify(VideoData));
    }
  );
};

function createFolderOrFileIfNotExists(
  pathToSearch,
  fileOrFolderName,
  isDir,
  defaultData
) {
  const files = fs.readdirSync(pathToSearch);
  const isGivenFileOrFolderExists = files.includes(fileOrFolderName);
  if (!isGivenFileOrFolderExists) {
    if (isDir) {
      fs.mkdirSync(`${pathToSearch}/${fileOrFolderName}`);
    } else {
      fs.writeFileSync(`${pathToSearch}/${fileOrFolderName}`, defaultData);
    }
  }
}

function getKey(password) {
  let key = password.slice(0, 31);
  const len = key.length;
  const needMore = 32 - len;
  for (let i = 0; i < needMore; i++) {
    key += "k";
  }
  return key;
}

main();
