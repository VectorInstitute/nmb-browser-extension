import browser from "webextension-polyfill";
import { Readability } from "@mozilla/readability";

import {useState} from "react";

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
        <div className="fixed top-20 left-20" id="nmb-plugin">
          <div className='flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 w-96 rounded-md'>
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
