# Twitch Real-time Bookmarker

This is a Chrome extension to mark customized events for the specific streaming/video in Twitch

## Project Structure

- css/images/js: Static files go here
- `js/content.js` : The place where you can access user and stream info or DOM of the page.
- `js/background.js` : The background script that listens to ctrl+B command and calculate the bookmark.
- `js/popup.js` : The program that interacts with the users and exchange data with bachground script.
- `mainfest.json`: Metadata, icons, permissions and broweser actions are defined here. Check its document [here](https://developer.chrome.com/docs/extensions/mv3/manifest/) for more details.
- `popup.html`: Major UI where the users can view, delete and label all the bookmarks they picked.

## How To Use

1. An user who is in the on-live streaming webpage, such as https://www.twitch.tv/beyondthesummit, with this plug-in enabled and running can record a bookmark with the current played time since the stream started on command "ctrl + B"
2. The label of a bookmark is "untitled" by default, and users are free to edit the content by re-writing the texts and pressing enter to de-focus the text box.
3. If desired, users can also click the "delete" button and remove a row in the table.
4. It's totally fine if a user close the popup window and open it again; the bookmarks will not disappear. It's also supported if a user wants to navigate between different tabs of live stream webpage with the correct link format. Users won't lose bookmarks while navigating back and forth; instead, the popup window displays the what've recoreded correspondingly and instantly.
5. Click "Submit Bookmarks" button, and it will send the bookmarks to your backend, let's say your slack channel, and clear the local states including the table and variables.

## Demo
[![SC2 Video](https://img.youtube.com/vi/V8S7ZT-YSAM/0.jpg)](https://www.youtube.com/embed/V8S7ZT-YSAM)
