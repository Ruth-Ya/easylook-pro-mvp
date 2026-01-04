// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import logo from "./easylook-logo.png";

const STORAGE_KEY_CREDITS = "elp_credits_v1";
const FREE_CREDITS_START = 3;

const SEGMENTS = [
  { id: "mode", label: "Mode & Artisanat", desc: "Bazin, wax, accessoires, bijoux…" },
  { id: "agro", label: "Agro & Produits locaux", desc: "Bissap, miel, huiles, épices…" },
  { id: "ecommerce", label: "E-commerce & Catalogues", desc: "Produits variés, marketplace, ventes…" },
];

// ✅ 10 fonds — IDs alignés avec BG_MAP du backend
const BACKGROUNDS = [
  { id: "studio-white", label: "Studio blanc" },
  { id: "neutral-grey", label: "Neutre gris" },
  { id: "warm-ivory", label: "Ivoire chaud" },
  { id: "sand-beige", label: "Sable beige" },
  { id: "textile-soft", label: "Textile soft" },
  { id: "olive-soft", label: "Olive soft" },
  { id: "terracotta", label: "Terracotta" },
  { id: "clay-light", label: "Argile claire" },
  { id: "deep-green", label: "Vert profond" },
  { id: "charcoal", label: "Charbon" },
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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function callProcessApi({ imageBase64, backgroundId, formatId }) {
  console.log("[callProcessApi] START", {
    hasImageBase64: !!imageBase64,
    backgroundId,
    formatId,
  });

  const resp = await fetch("/api/process-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, backgroundId, formatId }),
  });

  console.log("[callProcessApi] RESPONSE", resp.status);

  const data = await resp.json().catch(() => null);
  console.log("[callProcessApi] JSON", data);

  if (!resp.ok) {
    throw new Error(data?.detail || data?.error || `API error ${resp.status}`);
  }

  return data;
}

  console.log("➡️ callProcessApi déclenchée", {
    hasImage: !!imageBase64,
    backgroundId,
    formatId,
  });

  const resp = await fetch("/api/process-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64,
      backgroundId,
      formatId,
    }),
  });

  console.log("⬅️ Réponse API reçue, status =", resp.status);

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err);
  }

  return resp.json();
}

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.ok) {
    const detail = data?.detail || data?.error || `HTTP ${resp.status}`;
    throw new Error(detail);
  }
  return data; // { ok, imageDataUrl, width, height, ... }
}

function App() {
  const [step, setStep] = useState("home"); // home | processing | result | export | paywall | confirmation
  const [segment, setSegment] = useState("mode");
  const [credits, setCredits] = useState(FREE_CREDITS_START);

  const [originalImage, setOriginalImage] = useState(null); // dataUrl (source)
  const [processedImage, setProcessedImage] = useState(null); // dataUrl (final)

  const [selectedBackground, setSelectedBackground] = useState("studio-white");
  const [selectedFormat, setSelectedFormat] = useState("square");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pour éviter les courses (si on change de fond vite)
  const requestSeq = useRef(0);

  const fileInputRef = useRef(null);

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

  const consumeOneCredit = () => {
    const next = Math.max(0, (credits ?? 0) - 1);
    setCredits(next);
    writeCreditsToStorage(next);
  };

  const startProcessingFromOriginal = async (opts = {}) => {
    const { backgroundId = selectedBackground, formatId = selectedFormat } = opts;

    if (!originalImage) return;

    setErrorMsg("");
    setIsProcessing(true);
    setStep("processing");

    const mySeq = ++requestSeq.current;

    try {
      const data = await callProcessApi({
        imageBase64: originalImage,
        backgroundId,
        formatId,
      });

      // Si une nouvelle requête est partie après, on ignore celle-ci
      if (mySeq !== requestSeq.current) return;

      setProcessedImage(data.imageDataUrl);
      setStep("result");
    } catch (e) {
      if (mySeq !== requestSeq.current) return;

      setProcessedImage(null);
      setStep("home");
      setErrorMsg(
        "Oups… le traitement IA a échoué. Vérifie la clé remove.bg dans Vercel et les logs.\n\n" +
          "Astuce : Vercel → Deployments → Logs → cherche “remove.bg” ou “process-image error”."
      );
    } finally {
      if (mySeq === requestSeq.current) setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      alert("Oups, merci d’utiliser une image JPG ou PNG.");
      return;
    }

    // On garde un aperçu "Avant" via URL.createObjectURL pour performance
    const previewUrl = URL.createObjectURL(file);

    setErrorMsg("");
    setOriginalImage(null);
    setProcessedImage(null);

    // ⚠️ On met l'Avant en preview (URL) tout de suite
    // mais pour l'API, on a besoin d'un dataURL base64.
    // Donc on stocke le base64 dans originalImage et on garde aussi le preview pour l'affichage.
    setStep("processing");
    setIsProcessing(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      setOriginalImage(dataUrl); // base64 pour l’API

      // pour l’affichage Avant, on utilise previewUrl (plus léger)
      // mais on remplace via une variable dédiée:
      // ici on garde processedImage null, et on stocke previewUrl séparément.
      // => On utilise originalPreview ci-dessous.
      setOriginalPreview(previewUrl);

      // Lance le traitement IA
      await startProcessingFromOriginal({ backgroundId: selectedBackground, formatId: selectedFormat });
    } catch (err) {
      setStep("home");
      setErrorMsg("Impossible de lire l’image. Réessaie avec une autre photo.");
      setIsProcessing(false);
    }
  };

  // Avant (affichage)
  const [originalPreview, setOriginalPreview] = useState(null);

  const handleBackgroundChange = async (bgId) => {
    setSelectedBackground(bgId);
    if (!originalImage) return;

    // re-génération instant dès qu'on change de fond
    await startProcessingFromOriginal({ backgroundId: bgId, formatId: selectedFormat });
  };

  const handleFormatChange = async (formatId) => {
    setSelectedFormat(formatId);
    if (!originalImage) return;

    // re-génération si une photo existe (pour preview au bon format)
    await startProcessingFromOriginal({ backgroundId: selectedBackground, formatId });
  };

  const handleDownloadClick = () => {
    if (credits > 0) {
      setStep("export");
      return;
    }
    setStep("paywall");
  };

  const actuallyDownloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `easylook-pro-${selectedFormat}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    consumeOneCredit();
    setStep("confirmation");
  };

  const handleOpenMobileMoney = () => {
    const phone = "221707546281";
    const message = encodeURIComponent(
      `Bonjour ! Je souhaite activer EasyLook Pro (2 500 XOF / mois).\n` +
        `Segment : ${segmentLabel}\n` +
        `Merci de m’indiquer la procédure Mobile Money.\n` +
        `Mon numéro est : `
    );
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  const resetForNewPhoto = () => {
    // annule les requêtes en cours
    requestSeq.current += 1;

    setOriginalImage(null);
    setOriginalPreview(null);
    setProcessedImage(null);

    setSelectedBackground("studio-white");
    setSelectedFormat("square");

    setErrorMsg("");
    setIsProcessing(false);
    setStep("home");
  };

  // --- UI helpers ---

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
            <input type="radio" name="segment" value={s.id} checked={segment === s.id} onChange={() => setSegment(s.id)} style={{ marginTop: 3 }} />
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
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(220, 38, 38, 0.25)",
          background: "rgba(220, 38, 38, 0.06)",
          color: "#7f1d1d",
          whiteSpace: "pre-line",
          textAlign: "left",
        }}
      >
        <strong>Erreur :</strong> {errorMsg}
      </div>
    );
  };

  // --- Screens ---

  const renderHome = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content">
        {renderCreditsPill()}

        <h1 className="elp-title">Tes photos, version studio.</h1>
        <p className="elp-subtitle">
          Transforme tes photos produits en visuels qualité studio, en moins de 60 secondes. Idéal pour WhatsApp, Instagram, e-commerce et tous tes réseaux.
        </p>

        {renderSegmentPicker()}

        {renderErrorBox()}

        <div className="elp-card elp-card-centered">
          <button className="elp-button" onClick={handleUploadClick} disabled={isProcessing}>
            {isProcessing ? "Traitement en cours…" : "Améliorer ma photo"}
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
          {originalPreview && (
            <div className="elp-image-block">
              <span className="elp-tag">Avant</span>
              <img src={originalPreview} alt="Avant" className="elp-image" />
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
              disabled={isProcessing}
              title={isProcessing ? "Traitement en cours…" : ""}
            >
              {bg.label}
            </button>
          ))}
        </div>

        <div className="elp-card elp-card-actions">
          <button className="elp-button" onClick={handleDownloadClick} disabled={isProcessing || !processedImage}>
            {credits > 0 ? "Télécharger (1 crédit)" : "Activer EasyLook Pro"}
          </button>

          <p className="elp-helper">
            {isProcessing
              ? "Traitement en cours…"
              : credits > 0
              ? "Le téléchargement consomme 1 crédit."
              : "Crédits épuisés : passe en illimité."}
          </p>

          <button className="elp-link-button" onClick={resetForNewPhoto} disabled={isProcessing}>
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
                disabled={isProcessing}
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
          disabled={isProcessing || !processedImage}
        >
          Télécharger (1 crédit)
        </button>

        <button className="elp-link-button" onClick={() => setStep("result")} disabled={isProcessing}>
          Retour
        </button>

        {isProcessing && (
          <p className="elp-helper" style={{ marginTop: 10 }}>
            Re-génération en cours pour appliquer le format…
          </p>
        )}
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
            <li>Détourage automatique</li>
            <li>10 fonds studio optimisés mode & artisanat</li>
            <li>Export multi-formats (WhatsApp, e-commerce, réseaux)</li>
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
          Ton téléchargement est prêt. Il te reste <strong>{credits}</strong> crédit{credits === 1 ? "" : "s"} gratuit{credits === 1 ? "" : "s"}.
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
