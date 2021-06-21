let bookmarks = [];


async function main(username) {
    await chrome.storage.sync.set({ "username": username }, function () {
        console.log("Welcome, " + username + "! Enjoy using Real-time Bookmarker extension for Twitch!");
    });
    chrome.storage.sync.set({ "bookmarks": bookmarks }, function () {
        console.log('bookmarks initialized');
    });

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

            chrome.storage.sync.set({ "start_at": stream_start_utc_ms }, function () {
                console.log("start time:", stream_start_utc_ms);
            });
        })
}

window.onload = function () {
    const username = (window.location.href.replace('https://www.twitch.tv/', '')).replace('/', '');
    main(username);
}

