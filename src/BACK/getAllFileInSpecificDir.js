const fs = require("fs");

//providedPath = path in which all asked filed to be searched
//fileTypeArray = all the file type which this function will search for in the provided path
const getAllFileInSpecificDir = async (providedPath, fileType) => {
    try {
        let Files = [];

        //recursive function for finding file and if found some dir then call itself in that path
        const e = (path) => {
            let file = fs.readdirSync(path);

            file = file.filter((f) => {
                //checking if the path is a dir
                const isDir = fs.lstatSync(`${path}/${f}`).isDirectory();
                if (isDir) {
                    e(`${path}/${f}`);
                } else {
                    //checking for file type match
                    if (f.includes(fileType)) {
                        const currentPath = `${path}/${f}`;
                        const { mtime, size } = fs.statSync(currentPath);
                        Files.push({
                            path: currentPath,
                            name: f,
                            mtime,
                            size,
                        });
                    }
                }
            });
        };
        e(providedPath);
        return Files;
    } catch (e) {
        console.log(e);
    }
};

module.exports = getAllFileInSpecificDir;
