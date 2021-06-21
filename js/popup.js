function update_bookmarks() {
    chrome.storage.sync.set({ "bookmarks": bookmarks }, function () {
        chrome.runtime.sendMessage({ type: "sync_bookmarks", bookmarks: bookmarks }, function (response) {
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
    newTitleCell.setAttribute("contenteditable", "true");
    let title_editor = document.createElement('input');
    title_editor.addEventListener("keydown", event => {
        if (event.key == 'Enter') {
            console.log(title_editor.value);
            for (var i = 0; i < bookmarks.length; i++) {
                if (bookmarks[i].time == bookmark.time && bookmarks[i].label == bookmark.label) {
                    bookmarks[i].label = title_editor.value;
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
    newButton_btn.addEventListener("click", function() {
        // onclick, it will delete row in this table and update the bookmarks array in popup.js and background.js
        document.getElementById("bookmarks_table").deleteRow(newRow.rowIndex);
        const index = bookmarks.indexOf(bookmark);
        if (index > -1) bookmarks.splice(index, 1);
        console.log('delete a bookmark')
        update_bookmarks()
    });
    newButton_div.appendChild(newButton_btn)
    newButtonCell.appendChild(newButton_div);

}


let username = "";
chrome.storage.sync.get(['username'], function (result) {
    username = result.username;
    console.log('username currently is ' + username);
    let username_div = document.getElementById("username");
    username_div.innerText = `Recording bookmarks for ${username}`;
});


let bookmarks = [];
window.onload = function () {
    chrome.storage.sync.get(['bookmarks'], function (result) {
        bookmarks = result.bookmarks;
        const table = document.createElement("bookmarks");
        if (!table) {
            console.log("bookmarks table not exist");
        }
        for (var i = 0; i < bookmarks.length; i++) {
            console.log(bookmarks[i])
            append_table(bookmarks[i]);
        }
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "add_bookmark") {
        append_table(request.bookmark);
        console.log("bookmark added:", request.bookmark);
        sendResponse({ output: "ok" });
        chrome.storage.sync.get(['bookmarks'], function (result) {
            bookmarks = result.bookmarks;
        });
    }
})

function slack(message) {
    const url = "https://hooks.slack.com/services/<YOUR-SLACK-BOT-TOKEN>";
    return fetch(url, {
        body: message,
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
submitButton.addEventListener("click", async function() {
    const table_body = document.getElementById("bookmarks_table").getElementsByTagName('tbody')[0];
    
    bookmarks = [];
    update_bookmarks();

    let payload = [];
    const all_rows = table_body.rows;
    for (var i = 0; i < all_rows.length; i++) {
        const row = all_rows[i];
        const title = row.cells[0].innerText
        const time = row.cells[1].innerText
        console.log(title, time);
        if (title == "untitled") {
            payload.push({ "time": time });
        }
        else {
            payload.push({ "time": time, "label": title });
        }
        
    }

    // POST all bookmarks to wherever you want
    const message = JSON.stringify({ "username": username, "bookmarks": payload });
    console.log("message body:", message)
    
    slack(message)

    // reset the table body
    while (table_body.firstChild) {
        table_body.removeChild(table_body.firstChild);
    }

    alert("Bookmarks sent!!")
    
}, false);

