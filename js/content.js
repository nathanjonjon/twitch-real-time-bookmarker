
async function main(content_event) {
    let username = (window.location.href.replace('https://www.twitch.tv/', '')).replace('/', '');
    await chrome.storage.sync.set({ "curr_username": username }, function () {
        console.log("Welcome, " + username + "! Enjoy using Catapult's Live Bookmarking extension for Twitch!");
    });
    let data = {};
    chrome.storage.sync.get({ "data": data }, function (result) {
        data = result.data;
        if (content_event == "url_changed" && data[username]["start_at"] != undefined) {
            return;
        }
        const url = `https://api.twitch.tv/helix/streams?user_login=${username}`;
        fetch(url)
            .then((response) => {
                console.log(response);
                if (response.status == 201) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then((stream_info) => {
                const started_at = stream_info.started_at;
                const stream_start_utc_ms = Date.parse(started_at);

                if (username in data) {
                    if (stream_start_utc_ms == data[username]["start_at"]) {
                        console.log(`data intact with the same stream of existing streamer, {${username}: ${data[username]}}`)
                        return;
                    }
                }
                data[username] = { "start_at": stream_start_utc_ms, "bookmarks": [] };
                chrome.storage.sync.set({ "data": data }, function () {
                    if (username in data) {
                        console.log(`data updated with new stream of existing streamer, {${username}: ${data[username]}}`);
                    }
                    else {
                        console.log(`data updated with new stream of new streamer, {${username}: ${data[username]}}`);
                    }
                });
            })
        return
    });
}

window.onload = function () {
    console.log('window onload');
    main("page_loaded");
}

console.log("url_changed");
main("url_changed");
