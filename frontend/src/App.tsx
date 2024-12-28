import { useState } from "react";
import "./App.css";

const DEBUG = true;

function App() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const endpoint = "http://localhost:3000/api/query";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: inputText }),
    });
    const data = await response.json();
    setResult(data.result);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {DEBUG && <div>{`result: ${result}`}</div>}
      {DEBUG && <div>{`inputText: ${inputText}`}</div>}
      <form onSubmit={handleSubmit}>
        <textarea
          onChange={(e) => setInputText(e.target.value)}
          value={inputText}
          placeholder="Enter your query"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
