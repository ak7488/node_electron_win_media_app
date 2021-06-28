const { ipcRenderer, remote } = require("electron");
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

// let isFormShow = false;

// ipcRenderer.on("toggleV", () => {
//     const form = document.getElementById("form");
//     const input = document.getElementById("input");
//     const root = document.getElementById("root");

//     root.scrollTo(0, 0);

//     if (isFormShow) {
//         form.className = "form_show";
//         isFormShow = !isFormShow;
//         input.focus();
//         form.addEventListener("submit", (e) => {
//             e.preventDefault();
//             const number = input.value;
//             if (!number || number > VideoNames.length || number < 0)
//                 return (number = 0);
//             onVideoItemClickHandler(VideoNames[number - 1]);
//         });
//     } else {
//         form.className = "";
//         isFormShow = !isFormShow;
//         root.focus();
//     }
// });

ipcRenderer.on("requestFileDir", async () => {
    const dialog = remote.dialog;

    var path = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    ipcRenderer.send("reloadVideoInSpecificDir", path.filePaths[0]);
});

//Windows three main controls
const minimise = document.getElementById("minimise");
const maximise = document.getElementById("maximise");
const close = document.getElementById("close");

const minimiseHandler = () => {
    remote.getCurrentWindow().minimize();
};
const maximiseHandler = () => {
    remote.getCurrentWindow().maximize();
};
const closeWindowHandler = () => {
    remote.getCurrentWindow().close();
};

minimise.onclick = minimiseHandler;
maximise.onclick = maximiseHandler;
close.onclick = closeWindowHandler;

document.onkeypress = (e) => {
    switch (e.key) {
        case "m":
            minimiseHandler();
            break;
        case "a":
            maximiseHandler();
            break;
        case "c":
            closeWindowHandler();
            break;
    }
};

//video open by number
let a = []
const num = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
const dis = document.getElementById('dis')
const numInput = document.getElementById('numInput')

window.onkeydown = (e) => {
    const b = parseInt(a.toString().replace(/\,/g, ''))
    if (e.key === 'Backspace' && a.length > 0) {
        a.pop();
    } else if (num.includes(e.key)) {
        a.push(e.key)
    } else if (e.key === 'Enter' && b < VideoNames.length && b > 0) {
        onVideoItemClickHandler(VideoNames[b - 1]);
    }
    if (a.length > 0) {
        dis.className = 'dis show'
        numInput.innerText = 'Video num: ' + a.toString().replace(/\,/g, '')
    } else {
        dis.className = 'dis'
    }
}