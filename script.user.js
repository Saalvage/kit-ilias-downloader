// ==UserScript==
// @name         KIT-ILIAS Downloader
// @version      1.1.2
// @description  Adds a download button to videos that don't have one.
// @author       Salvage
// @namespace    https://github.com/Saalvage/kit-ilias-downloader
// @updateURL    https://raw.githubusercontent.com/Saalvage/kit-ilias-downloader/main/script.user.js
// @downloadURL  https://raw.githubusercontent.com/Saalvage/kit-ilias-downloader/main/script.user.js
// @supportURL   https://github.com/Saalvage/kit-ilias-downloader/issues/
// @license      MIT
// @include      /^https:\/\/ilias\.studium\.kit\.edu\/ilias\.php.*cmdClass=xocteventgui.*/
// @icon         https://www.kit.edu/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

'use strict';

function __iliasDownload(playLink) {
    fetch(playLink)
        .then(response => response.text())
        .then(cnt => {
            const pos = cnt.indexOf("https:\\/\\/oc-delivery.bibliothek.kit.edu\\/staticfiles\\/mh_default_org\\/api\\/");
            const endPos = cnt.indexOf(`","mimetype":"video\\/mp4"`, pos);
            // Actually download
            window.location = cnt.substr(pos, endPos - pos);
        })
        .catch(err => {
            console.log(err);
            alert("Download failed! See console for details!");
        });
}

let script = document.createElement("script");
script.textContent = __iliasDownload.toString();
document.head.appendChild(script);

function addDownloads(rows, styleClass, getButtons) {
    // Check if download button is already there
    if (rows.length > 0) {
        const buttons = getButtons(rows[0]);
        if (buttons.length === 2 && buttons[1].text === "Download") { return; }
    }
    for (const entry of rows) {
        const buttons = getButtons(entry);
        buttons.insertAdjacentHTML("beforeEnd", `<a class="${styleClass}" onclick=${__iliasDownload.name}("${buttons.children[0].href}");>Download</a>`);
    }
}

function observeLoader(waiter) {
    new MutationObserver((mutList, observer) => {
        // Fully loaded. This is atrocious, but I didn't find a better way!
        if (waiter.attributes.style.value === "display: none;") {
            const tables = document.getElementsByClassName("table table-striped fullwidth");
            if (tables.length === 0) {
                // Probably uses the tiled layout
                addDownloads(document.getElementById("xoct_tile_container").children, "btn btn-default", entry => entry.getElementsByClassName("xoct_event_buttons")[0]);
            } else {
                addDownloads(tables[0].tBodies[0].rows, "btn btn-info", entry => entry.getElementsByClassName("btn-group-vertical")[0]);
            }
            observer.disconnect();
        }
    }).observe(waiter, { attributes: true });
}

function tryGetWaiter() {
    return document.getElementById("xoct_waiter");
}

const waiter = tryGetWaiter();
if (waiter === null) {
    new MutationObserver((mutList, observer) => {
        const waiter = tryGetWaiter();
        if (waiter !== null) {
            observeLoader(waiter);
            observer.disconnect();
        }
    }).observe(document.body, { childList: true });
} else {
    observeLoader(waiter);
}
