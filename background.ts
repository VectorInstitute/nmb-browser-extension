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

browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.executeScript(tab.id,{
        code: 'document.getElementById("nmb-plugin").style.display = "block"',
    });
});
