//compare function for short array by time
function compare(a, b) {
    if (a.mtime > b.mtime) {
        return -1;
    } else {
        return 1;
    }
}

module.exports = {
    compare,
};
