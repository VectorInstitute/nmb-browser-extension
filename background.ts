import browser from "webextension-polyfill";

const model_url = "https://huggingface.co/mlotif/test_tinybest_onnx_classification/resolve/main/tinybert_mpds2024a_finetuned.onnx?download=true";

type Message = {
    action: string,
    value: any,
}

type ResponseCallback = (data: any) => void

async function handleMessage({action, value}: Message, response: ResponseCallback) {
    if (action === "download-model") {
        browser.downloads.download({
            url: model_url
        }).then(response => {
            console.log("Response:");
            console.log(response);
        }).catch(error => {
            console.log("Error:");
            console.log(error);
        });
        response({ message: "success", data: "test", error: null });
    } else {
        response({ message: "error", data: null, error: `Unknown action: '${action}'` });
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
