import browser from "webextension-polyfill";
import { Readability } from "@mozilla/readability";

import { useState, useEffect } from "react";
import { InferenceSession } from "onnxruntime-node";

const App = () => {
    const [modelFileName, setModelFileName] = useState(null);

    return (
        <div id="nmb-plugin">
          <div id="nmb-card">
            <h1>News Bias Detector</h1>

            <TextAnalyzer modelFileName={modelFileName} />

            <ModelDownloader modelFileName={modelFileName} setModelFileName={setModelFileName}/>

          </div>
        </div>
    );
}

export default App;

const TextAnalyzer = ({ modelFileName }) => {
    if (!modelFileName) {
        return null;
    }

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

    const buttonClasses = "px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm disabled:opacity-75 w-48";

    return (
        <div>
            <button className={buttonClasses} disabled={loading} onClick={handleOnClick}>
                Analyze
            </button>
            <p>{result}</p>
        </div>
    );
}

const ModelDownloader = ({ modelFileName, setModelFileName }) => {
    const [loading, setLoading] = useState(false);
    const [defaultFolder, setDefaultFolder] = useState(null);

    const baseUrl = "https://huggingface.co/mlotif/test_tinybest_onnx_classification/resolve/main";
    const placeholderUrl = `${baseUrl}/placeholder?download=true`;
    const modelName = "tinybert_mpds2024a_finetuned.onnx";
    const modelUrl = `${baseUrl}/${modelName}?download=true`;

    const spinnerContainerClasses = "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white";
    const spinnerElementClasses = "!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]";

    async function handleOnClick() {
        setLoading(true);
        try {
            const { data } = await browser.runtime.sendMessage({
                action: "download-model",
                value: {
                    modelUrl,
                    modelName,
                    placeholderUrl,
                },
            });
            setModelFileName(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    if (modelFileName) {
        return null;
    }

    if (loading) {
        return (
            <div id="spinner">
                <div className={spinnerContainerClasses} role="status">
                    <span className={spinnerElementClasses} />
                </div>
                <div id="spinner-label">Downloading model...</div>
            </div>
        );
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
