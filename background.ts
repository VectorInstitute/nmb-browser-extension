import browser from "webextension-polyfill";

type Message = {
    action: string,
    value: any,
}

type ResponseCallback = (data: any) => void

async function handleMessage({action, value}: Message, response: ResponseCallback) {
    if (action === "test") {
        response({ message: "success", data: "test", error: null });
    } else {
        response({ message: "error", data: null, error: "Unknown action" });
    }
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
