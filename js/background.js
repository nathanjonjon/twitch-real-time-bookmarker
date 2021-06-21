
function secondsToHMS(secs) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    var sign = secs < 0 ? '-' : '';
    secs = Math.abs(secs);
    return sign + z(secs / 3600 | 0) + ':' + z((secs % 3600) / 60 | 0) + ':' + z(secs % 60);
}

console.log("in background.js")

let stream_start_utc_ms = -1;
let username = "";
let bookmarks = [];
chrome.storage.sync.get(['bookmarks'], function (result) {
    bookmarks = result.bookmarks;
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // sendResponse can be used to send back a result to the content script or popup
    if (request.type == "sync_bookmarks") {
        chrome.storage.sync.get(['bookmarks'], function (result) {
            bookmarks = result.bookmarks;
        });
        sendResponse({ type: request.type, output: "ok"});
    }
})

chrome.commands.onCommand.addListener(function (command) {
    if (command == "pick-bookmark") {
        console.log('pick bookmark');
        chrome.storage.sync.get(['start_at'], function (result) {
            const current_utc_ms = Date.now();
            stream_start_utc_ms = result.start_at;
            const time_diff_seconds = Math.floor((current_utc_ms - stream_start_utc_ms) / 1000);
            const bookmark_time = secondsToHMS(time_diff_seconds);

            chrome.storage.sync.get(['bookmarks'], function (result) {
                bookmarks = result.bookmarks;
                bookmarks.push({ "time": bookmark_time, "label": "untitled" });
                chrome.storage.sync.set({ "bookmarks": bookmarks }, function () {
                    // send the new bookmark to popup.js
                    chrome.runtime.sendMessage({ type: "add_bookmark", bookmark: { "time": bookmark_time, "label": "untitled" } }, function (response) {
                        console.log("real-time bookmark: " + bookmark_time);
                    });

                });
            });

        });

    }

});
