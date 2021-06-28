
async function main() {
    let username = (window.location.href.replace('https://www.twitch.tv/', '')).replace('/', '');
    await chrome.storage.sync.set({ "curr_username": username }, function () {
        console.log("Welcome, " + username + "! Enjoy using Catapult's Live Bookmarking extension for Twitch!");
    });
    let data = {};
    chrome.storage.sync.get({ "data": data }, function (result) {
        data = result.data;
        if (username in data) {
            const current_utc_ms = Date.now();
            const time_diff_seconds = Math.floor((current_utc_ms - data[username]["start_at"]) / 1000);
            if (time_diff_seconds < 3600) {
                console.log("It has been less than 1 hour from the start_at time, so I assume the stream is not finished.")
                return;
            }
        }
        if (username == "") {
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
                /*
                    need to overwrite data under one of the conditions:
                    1. username in data but start_at time is different
                    2. username is not in data
                */
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


main();
