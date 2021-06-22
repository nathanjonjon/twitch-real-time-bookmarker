async function main() {
    let username = (window.location.href.replace('https://www.twitch.tv/', '')).replace('/', '');
    await chrome.storage.sync.set({ "curr_username": username }, function () {
        console.log("Welcome, " + username + "! Enjoy using Catapult's Live Bookmarking extension for Twitch!");
    });
    let data = {};
    chrome.storage.sync.get({ "data": data }, function (result) {
        data = result.data;
        if (!(username in data)) {
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
                    data[username] = { "start_at": stream_start_utc_ms, "bookmarks": [] };
                    chrome.storage.sync.set({ "data": data }, function () {
                        console.log(`data updated with new stream, {${username}: ${data[username]}}`);
                    });
                })
        }
        else {
            console.log(`${username} is already in the data`)
        }
    });
}


main();

