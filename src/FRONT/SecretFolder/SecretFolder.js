const { ipcRenderer, remote } = require("electron");
const React = require("react");
const ReactDom = require("react-dom");

const select = document.getElementById("select");
const Set_div = document.getElementById("Set");
const Get_div = document.getElementById("Get");
const selectFileButton = document.getElementById("selectFileButton");
const passwordInput = document.getElementById("input_password_for_file");
const HideButton = document.getElementById("hide_button");
const prompt = document.getElementById("prompt");
const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");
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
select.onchange = ShowOrHideSetAndGetHandler;
selectFileButton.onclick = selectFileHandler;
HideButton.onclick = HideFileHandler;

let pathOfTheFileWhichToBeHideen = "";
let items = [];

function ShowOrHideSetAndGetHandler(e) {
    const value = e.target.value;
    if (value === "set") {
        Set_div.className = "Set";
        Get_div.className = "Get hide";
    } else if (value === "get") {
        Set_div.className = "Set hide";
        Get_div.className = "Get";
        getData();
    }
}

async function selectFileHandler(e) {
    const { dialog } = require("electron").remote;

    const pathObj = await dialog.showOpenDialog({
        properties: ["openFile"],
    });
    const filePath = pathObj.filePaths[0];
    if (!filePath) {
        fileName.innerText = "";
        fileName.className = "";
        return;
    }
    fileName.innerText = filePath;
    fileName.className = "fileName";
    pathOfTheFileWhichToBeHideen = filePath;
}

function HideFileHandler() {
    const password = passwordInput.value;
    ipcRenderer.send("hideFile", {
        path: pathOfTheFileWhichToBeHideen,
        password,
    });
    fileName.innerText = "";
    fileName.className = "";
    pathOfTheFileWhichToBeHideen = "";
    passwordInput.value = "";
}

function getData() {
    ipcRenderer.send("getData", "getData");
}

ipcRenderer.on("data", (_, data) => {
    items = data;
    loadFileItems();
});

ipcRenderer.on("previewDataResponce", (_, { data, type }) => {
    let element;
    if (preview.className.includes("hide")) {
        if (type === "jpg" || type === "png" || type === "jpeg") {
            element = document.createElement("img");
            element.src = `data:image/${type};base64,${data}`;
        } else if (type === "mp4") {
            element = document.createElement("video");
            element.src = `data:video/${type};base64,${data}`;
            element.controls = true;
        } else if (type === "mp3") {
            element = document.createElement("audio");
            element.src = `data:audio/${type};base64,${data}`;
        }
        element.className = "preview_element";
        preview.className = "preview";
        preview.appendChild(element);
        preview.onclick = () => {
            preview.className = "preview hide";
            preview.removeChild(element);
        };
    } else {
        preview.className = "preview hide";
        preview.removeChild(element);
    }
});

function hideOrShowPrompt({ type, name, path }) {
    if (prompt.className.includes("hide")) {
        const alloedType = ["mp3", "mp4", "png", "jpg", "jpeg"];

        const previewFileButton = document.createElement("button");
        const unHideFileButton = document.createElement("button");
        const closePromptButton = document.createElement("button");
        const passwordInput = document.createElement("input");
        const promptInner = document.createElement("div");

        previewFileButton.innerText = "Preview file";
        unHideFileButton.innerText = "Unhide file";
        closePromptButton.innerText = "Close";
        passwordInput.type = "password";
        passwordInput.autofocus = true;

        previewFileButton.className = "prompt_btn";
        unHideFileButton.className = "prompt_btn";
        passwordInput.className = "prompt_input";
        closePromptButton.className = "prompt_btn danger";
        promptInner.className = "promptInner";

        promptInner.appendChild(passwordInput);
        if (alloedType.includes(type)) {
            promptInner.appendChild(previewFileButton);
        }
        promptInner.appendChild(unHideFileButton);
        promptInner.appendChild(closePromptButton);
        prompt.appendChild(promptInner);

        prompt.className = "prompt";

        previewFileButton.onclick = () => {
            if (!passwordInput.value) return;
            ipcRenderer.send("previewDataRequest", {
                password: passwordInput.value,
                name: name,
            });
            prompt.className = "prompt hide";
            prompt.removeChild(promptInner);
        };
        closePromptButton.onclick = () => {
            prompt.className = "prompt hide";
            prompt.removeChild(promptInner);
        };
    } else {
        prompt.className = "prompt hide";
        prompt.removeChild(promptInner);
    }
}

const FileItem = ({ item, index }) => {
    return /*#__PURE__*/ React.createElement(
        "div",
        {
            className: "FileItem",
            onClick: () => hideOrShowPrompt(item),
        },
        /*#__PURE__*/ React.createElement(
            "h3",
            {
                className: "FileItem__h3__name",
            },
            `${index + 1}). ${item.name}`
        ),
        /*#__PURE__*/ React.createElement(
            "p",
            {
                className: "FileItem__p__path",
            },
            item.type
        )
    );
};

const FileElement = () => {
    return /*#__PURE__*/ React.createElement(
        "div",
        {
            className: "FileElement",
        },
        items.lenght === 0
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
                      "No File Yet!"
                  )
              )
            : /*#__PURE__*/ React.createElement(
                  "div",
                  {
                      className: "VideoElement__FileItem__container",
                  },
                  items.map((e, index) =>
                      /*#__PURE__*/ React.createElement(FileItem, {
                          key: index,
                          item: e,
                          index: index,
                      })
                  )
              )
    );
};

function loadFileItems() {
    ReactDom.render(FileElement(), document.getElementById("root"));
}

function invertSelect() {
    if (select.value === "set") {
        select.value = "get";
        Set_div.className = "Set";
        Get_div.className = "Get hide";
    } else {
        select.value = "set";
        Set_div.className = "Set hide";
        Get_div.className = "Get";
        getData();
    }
}

window.onkeypress = (e) => {
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
        case "i":
            invertSelect();
            break;
    }
};
