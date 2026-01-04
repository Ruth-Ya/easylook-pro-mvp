// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import logo from "./easylook-logo.png"; // logo placé dans src/

const STORAGE_KEY_CREDITS = "elp_credits_v1";
const FREE_CREDITS_START = 3;

const SEGMENTS = [
  { id: "mode", label: "Mode & Artisanat", desc: "Bazin, wax, accessoires, bijoux…" },
  { id: "agro", label: "Agro & Produits locaux", desc: "Bissap, miel, huiles, épices…" },
  { id: "ecommerce", label: "E-commerce & Catalogues", desc: "Produits variés, marketplace, ventes…" },
];

// (Pour l’instant: labels UI. Le fond IA viendra après remove.bg)
const BACKGROUNDS = [
  { id: "studio-white", label: "Fond studio blanc" },
  { id: "neutral-grey", label: "Fond neutre gris" },
  { id: "textile-soft", label: "Fond textile soft" },
  { id: "terracotta", label: "Fond terracotta" },
  { id: "deep-green", label: "Fond vert profond" },
];

const FORMATS = [
  { id: "square", label: "Carré 1080×1080 (Recommandé)" },
  { id: "portrait", label: "Portrait 1080×1350" },
  { id: "landscape", label: "Paysage 1200×628" },
  { id: "whatsapp", label: "WhatsApp optimisé (léger)" },
];

function readCreditsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CREDITS);
    if (raw === null || raw === undefined || raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  } catch {
    return null;
  }
}

function writeCreditsToStorage(n) {
  try {
    localStorage.setItem(STORAGE_KEY_CREDITS, String(Math.max(0, Math.floor(n))));
  } catch {
    // ignore
  }
}

function App() {
  const [step, setStep] = useState("home"); // home | processing | result | export | paywall | confirmation
  const [segment, setSegment] = useState("mode");
  const [credits, setCredits] = useState(FREE_CREDITS_START);

  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);

  const [selectedBackground, setSelectedBackground] = useState("studio-white");
  const [selectedFormat, setSelectedFormat] = useState("square");

  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  // Init credits
  useEffect(() => {
    const stored = readCreditsFromStorage();
    if (stored === null) {
      writeCreditsToStorage(FREE_CREDITS_START);
      setCredits(FREE_CREDITS_START);
    } else {
      setCredits(stored);
    }
  }, []);

  const segmentLabel = useMemo(() => {
    return SEGMENTS.find((s) => s.id === segment)?.label ?? "Mode & Artisanat";
  }, [segment]);

  // --- IA réelle (remove.bg) ---
  const processWithIA = async (file) => {
    setErrorMsg("");
    setStep("processing");

    // Preview original
    const previewUrl = URL.createObjectURL(file);
    setOriginalImage(previewUrl);

    // Call our backend API (Vercel serverless)
    try {
      const fd = new FormData();
      fd.append("image", file); // IMPORTANT: champ attendu par l’API
      fd.append("segment", segment);
      fd.append("background", selectedBackground);
      fd.append("format", selectedFormat);

      const resp = await fetch("/api/process-image", {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(txt || `HTTP ${resp.status}`);
      }

      const blob = await resp.blob();
      const outUrl = URL.createObjectURL(blob);

      setProcessedImage(outUrl);
      setStep("result");
    } catch (e) {
      console.error(e);
      setProcessedImage(null);
      setStep("home");
      setErrorMsg(
        "Oups… le traitement IA a échoué. Vérifie la clé remove.bg dans Vercel et les logs.\n" +
          "Astuce : Vercel → Deployments → Logs → cherche “remove.bg”."
      );
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      alert("Oups, merci d’utiliser une image JPG ou PNG.");
      return;
    }

    processWithIA(file);
  };

  const handleDownloadClick = () => {
    if (credits > 0) {
      setStep("export");
      return;
    }
    setStep("paywall");
  };

  const consumeOneCredit = () => {
    const next = Math.max(0, (credits ?? 0) - 1);
    setCredits(next);
    writeCreditsToStorage(next);
  };

  const actuallyDownloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `easylook-pro-${selectedFormat}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    consumeOneCredit();
    setStep("confirmation");
  };

  const handleBackgroundChange = (bgId) => {
    setSelectedBackground(bgId);
    // (Étape suivante : régénérer fond via inpainting)
  };

  const handleFormatChange = (formatId) => {
    setSelectedFormat(formatId);
    // (Étape suivante : redimensionnement réel)
  };

  const handleOpenMobileMoney = () => {
    const phone = "221707546281";
    const message = encodeURIComponent(
      `Bonjour ! Je souhaite activer EasyLook Pro (2 500 XOF / mois).\n` +
        `Segment : ${segmentLabel}\n` +
        `Crédits restants : ${credits}\n` +
        `Merci de m’indiquer la procédure Mobile Money.\n` +
        `Mon numéro est : `
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const resetForNewPhoto = () => {
    setErrorMsg("");
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedBackground("studio-white");
    setSelectedFormat("square");
    setStep("home");
  };

  const renderHeader = () => (
    <header className="elp-header">
      <div className="elp-hero-banner">
        <img src={logo} alt="EasyLook Pro – Tes photos, version studio" className="elp-hero-image" />
      </div>
    </header>
  );

  const renderCreditsPill = () => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 12, color: "#555" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 999,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
        }}
      >
        <span style={{ fontWeight: 700 }}>{credits}</span>
        <span>crédit{credits === 1 ? "" : "s"} gratuit{credits === 1 ? "" : "s"}</span>
      </span>
    </div>
  );

  const renderSegmentPicker = () => (
    <div className="elp-card" style={{ textAlign: "left" }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Choisis ton segment</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SEGMENTS.map((s) => (
          <label
            key={s.id}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              padding: "10px 10px",
              borderRadius: 12,
              border: segment === s.id ? "1px solid rgba(199,139,58,0.55)" : "1px solid rgba(0,0,0,0.08)",
              background: segment === s.id ? "rgba(199,139,58,0.08)" : "#fff",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="segment"
              value={s.id}
              checked={segment === s.id}
              onChange={() => setSegment(s.id)}
              style={{ marginTop: 3 }}
            />
            <div>
              <div style={{ fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderErrorBox = () => {
    if (!errorMsg) return null;
    return (
      <div
        style={{
          border: "1px solid rgba(227,108,74,0.35)",
          background: "rgba(227,108,74,0.08)",
          padding: 14,
          borderRadius: 14,
          color: "#7a2e1e",
          whiteSpace: "pre-line",
          textAlign: "left",
        }}
      >
        {errorMsg}
      </div>
    );
  };

  const renderHome = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content">
        {renderCreditsPill()}

        <h1 className="elp-title">Tes photos, version studio.</h1>
        <p className="elp-subtitle">
          Transforme tes photos produits en visuels qualité studio, en moins de 60 secondes. Idéal pour WhatsApp, Instagram,
          e-commerce et tous tes réseaux.
        </p>

        {renderSegmentPicker()}
        {renderErrorBox()}

        <div className="elp-card elp-card-centered">
          <button className="elp-button" onClick={handleUploadClick}>
            Améliorer ma photo
          </button>
          <p className="elp-helper">
            {credits > 0
              ? `${credits} crédit${credits === 1 ? "" : "s"} gratuit${credits === 1 ? "" : "s"} restant${credits === 1 ? "" : "s"}.`
              : "Crédits épuisés : passe en illimité."}
          </p>
        </div>

        <p className="elp-footer-note">Fonctionne sur tous les téléphones.</p>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );

  const renderProcessing = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content elp-centered">
        <div className="elp-loader" />
        <h2 className="elp-title-small">On prépare ta version studio…</h2>
        <p className="elp-subtitle">Ça prend moins de 60 secondes. Tu peux poser ton téléphone 😉</p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content">
        {renderCreditsPill()}

        <h2 className="elp-title-small">Ta photo, en version pro.</h2>

        <div className="elp-compare">
          {originalImage && (
            <div className="elp-image-block">
              <span className="elp-tag">Avant</span>
              <img src={originalImage} alt="Avant" className="elp-image" />
            </div>
          )}
          {processedImage && (
            <div className="elp-image-block">
              <span className="elp-tag elp-tag-green">Après</span>
              <img src={processedImage} alt="Après" className="elp-image" />
            </div>
          )}
        </div>

        <p className="elp-subtitle">
          Segment : <strong>{segmentLabel}</strong> — Choisis le fond qui met le mieux ton produit en valeur.
        </p>

        <div className="elp-background-list">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              className={`elp-chip ${selectedBackground === bg.id ? "elp-chip-active" : ""}`}
              onClick={() => handleBackgroundChange(bg.id)}
            >
              {bg.label}
            </button>
          ))}
        </div>

        <div className="elp-card elp-card-actions">
          <button className="elp-button" onClick={handleDownloadClick}>
            {credits > 0 ? "Télécharger (1 crédit)" : "Activer EasyLook Pro"}
          </button>

          <p className="elp-helper">{credits > 0 ? "Le téléchargement consomme 1 crédit." : "Crédits épuisés : passe en illimité."}</p>

          <button className="elp-link-button" onClick={resetForNewPhoto}>
            Reprendre une nouvelle photo
          </button>
        </div>
      </div>
    </div>
  );

  const renderExport = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content">
        {renderCreditsPill()}

        <h2 className="elp-title-small">Choisis ton format d’export</h2>
        <div className="elp-card">
          {FORMATS.map((f) => (
            <label key={f.id} className="elp-radio-row">
              <input
                type="radio"
                name="export-format"
                value={f.id}
                checked={selectedFormat === f.id}
                onChange={() => handleFormatChange(f.id)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>

        <button
          className="elp-button"
          onClick={() => {
            if (credits <= 0) {
              setStep("paywall");
              return;
            }
            actuallyDownloadImage();
          }}
        >
          Télécharger (1 crédit)
        </button>

        <button className="elp-link-button" onClick={() => setStep("result")}>
          Retour
        </button>
      </div>
    </div>
  );

  const renderPaywall = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content">
        <h2 className="elp-title-small">Passe en mode studio illimité.</h2>
        <p className="elp-subtitle">
          Tu as utilisé tes <strong>{FREE_CREDITS_START} crédits gratuits</strong>. Active EasyLook Pro pour continuer, pour seulement{" "}
          <strong>2 500 XOF / mois</strong>.
        </p>

        <div className="elp-card">
          <ul className="elp-list">
            <li>Détourage automatique (remove.bg)</li>
            <li>10 fonds studio optimisés mode & artisanat</li>
            <li>Export multi-formats</li>
            <li>Résultats en moins de 60 secondes</li>
            <li>Payer sans frais via Mobile Money (WhatsApp)</li>
          </ul>
        </div>

        <button className="elp-button" onClick={handleOpenMobileMoney}>
          Payer par Mobile Money (WhatsApp)
        </button>

        <p className="elp-helper">Paiement via WhatsApp (MVP). Évolution paiement API plus tard.</p>

        <button className="elp-link-button" onClick={() => setStep("result")}>
          Retour à ma photo
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content elp-centered">
        <h2 className="elp-title-small">C’est bon 🎉</h2>
        <p className="elp-subtitle">
          Ton téléchargement est prêt. Il te reste <strong>{credits}</strong> crédit{credits === 1 ? "" : "s"} gratuit
          {credits === 1 ? "" : "s"}.
        </p>
        <button className="elp-button" onClick={resetForNewPhoto}>
          Créer une nouvelle photo
        </button>
      </div>
    </div>
  );

  let content;
  switch (step) {
    case "home":
      content = renderHome();
      break;
    case "processing":
      content = renderProcessing();
      break;
    case "result":
      content = renderResult();
      break;
    case "export":
      content = renderExport();
      break;
    case "paywall":
      content = renderPaywall();
      break;
    case "confirmation":
      content = renderConfirmation();
      break;
    default:
      content = renderHome();
  }

  return <div className="elp-app">{content}</div>;
}

export default App;
