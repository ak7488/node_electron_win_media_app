const { ipcRenderer } = require("electron");
const React = require("react");
const ReactDom = require("react-dom");

let VideoNames = [];

const onVideoItemClickHandler = (item) => {
    if (!item.path || !item.name) return;
    ipcRenderer.send("videos", { VideoNames, item });
};

const VideoItem = ({ item, index }) => {
    return /*#__PURE__*/ React.createElement(
        "div",
        {
            className: "videoItem",
            onClick: () => onVideoItemClickHandler(item),
        },
        /*#__PURE__*/ React.createElement(
            "h3",
            {
                className: "videoItem__h3__name",
            },
            `${index + 1}). ${item.name}`
        ),
        /*#__PURE__*/ React.createElement(
            "p",
            {
                className: "videoItem__p__path",
            },
            item.path
        )
    );
};

const VideoElement = () => {
    return /*#__PURE__*/ React.createElement(
        "div",
        {
            className: "VideoElement",
        },
        VideoNames.lenght === 0
            ? /*#__PURE__*/ React.createElement(
                  "div",
                  {
                      className: "VideoElement__no_video_yet__container",
                  },
                  /*#__PURE__*/ React.createElement(
                      "p",
                      {
                          className: "VideoElement__no_video_yet__p",
                      },
                      "No Video Yet!"
                  )
              )
            : /*#__PURE__*/ React.createElement(
                  "div",
                  {
                      className: "VideoElement__videoItem__container",
                  },
                  VideoNames.map((e, index) =>
                      /*#__PURE__*/ React.createElement(VideoItem, {
                          key: index,
                          item: e,
                          index: index,
                      })
                  )
              )
    );
};

const addVideo = () => {
    ReactDom.render(VideoElement(), document.getElementById("root"));
};

ipcRenderer.on("kunal", (e, { videoNames }) => {
    VideoNames = videoNames;
    addVideo();
});

let isShow = false;

document.getElementById("shortCuts").style.display = "none";

ipcRenderer.on("toggleShwoShortCuts", () => {
    if (isShow) {
        document.getElementById("shortCuts").style.display = "none";
        isShow = false;
    } else {
        document.getElementById("shortCuts").style.display = "block";
        isShow = true;
    }
});

let isFormShow = false;

ipcRenderer.on("toggleV", () => {
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const root = document.getElementById("root");

    root.scrollTo(0, 0);

    if (isFormShow) {
        form.className = "form_show";
        isFormShow = !isFormShow;
        input.focus();
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const number = input.value;
            if (!number || number > VideoNames.length || number < 0)
                return (number = 0);
            onVideoItemClickHandler(VideoNames[number - 1]);
        });
    } else {
        form.className = "";
        isFormShow = !isFormShow;
        root.focus();
    }
});

ipcRenderer.on("requestFileDir", async () => {
    const { dialog } = require("electron").remote;

    var path = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    ipcRenderer.send("reloadVideoInSpecificDir", path.filePaths[0]);
});
