import browser from "webextension-polyfill";
import { Readability } from "@mozilla/readability";

import {useState} from "react";

import { InferenceSession, Tensor, env } from "onnxruntime-web";
import { BertTokenizer } from '@xenova/transformers';
import winkNLP from "wink-nlp";
import winkModel from "wink-eng-lite-web-model";

const App = () => {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    // Differences in Manifest V2 vs V3:
    let browserRuntime = browser.extension.getURL ? browser.extension : browser.runtime;

    let modelPath = browserRuntime.getURL("models/tinybert/tinybert_mpds2024a_finetuned.onnx");
    let tokenizerPath = browserRuntime.getURL("models/tinybert/quantized_bert-base-cased_default_tokenizer.json");
    let tokenizerConfigPath = browserRuntime.getURL("models/tinybert/quantized_bert-base-cased_default_tokenizer_config.json");
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

            let winkWorker = winkNLP(winkModel);
            const sentences = getSentences(textContent, winkWorker);

            let { session, tokenizer } = await getSessionAndTokenizer(modelPath, tokenizerPath, tokenizerConfigPath);
            const modelInputs = await getInputs(sentences, tokenizer, session.inputNames);

            for (let modelInput of modelInputs) {
                const result = await session.run(modelInput);
                console.log(result);
            }

            // Ensure heavy objects are deallocated
            winkWorker = null;
            session = null;
            tokenizer = null;

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

async function jsonConfigFetcher(url: string): Object {
    const response = await fetch(url);
    const jsonData = await response.json();
    return jsonData;
}

async function getSessionAndTokenizer(modelPath: string, tokenizerPath: string, tokenizerConfigPath: string): { Object, Function } {
    const tokenizerJson = await jsonConfigFetcher(tokenizerPath);
    const tokenizerConfigJson = await jsonConfigFetcher(tokenizerConfigPath);
    const tokenizer = new BertTokenizer(tokenizerJson, tokenizerConfigJson);
    const session = await InferenceSession.create(modelPath);
    return { session, tokenizer };
}

function getSentences(textContent: string, winkWorker: Object): Array<string> {
    const document = winkWorker.readDoc(textContent);
    return document.sentences().out();
}

async function getInputs(sentences: Array<string>, tokenizer: Function, inputNames: Array<string>): Array<Object> {
    const modelInputs = [];

    for (let i = 0; i < sentences.length; i++) {
        const tokenizedInput = await tokenizer(
            sentences[i],
            {
                text_pair: buildSentenceContext(sentences, i),
                max_length: 300,  // we limited the input to 300 tokens during finetuning
                padding: "max_length",
                truncation: true,
            },
        )

        const modelInput = {};
        for (let inputName of inputNames) {
            const input = tokenizedInput[inputName];
            modelInput[inputName] = new Tensor(input.type, input.data, input.dims);
        }

        modelInputs.push(modelInput);
    }

    return modelInputs;
}

function buildSentenceContext(sentences: Array<string>, index: number): string {
    if (index === 0) { // first sentence
        return sentences[index] + " " + sentences[index + 1];
    } else if (index === sentences.length - 1){ // last sentence
        return sentences[index - 1] + " " + sentences[index];
    }
    return sentences[index - 1] + " " + sentences[index] + " " + sentences[index + 1];
}
