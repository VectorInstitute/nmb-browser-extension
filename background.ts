import browser from "webextension-polyfill";

type Message = {
    action: string,
    value: any,
}

type ResponseCallback = (data: any) => void

async function handleMessage({ action, value }: Message, response: ResponseCallback) {
    if (action === "download-model") {
        let placeholderFilename;
        await browser.downloads.download({ url: value.placeholderUrl, filename: `nmb-extension/placeholder`, conflictAction: "overwrite" }).then(async downloadId => {
            placeholderFilename = await waitForDownloadToFinish(downloadId);
        }).catch(error => {
            console.error(error);
            response({ message: "error", data: null, error });
        });
        const modelFilename = placeholderFilename.replace("placeholder", value.modelName);

        var xhr = new XMLHttpRequest();
        let blobData;
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                blobData = this.response;
                console.log("blob data:")
                console.log(blobData)
            }
        }
        xhr.open("GET", "file://" + modelFilename);
        xhr.responseType = "blob";
        xhr.send();

        browser.downloads.search({ limit: 100 }).then(items => {
            console.log("2");
            console.log(items);
        });

        await browser.downloads.download({
            url: value.modelUrl,
            filename: `nmb-extension/${value.modelName}`,
        }).then(async downloadId => {
            const filename = await waitForDownloadToFinish(downloadId);

            var xhr = new XMLHttpRequest();
            let blobData;
            xhr.onreadystatechange = function () {
                if (this.readyState == 4) {
                    blobData = this.response;
                    console.log("blob data:")
                    console.log(blobData)
                }
            }
            xhr.open("GET", "file://" + filename);
            xhr.responseType = "blob";
            xhr.send();

            response({ message: "success", data: filename, error: null });
        }).catch(error => {
            console.error(error);
            response({ message: "error", data: null, error });
        });
    } else {
        response({ message: "error", data: null, error: `Unknown action: '${action}'` });
    }
}

async function waitForDownloadToFinish(downloadId: number): string {
    let done = false;
    let filename;
    while (!done) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        browser.downloads.search({ id: downloadId }).then(items => {
            const item = items.reduce((chosenItem, i) => { chosenItem = i.id === id ? i : chosenItem });
            const progress = parseInt((item.bytesReceived / item.totalBytes) * 100)
            console.log(`Download progress: ${progress}% (${item.bytesReceived}/${item.totalBytes})`);
            if(item.state == "complete") {
                done = true;
                filename = item.filename;
                console.log("Download complete!");
            }
            if (item.error) {
                done == true;
                throw new Error(item.error);
            }
            if (item.danger && item.danger !== "safe") {
                done == true;
                throw new Error("Item marked as not safe!");
            }
        });
    }
    return filename;
}

// @ts-ignore
browser.runtime.onMessage.addListener((msg, sender, response) => {
    handleMessage(msg, response);
    return true;
});

// V2 (Firefox)
if (browser.browserAction) {
    browser.browserAction.onClicked.addListener(function(tab) {
        browser.tabs.executeScript(tab.id,{
            code: 'document.getElementById("nmb-plugin").style.display = "block"',
        });
    });
// V3 (Chrome)
} else {
    browser.action.onClicked.addListener(function(tab) {
        browser.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: () => { document.getElementById("nmb-plugin").style.display = "block"; },
        });
    });
}
