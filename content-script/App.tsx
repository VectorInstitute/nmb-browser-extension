import browser from "webextension-polyfill";
import { Readability } from "@mozilla/readability";

import {useState} from "react";

import { InferenceSession, env } from "onnxruntime-web";

const App = () => {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    // V2 vs V3
    let browserRuntime = browser.extension.getURL ? browser.extension : browser.runtime;

    let modelPath = browserRuntime.getURL("models/tinybert_mpds2024a_finetuned.onnx");
    env.wasm.wasmPaths = {
        mjs: browserRuntime.getURL("models/ort-wasm-simd-threaded.mjs"),
        wasm: browserRuntime.getURL("models/ort-wasm-simd-threaded.wasm"),
    };

    async function handleOnClick() {
        setLoading(true);
        setResult("");
        try {
            const reader = new Readability(document.cloneNode(true));
            const articleContent = reader.parse();
            const textContent = articleContent.textContent;

            const session = await InferenceSession.create(modelPath);
            console.log(session);

            setResult(`Page text content has ${textContent.length} characters. ONNX session: ${session}`);
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
          </div>
        </div>
    );
}
export default App;
