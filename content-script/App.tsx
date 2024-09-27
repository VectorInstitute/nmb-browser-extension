import browser from "webextension-polyfill";
import { Readability } from "@mozilla/readability";

import {useState} from "react";
import { InferenceSession } from "onnxruntime-node";

const App = () => {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleOnClick() {
        setLoading(true);
        setResult("");
        try {
            const reader = new Readability(document.cloneNode(true));
            const articleContent = reader.parse();
            const textContent = articleContent.textContent;
            console.log(textContent);

            setResult(`Page text content has ${textContent.length} characters.`);
        } catch (error) {
            console.error(error);
            setResult(error.toString());
        }
        setLoading(false);
    }

    return (
        <div id="nmb-plugin">
          <div id="nmb-card">
            <h1>News Bias Detector</h1>
            <button
              className='px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48'
              disabled={loading} onClick={handleOnClick}>Analyze
            </button>
            <p>{result}</p>

            <ModelLoader/>

          </div>
        </div>
    );
}

export default App;

const ModelLoader = () => {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleOnClick() {
        setLoading(true);
        setResult("");
        try {
            const { data } = await browser.runtime.sendMessage({action: "download-model"});
            setResult(data);
        } catch (error) {
            console.error(error);
            setResult(error.toString());
        }
        setLoading(false);
    }

    return (
        <div>
            <button
              className='px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48'
              disabled={loading} onClick={handleOnClick}>Download Model
            </button>
        </div>
    )
}
