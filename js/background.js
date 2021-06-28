
function secondsToHMS(secs) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    var sign = secs < 0 ? '-' : '';
    secs = Math.abs(secs);
    return sign + z(secs / 3600 | 0) + ':' + z((secs % 3600) / 60 | 0) + ':' + z(secs % 60);
}

console.log('inside background.js');

let curr_username = "";
chrome.storage.sync.get(['curr_username'], function (result) {
    curr_username = result.curr_username;
});

let data = {};
chrome.storage.sync.get(['data'], function (result) {
    data = result.data;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // sendResponse can be used to send back a result to the content script or popup
    if (request.type == "sync_bookmarks") {
        chrome.storage.sync.get(['data'], function (result) {
            data = result.data;
        });
        sendResponse({ type: request.type, output: "ok" });
    }
})

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    // reset the username on tab change
    chrome.storage.sync.set({ "curr_username": "" }, function () {
        console.log("reset username to empty string on tab change");
    });
    chrome.tabs.executeScript(activeInfo.tabId, {
        file: 'js/content.js',
    });
});

chrome.tabs.onUpdated.addListener(function (activeInfo) {
    // reset the username on tab change
    chrome.storage.sync.set({ "curr_username": "" }, function () {
        console.log("reset username to empty string on tab change");
    });
    chrome.tabs.executeScript(activeInfo.tabId, {
        file: 'js/content.js',
    });
});


chrome.commands.onCommand.addListener(function (command) {

    if (command == "pick-bookmark") {
        chrome.storage.sync.get(['data'], function (result) {
            data = result.data;
            chrome.storage.sync.get(['curr_username'], function (result) {
                curr_username = result.curr_username;
                if (!(curr_username in data)) {
                    console.log(`The live stream of ${curr_username} is not in progress or the link.`);
                    return;
                }
                const stream_start_utc_ms = data[curr_username]["start_at"];
                const current_utc_ms = Date.now();
                const time_diff_seconds = Math.floor((current_utc_ms - stream_start_utc_ms) / 1000);
                const bookmark_time = secondsToHMS(time_diff_seconds);
                chrome.storage.sync.get(['data'], function (result) {
                    data = result.data;
                    const new_bookmark = { "time": bookmark_time, "label": "untitled" };
                    data[curr_username]["bookmarks"].push(new_bookmark);
                    chrome.storage.sync.set({ "data": data }, function () {
                        // send the new bookmark to popup.js
                        chrome.runtime.sendMessage({ type: "add_bookmark", bookmark: new_bookmark }, function (response) {
                            console.log("real-time bookmark: " + bookmark_time);
                        });
                    });
                });
            });
        });

    }

});
