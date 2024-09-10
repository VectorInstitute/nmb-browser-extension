import browser from "webextension-polyfill";
import React from 'react'
import ReactDOM from 'react-dom/client'

const Popup = () => {
    async function showPlugin() {
        const {message} = await browser.runtime.sendMessage({action: "show"});
        console.log(`Response message: ${message}`);
        window.close();
    }

    return (
        <button onClick={showPlugin}>Show Plugin</button>
    );
}

const index = document.createElement('div');
const body = document.querySelector('body');
if (body) {
  body.append(index);
}

ReactDOM.createRoot(index).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
