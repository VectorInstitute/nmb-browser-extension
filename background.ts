import browser from "webextension-polyfill";

type Message = {
  action: 'fetch',
  value: null
}

type ResponseCallback = (data: any) => void

async function handleMessage({action, value}: Message, response: ResponseCallback) {
    console.log(`message received. Action: ${action}, Value: ${value}`);
    if (action === "show") {
        console.log(document.getElementById("nmb-plugin"));
        response({ message: "visible" });
    }
    if (action === 'fetch') {
        const result = await fetch('https://meowfacts.herokuapp.com/');

        const { data } = await result.json();

        response({ message: 'success', data });
    } else {
        response({data: null, error: 'Unknown action'});
    }
}

// @ts-ignore
browser.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, response);
  return true;
});
