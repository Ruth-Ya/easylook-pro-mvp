// src/App.jsx
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import logo from "./easylook-logo.png";

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

// ➜ textes du bandeau slider
const SLIDES = [
  "Détourage automatique & fonds studio propres",
  "Pensé pour WhatsApp, Instagram & e-commerce",
  "Paiement Mobile Money, 100% local"
];

function App() {
  // home | processing | result | export | paywall | confirmation
  const [step, setStep] = useState("home");
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState("studio-white");
  const [selectedFormat, setSelectedFormat] = useState("square");
  const [hasFreeTrialUsed, setHasFreeTrialUsed] = useState(false);

  // slider bandeau
  const [currentSlide, setCurrentSlide] = useState(0);

  const fileInputRef = useRef(null);

  // rotation automatique du slider
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Simule un appel IA (détourage, fond, etc.)
  const simulateProcessing = (file) => {
    setStep("processing");

    const previewUrl = URL.createObjectURL(file);
    setOriginalImage(previewUrl);

    // TODO: remplacer par un appel réel à ton backend / API IA
    setTimeout(() => {
      setProcessedImage(previewUrl); // pour l’instant, on garde la même image
      setStep("result");
    }, 1500);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset
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
    simulateProcessing(file);
  };

  const handleDownloadClick = () => {
    // Essai gratuit dispo
    if (!hasFreeTrialUsed) {
      setStep("export");
      return;
    }
    // Essai déjà utilisé → paywall
    setStep("paywall");
  };

  const actuallyDownloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "easylook-pro-image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (!hasFreeTrialUsed) {
      setHasFreeTrialUsed(true);
    }
    setStep("confirmation");
  };

  const handleBackgroundChange = (bgId) => {
    setSelectedBackground(bgId);
    // TODO: envoyer ce choix au backend/IA pour régénérer l’image
  };

  const handleFormatChange = (formatId) => {
    setSelectedFormat(formatId);
    // TODO: appliquer un redimensionnement côté backend ou canvas
  };

  const handleOpenMobileMoney = () => {
    // Ouvre WhatsApp avec un message pré-rempli
    const phone = "221707546281"; // EasyLook Pro
    const message = encodeURIComponent(
      "Bonjour ! Je souhaite activer mon abonnement EasyLook Pro (2 500 XOF / mois). Mon numéro est : "
    );
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  const handleAfterPayment = () => {
    // pour plus tard : callback après activation réelle
    setStep("confirmation");
  };

  const resetForNewPhoto = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedBackground("studio-white");
    setSelectedFormat("square");
    setStep("home");
  };

  // --- Vues ---

  const renderHeader = () => (
    <header className="elp-header">
      <img src={logo} alt="EasyLook Pro" className="elp-logo" />
    </header>
  );

  const renderHome = () => (
    <div className="elp-screen">
      {renderHeader()}

      {/* HERO : bandeau slider + mockup téléphone */}
      <div className="elp-hero-top">
        <div className="elp-hero-banner">
          <span className="elp-hero-label">EasyLook Pro</span>
          <div className="elp-hero-slider">
            <span key={currentSlide} className="elp-hero-pill">
              {SLIDES[currentSlide]}
            </span>
          </div>
        </div>

        <div className="elp-hero-phone">
          <div className="elp-phone-frame">
            <div className="elp-phone-notch" />
            <div className="elp-phone-screen">
              <div className="elp-phone-badge">Bêta privée – Sénégal</div>

              <div className="elp-phone-block-row">
                <div className="elp-phone-block elp-phone-block-light">
                  <span className="elp-phone-label">Avant</span>
                  <div className="elp-phone-thumb" />
                </div>
                <div className="elp-phone-block elp-phone-block-strong">
                  <span className="elp-phone-label">Après (studio)</span>
                  <div className="elp-phone-thumb" />
                </div>
              </div>

              <div className="elp-phone-bars">
                <div className="elp-phone-bar" />
                <div className="elp-phone-bar elp-phone-bar-short" />
              </div>

              <div className="elp-phone-cta-row">
                <div className="elp-phone-cta" />
                <div className="elp-phone-dot-row">
                  <span className="elp-phone-dot" />
                  <span className="elp-phone-dot" />
                  <span className="elp-phone-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="elp-content">
        <h1 className="elp-title">Tes photos, version studio.</h1>
        <p className="elp-subtitle">
          Transforme tes photos produits en visuels qualité studio,
          en moins de 60 secondes. Idéal pour WhatsApp, Instagram,
          e-commerce et tous tes réseaux.
        </p>

        <div className="elp-card elp-card-centered">
          <button className="elp-button" onClick={handleUploadClick}>
            Améliorer ma photo
          </button>
          <p className="elp-helper">1 essai gratuit, sans inscription.</p>
        </div>

        <p className="elp-footer-note">Fonctionne sur tous les téléphones.</p>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
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
        <h2 className="elp-title-small">On prépare ta version studio…</h2>
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
          Choisis le fond qui met le mieux ton produit en valeur.
        </p>

        <div className="elp-background-list">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              className={`elp-chip ${
                selectedBackground === bg.id ? "elp-chip-active" : ""
              }`}
              onClick={() => handleBackgroundChange(bg.id)}
            >
              {bg.label}
            </button>
          ))}
        </div>

        <div className="elp-card elp-card-actions">
          <button className="elp-button" onClick={handleDownloadClick}>
            {hasFreeTrialUsed
              ? "Activer EasyLook Pro"
              : "Télécharger ma photo pro"}
          </button>
          <p className="elp-helper">
            {hasFreeTrialUsed
              ? "Photos illimitées, sans filigrane."
              : "Cet essai est offert 🎁"}
          </p>

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

        <button className="elp-button" onClick={actuallyDownloadImage}>
          Télécharger
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
          Pour seulement <strong>2 500 XOF / mois</strong>.
        </p>

        <div className="elp-card">
          <ul className="elp-list">
            <li>Détourage automatique</li>
            <li>10 fonds studio optimisés mode & artisanat</li>
            <li>Export multi-formats (WhatsApp, e-commerce, réseaux)</li>
            <li>Résultats en moins de 60 secondes</li>
            <li>Payer sans frais via Mobile Money</li>
          </ul>
        </div>

        <button className="elp-button" onClick={handleOpenMobileMoney}>
          Payer sans frais via Mobile Money
        </button>

        <p className="elp-helper">
          Paiement sécurisé. Aucun frais supplémentaire.
        </p>

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
        <h2 className="elp-title-small">Merci ! 🎉</h2>
        <p className="elp-subtitle">
          Ton abonnement EasyLook Pro est activé, ou ta photo a bien été
          téléchargée.
        </p>
        <button className="elp-button" onClick={resetForNewPhoto}>
          Créer une nouvelle photo
        </button>
      </div>
    </div>
  );

  // Choix de l’écran
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
