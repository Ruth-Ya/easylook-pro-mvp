import { useRef, useState } from "react";
import "./App.css";
import logo from "./easylook-logo.png";

const SEGMENTS = [
  {
    id: "mode",
    label: "Mode & Artisanat",
    desc: "Bazin, wax, accessoires, bijoux…",
  },
  {
    id: "agro",
    label: "Agro & Produits locaux",
    desc: "Bissap, miel, huiles, épices…",
  },
  {
    id: "ecommerce",
    label: "E-commerce & Catalogues",
    desc: "Produits variés, marketplace, ventes…",
  },
];

const BACKGROUNDS = [
  { id: "studio-white", label: "Studio blanc" },
  { id: "neutral-grey", label: "Neutre gris" },
  { id: "textile-soft", label: "Textile soft" },
  { id: "terracotta", label: "Terracotta" },
  { id: "deep-green", label: "Vert profond" },
  { id: "warm-ivory", label: "Ivoire chaud" },
  { id: "sand-beige", label: "Sable beige" },
  { id: "olive-soft", label: "Olive soft" },
  { id: "clay-light", label: "Argile claire" },
  { id: "charcoal", label: "Charbon" },
];

const FORMATS = [
  { id: "square", label: "Carré 1080×1080" },
  { id: "portrait", label: "Portrait 1080×1350" },
  { id: "landscape", label: "Paysage 1200×628" },
  { id: "whatsapp", label: "WhatsApp optimisé" },
];

export default function App() {
  const fileInputRef = useRef(null);

  const [step, setStep] = useState("home");
  const [segment, setSegment] = useState("mode");
  const [selectedBackground, setSelectedBackground] = useState("studio-white");
  const [selectedFormat, setSelectedFormat] = useState("square");

  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState("");
  const [processedImage, setProcessedImage] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const fileToDataUrl = (selectedFile) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
      reader.readAsDataURL(selectedFile);
    });

  const callProcessApi = async ({ imageBase64, backgroundId, formatId }) => {
    const resp = await fetch("/api/process-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
        backgroundId,
        formatId,
      }),
    });

    let data = {};
    try {
      data = await resp.json();
    } catch {
      data = {};
    }

    if (!resp.ok) {
      throw new Error(data.detail || data.error || "Erreur serveur.");
    }

    if (!data.imageDataUrl) {
      throw new Error("Aucune image retournée par l’API.");
    }

    return data;
  };

  const processCurrentImage = async ({
    imageBase64,
    backgroundId,
    formatId,
    keepOnResult = false,
  }) => {
    setError("");
    setIsProcessing(true);
    if (!keepOnResult) {
      setStep("processing");
    }

    try {
      const data = await callProcessApi({
        imageBase64,
        backgroundId,
        formatId,
      });

      setProcessedImage(data.imageDataUrl);
      setStep("result");
    } catch (err) {
      setError(err.message || "Le traitement a échoué.");
      setStep("home");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Merci de choisir une image JPG ou PNG.");
      return;
    }

    try {
      setFile(selectedFile);
      setError("");
      const dataUrl = await fileToDataUrl(selectedFile);
      setOriginalImage(dataUrl);
      await processCurrentImage({
        imageBase64: dataUrl,
        backgroundId: selectedBackground,
        formatId: selectedFormat,
      });
    } catch (err) {
      setError(err.message || "Impossible de charger l’image.");
      setStep("home");
    }
  };

  const handleBackgroundChange = async (bgId) => {
    setSelectedBackground(bgId);

    if (!originalImage) return;

    await processCurrentImage({
      imageBase64: originalImage,
      backgroundId: bgId,
      formatId: selectedFormat,
      keepOnResult: true,
    });
  };

  const handleFormatChange = async (formatId) => {
    setSelectedFormat(formatId);

    if (!originalImage) return;

    await processCurrentImage({
      imageBase64: originalImage,
      backgroundId: selectedBackground,
      formatId,
      keepOnResult: true,
    });
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `easylook-pro-${selectedFormat}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setStep("home");
    setFile(null);
    setOriginalImage("");
    setProcessedImage("");
    setError("");
    setIsProcessing(false);
    setSelectedBackground("studio-white");
    setSelectedFormat("square");
    setSegment("mode");
  };

  const renderHeader = () => (
    <header className="elp-header">
      <div className="elp-hero-banner">
        <img
          src={logo}
          alt="EasyLook Pro – Tes photos, version studio"
          className="elp-hero-image"
        />
      </div>
    </header>
  );

  const renderHome = () => (
    <div className="elp-screen">
      {renderHeader()}

      <div className="elp-content">
        <h1 className="elp-title">Tes photos, version studio.</h1>
        <p className="elp-subtitle">
          Transforme tes photos produits en visuels qualité studio, en moins de
          60 secondes. Idéal pour WhatsApp, Instagram, e-commerce et tous tes
          réseaux.
        </p>

        <div className="elp-card" style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Choisis ton segment
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SEGMENTS.map((item) => (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  padding: "10px",
                  borderRadius: 12,
                  border:
                    segment === item.id
                      ? "1px solid rgba(199,139,58,0.55)"
                      : "1px solid rgba(0,0,0,0.08)",
                  background:
                    segment === item.id ? "rgba(199,139,58,0.08)" : "#fff",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="segment"
                  value={item.id}
                  checked={segment === item.id}
                  onChange={() => setSegment(item.id)}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    {item.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error ? (
          <div
            className="elp-card"
            style={{
              border: "1px solid #f2b8b5",
              background: "#fff7f7",
              color: "#8a1c1c",
            }}
          >
            <strong>Erreur :</strong> {error}
          </div>
        ) : null}

        <div className="elp-card elp-card-centered">
          <button
            className="elp-button"
            onClick={handleUploadClick}
            disabled={isProcessing}
          >
            {isProcessing ? "Traitement..." : "Améliorer ma photo"}
          </button>
          <p className="elp-helper">
            Upload d’une image puis traitement automatique.
          </p>
        </div>

        <p className="elp-footer-note">Fonctionne sur tous les téléphones.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );

  const renderProcessing = () => (
    <div className="elp-screen">
      {renderHeader()}
      <div className="elp-content elp-centered">
        <div className="elp-loader" />
        <h2 className="elp-title-small">On prépare ta version studio...</h2>
        <p className="elp-subtitle">
          Ça prend moins de 60 secondes. Tu peux poser ton téléphone 😉
        </p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="elp-screen">
      {renderHeader()}

      <div className="elp-content">
        <h2 className="elp-title-small">Ta photo, en version pro.</h2>

        <div className="elp-compare">
          <div className="elp-image-block">
            <span className="elp-tag">Avant</span>
            {originalImage ? (
              <img src={originalImage} alt="Avant" className="elp-image" />
            ) : null}
          </div>

          <div className="elp-image-block">
            <span className="elp-tag elp-tag-green">Après</span>
            {processedImage ? (
              <img src={processedImage} alt="Après" className="elp-image" />
            ) : null}
          </div>
        </div>

        <p className="elp-subtitle">
          {file ? `Fichier : ${file.name}` : "Choisis le fond et le format."}
        </p>

        <div className="elp-card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Fonds studio</div>
          <div className="elp-background-list">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                className={`elp-chip ${
                  selectedBackground === bg.id ? "elp-chip-active" : ""
                }`}
                onClick={() => handleBackgroundChange(bg.id)}
                disabled={isProcessing}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="elp-card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Formats</div>
          {FORMATS.map((format) => (
            <label key={format.id} className="elp-radio-row">
              <input
                type="radio"
                name="format"
                value={format.id}
                checked={selectedFormat === format.id}
                onChange={() => handleFormatChange(format.id)}
                disabled={isProcessing}
              />
              <span>{format.label}</span>
            </label>
          ))}
        </div>

        <div className="elp-card elp-card-actions">
          <button
            className="elp-button"
            onClick={handleDownload}
            disabled={!processedImage || isProcessing}
          >
            Télécharger l’image
          </button>

          <button className="elp-link-button" onClick={handleReset}>
            Reprendre une nouvelle photo
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "processing") {
    return <div className="elp-app">{renderProcessing()}</div>;
  }

  if (step === "result") {
    return <div className="elp-app">{renderResult()}</div>;
  }

  return <div className="elp-app">{renderHome()}</div>;
}

