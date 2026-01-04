import { useState } from "react";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function callProcessApi(payload) {
    const resp = await fetch("/api/process-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await resp.json();
    } catch {
      data = {};
    }

    if (!resp.ok || !data.ok) {
      throw new Error(data?.error || "API error");
    }

    return data;
  }

  async function handleFakeTest() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // test volontairement simple (sans image réelle)
      const data = await callProcessApi({
        imageBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
        backgroundId: "studio-white",
        formatId: "square",
      });

      setResult(data.imageDataUrl);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>EasyLook Pro – Test technique</h1>

      <button onClick={handleFakeTest} disabled={loading}>
        {loading ? "Traitement..." : "Tester l’API"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <h3>Résultat :</h3>
          <img src={result} alt="result" style={{ maxWidth: 300 }} />
        </div>
      )}
    </div>
  );
}
