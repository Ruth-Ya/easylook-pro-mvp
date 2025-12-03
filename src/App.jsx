import { useState } from "react";
import "./App.css";
import logo from "./easylook-logo.png";

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return bytes + " o";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " Ko";
  const mb = kb / 1024;
  return mb.toFixed(1) + " Mo";
}

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    const f = event.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIsProcessing(true);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    // simulate processing < 1 min
    setTimeout(() => {
      setIsProcessing(false);
    }, 800);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const f = event.dataTransfer.files?.[0];
    if (!f) return;
    const fakeInput = { target: { files: [f] } };
    handleFileChange(fakeInput);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-mark">
          <div className="brand-logo">
            <img src={logo} alt="EasyLook Pro" />
          </div>
          <div className="brand-text">
            <span className="brand-name">EasyLook Pro</span>
            <span className="brand-tagline">Tes photos, version studio</span>
          </div>
        </div>
        <div className="badge-beta">
          <span className="badge-dot" />
          Bêta privée – Sénégal
        </div>
      </header>

      <main className="app-main">
        <section className="hero-card">
          <div className="hero-text">
            <h1>Qualité studio, en moins de 60 secondes.</h1>
            <p>
              Transforme tes photos produits en visuels propres pour WhatsApp,
              Instagram et les boutiques en ligne. Paiement local, 100% Mobile
              Money.
            </p>

            <div className="hero-pills">
              <div className="pill">
                <strong>Qualité pro</strong>
                <span>Détourage & fonds propres</span>
              </div>
              <div className="pill">
                <strong>Ultra rapide</strong>
                <span>&lt; 60 sec / photo</span>
              </div>
              <div className="pill">
                <strong>Payer sans frais</strong>
                <span>Mobile Money (XOF)</span>
              </div>
            </div>
          </div>

          <div className="upload-card">
            <div className="upload-title">Teste EasyLook Pro gratuitement</div>
            <div className="upload-sub">
              Charge une photo produit et visualise le rendu “version studio”.
            </div>

            <div
              className="dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="drop-left">
                <div className="drop-icon">⬆️</div>
                <div className="drop-text">
                  <strong>Glisse-dépose ou sélectionne une image</strong>
                  <span>Format JPG ou PNG, max 10 Mo</span>
                </div>
              </div>
              <div className="drop-cta">
                <label>
                  <button type="button">Choisir un fichier</button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="status-row">
              <span>
                {file ? (
                  <>
                    <strong>{file.name}</strong> · {formatSize(file.size)}
                  </>
                ) : (
                  "Aucun fichier sélectionné pour le moment"
                )}
              </span>
              <span>
                {isProcessing
                  ? "Traitement en cours..."
                  : file
                  ? "Traitement terminé (démonstration)"
                  : ""}
              </span>
            </div>

            <div className="preview-grid">
              <div className="preview-card">
                <div className="preview-label">
                  <span>Original</span>
                </div>
                <div className="preview-box">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="preview-img"
                    />
                  ) : (
                    "Charge une photo pour prévisualiser"
                  )}
                </div>
              </div>
              <div className="preview-card">
                <div className="preview-label">
                  <span>Version studio (démo)</span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>
                    IA non activée – mock
                  </span>
                </div>
                <div className="preview-box">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Version studio"
                      className="preview-img"
                    />
                  ) : (
                    "Ici apparaîtra le rendu EasyLook Pro"
                  )}
                </div>
              </div>
            </div>

            <div className="footer-hint">
              <span>
                <strong>Prochaine étape :</strong> activer les modèles IA
                (détourage, fonds optimisés mode & artisanat).
              </span>
              <span>
                Payer sans frais via Mobile Money – Abonnement ou crédits.
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
