let data = {};

window.onload = function () {
    chrome.storage.sync.get(['data'], function (result) {
        data = result.data;
        const table = document.createElement("bookmarks");
        if (!table) {
            console.log("bookmarks table not exist");
        }
        for (var i = 0; i < data[curr_username]["bookmarks"].length; i++) {
            console.log(data[curr_username]["bookmarks"][i])
            append_table(data[curr_username]["bookmarks"][i]);
        }
    });
}

let curr_username = "";
chrome.storage.sync.get(['curr_username'], function (result) {
    curr_username = result.curr_username;
    console.log('current username is ' + curr_username);
    let username_div = document.getElementById("username");
    username_div.innerText = `Recording bookmarks for ${curr_username}`;
});

function update_bookmarks() {
    chrome.storage.sync.set({ "data": data }, function () {
        chrome.runtime.sendMessage({ type: "sync_bookmarks" }, function (response) {
            console.log(response);
        });
    });
}
/* Update the table with editable title, bookmark and a button to remove row */
function append_table(bookmark) {
    const table_body = document.getElementById("bookmarks_table").getElementsByTagName('tbody')[0];
    let newRow = table_body.insertRow(-1);

    let newTitleCell = newRow.insertCell(0);
    newTitleCell.setAttribute("class", "pt-3-half");
    newTitleCell.setAttribute("contenteditable", "false");
    let title_editor = document.createElement('input');
    title_editor.setAttribute("class", "input-form-wrapper");
    title_editor.addEventListener("keydown", event => {
        if (event.key == 'Enter') {
            console.log(title_editor.value);
            for (var i = 0; i < data[curr_username]["bookmarks"].length; i++) {
                if (data[curr_username]["bookmarks"][i].time == bookmark.time && data[curr_username]["bookmarks"][i].label == bookmark.label) {
                    data[curr_username]["bookmarks"][i].label = title_editor.value;
                    bookmark.label = title_editor.value;
                    update_bookmarks();
                }
            }
            title_editor.blur();
        }
    });

    title_editor.defaultValue = bookmark.label;
    newTitleCell.appendChild(title_editor);

    let newTimeCell = newRow.insertCell(1);
    newTimeCell.setAttribute("class", "pt-3-half");
    newTimeCell.setAttribute("contenteditable", "false");

    newTimeCell.innerText = bookmark.time;

    let newButtonCell = newRow.insertCell(2);
    let newButton_div = document.createElement('div');
    newButton_div.setAttribute("class", "inline-button-wrapper");
    let newButton_btn = document.createElement("button");
    newButton_btn.innerText = "Delete"
    newButton_btn.addEventListener("click", function () {
        // onclick, it will delete row in this table and update the bookmarks array in popup.js and background.js
        document.getElementById("bookmarks_table").deleteRow(newRow.rowIndex);
        const index = data[curr_username]["bookmarks"].indexOf(bookmark);
        if (index > -1) data[curr_username]["bookmarks"].splice(index, 1);
        console.log('delete a bookmark')
        update_bookmarks()
    });
    newButton_div.appendChild(newButton_btn)
    newButtonCell.appendChild(newButton_div);

}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "add_bookmark") {
        append_table(request.bookmark);
        console.log("bookmark added:", request.bookmark);
        sendResponse({ output: "ok" });
        chrome.storage.sync.get(['data'], function (result) {
            data = result.data;
        });
    }
})

function slack(message) {
    const payload = { "channel": "#notification", "username": "twitch-real-time-bookmarker", "text": message, "icon_emoji": ":yoshi_mario_kart:" }
    const url = "https://hooks.slack.com/services/<YOUR-SLACK-BOT-TOKEN>";
    return fetch(url, {
        body: JSON.stringify(payload),
        cache: 'no-cache',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
    })
        .then(function (response) {
            if (response.ok) {
                console.log("Successfully POST bookmarks to slack!");
            }
            else {
                console.log(response.statusText);
            }
        });
}


const submitButton = document.getElementById("send_bookmarks");

/* POST the list of bookmarks when the user wanna submit */
submitButton.addEventListener("click", async function () {

    const table_body = document.getElementById("bookmarks_table").getElementsByTagName('tbody')[0];

    const payload = data[curr_username]["bookmarks"].map(function remove_untitled(bookmark) {
        if (bookmark.label == "untitled") {
            return { "time": bookmark.time };
        }
        return bookmark;
    });


    // POST all bookmarks to meanwhile
    const message = JSON.stringify({ "username": curr_username, "bookmarks": payload });
    console.log("message body:", message)

    update_bookmarks();
    slack(message)

    // reset the table body
    while (table_body.firstChild) {
        table_body.removeChild(table_body.firstChild);
    }

    alert("Bookmarks sent!!")

}, false);

