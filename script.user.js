// ==UserScript==
// @name         KIT-ILIAS Downloader
// @version      1.0.0
// @description  Adds a download button to videos that don't have one.
// @author       Salvage
// @namespace    https://github.com/Saalvage/kit-ilias-downloader
// @updateURL    https://raw.githubusercontent.com/Saalvage/kit-ilias-downloader/main/script.user.js
// @downloadURL  https://raw.githubusercontent.com/Saalvage/kit-ilias-downloader/main/script.user.js
// @supportURL   https://github.com/Saalvage/kit-ilias-downloader/issues/
// @license      MIT
// @include      /^https:\/\/ilias\.studium\.kit\.edu\/ilias\.php\?ref_id=\d+&cmdClass=xocteventgui.*
// @icon         https://www.kit.edu/favicon.ico
// @grant        none
// @run-at       document-idle
// ==/UserScript==

'use strict';

window.__ilias_download = function(playLink) {
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

new MutationObserver((mutList, observer) => {
    // Fully loaded. This is atrocious, but I didn't find a better way!
    if (document.getElementById("xoct_waiter").attributes.style.value === "display: none;") {
        const rows = document.getElementsByClassName("table table-striped fullwidth")[0].tBodies[0].rows;
        // Check if download button is already there
        if (rows.length > 0) {
            const buttons = rows[0].cells[1].children[0].children;
            if (buttons.length === 2 && buttons[1].text === "Download") { return; }
        }
        for (const r of rows) {
            const buttons = r.cells[1].children[0];
            buttons.insertAdjacentHTML("beforeEnd", `<p class="btn btn-info" onclick=__ilias_download("${buttons.children[0].href}");>Download</p>`);
        }
        observer.disconnect();
    }
}).observe(document.getElementById("xoct_waiter"), { attributes: true });
