import browser from "webextension-polyfill";

type Message = {
    action: string,
    value: any,
}

type ResponseCallback = (data: any) => void

async function handleMessage({ action, value }: Message, response: ResponseCallback) {
    if (action === "default-folder") {
        console.log(browser.downloads);
//         response({ message: "success", data: browser.downloads.showDefaultFolder(), error: null });
    } else if (action === "download-model") {
        await browser.downloads.download({ url: value.url, filename: value.destination }).then(async downloadId => {
            console.log("Response:");
            console.log(downloadId);
            const filename = await waitForDownloadToFinish(downloadId);
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
            console.log(`Model download progress: ${progress}% (${item.bytesReceived}/${item.totalBytes})`);
            if(item.state == "complete") {
                done = true;
                filename = item.filename;
                console.log("Model download complete!");
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

browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.executeScript(tab.id,{
        code: 'document.getElementById("nmb-plugin").style.display = "block"',
    });
});
