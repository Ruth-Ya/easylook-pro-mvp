/* src/App.css */

:root {
  --elp-bg: #f8f5f2;
  --elp-text: #222222;
  --elp-accent: #c78b3a; /* doré chaud */
  --elp-accent-2: #1f4f4a; /* vert profond */
  --elp-cta: #e36c4a; /* corail doux */
  --elp-radius: 14px;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter",
    "Segoe UI", sans-serif;
  background-color: var(--elp-bg);
  color: var(--elp-text);
}

/* Conteneur général */

.elp-app {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

/* Écran principal */

.elp-screen {
  width: 100%;
  max-width: 520px;
  padding: 24px 16px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Sur desktop : carte centrée */

@media (min-width: 900px) {
  .elp-screen {
    max-width: 760px;
    padding: 40px 48px 48px;
    margin: 40px 0;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.06);
  }
}

/* Header / logo (compact) */

.elp-header {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.elp-logo {
  height: 32px;
  object-fit: contain;
}

@media (min-width: 900px) {
  .elp-logo {
    height: 40px;
  }
}

/* Contenu texte */

.elp-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}

.elp-centered {
  align-items: center;
  text-align: center;
}

.elp-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.elp-title-small {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.elp-subtitle {
  font-size: 0.98rem;
  line-height: 1.6;
  margin: 0 auto;
  color: #555555;
  max-width: 36rem;
}

/* Cartes */

.elp-card {
  background: #ffffff;
  border-radius: var(--elp-radius);
  padding: 18px 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
}

.elp-card-centered {
  text-align: center;
}

.elp-card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

/* Boutons */

.elp-button {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 13px 18px;
  font-size: 1rem;
  font-weight: 600;
  background: var(--elp-cta);
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease, opacity 0.15s ease;
}

.elp-button:hover {
  opacity: 0.97;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.09);
}

.elp-link-button {
  margin-top: 4px;
  background: transparent;
  border: none;
  padding: 8px;
  font-size: 0.9rem;
  text-decoration: underline;
  color: var(--elp-accent-2);
  cursor: pointer;
}

.elp-helper {
  font-size: 0.85rem;
  color: #777777;
  margin-top: 8px;
}

/* Bas de page */

.elp-footer-note {
  font-size: 0.8rem;
  color: #888888;
  text-align: center;
  margin-top: auto;
}

/* Loader */

.elp-loader {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--elp-accent);
  animation: elp-spin 0.9s linear infinite;
  margin-bottom: 16px;
}

@keyframes elp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Comparaison images */

.elp-compare {
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.elp-image-block {
  flex: 1;
  min-width: 45%;
  position: relative;
  border-radius: var(--elp-radius);
  overflow: hidden;
  background: #f0f0f0;
}

.elp-image {
  width: 100%;
  height: auto;
  display: block;
}

.elp-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ffffff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 600;
}

.elp-tag-green {
  background: #d7f5ea;
}

/* Fonds / chip list */

.elp-background-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.elp-chip {
  border-radius: 999px;
  border: 1px solid #dddddd;
  padding: 6px 12px;
  background: #ffffff;
  font-size: 0.8rem;
  white-space: nowrap;
  cursor: pointer;
}

.elp-chip-active {
  border-color: var(--elp-accent);
  background: #fff4e2;
}

/* Liste Paywall */

.elp-list {
  padding-left: 18px;
  margin: 0;
  font-size: 0.9rem;
}

.elp-list li + li {
  margin-top: 4px;
}

/* Radios */

.elp-radio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

/* Responsive desktop : titres un peu plus grands */

@media (min-width: 900px) {
  .elp-title {
    font-size: 2.1rem;
  }
  .elp-title-small {
    font-size: 1.6rem;
  }
}

/* === HERO : bandeau slider + mockup téléphone === */

.elp-hero-top {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

/* Bandeau slider */

.elp-hero-banner {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 9px 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ffe3bd 0%, #f8f5f2 100%);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 18px rgba(199, 139, 58, 0.12);
}

.elp-hero-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #a36a2a;
}

.elp-hero-slider {
  flex: 1;
  overflow: hidden;
}

.elp-hero-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.86rem;
  color: #444444;
  white-space: nowrap;
  animation: elp-fade-in 0.35s ease;
}

@keyframes elp-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mockup téléphone */

.elp-hero-phone {
  display: flex;
  justify-content: center;
}

.elp-phone-frame {
  width: 190px;
  border-radius: 26px;
  padding: 10px 8px 14px;
  background: #050608;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
}

.elp-phone-notch {
  width: 40%;
  height: 12px;
  margin: 0 auto 8px;
  border-radius: 0 0 12px 12px;
  background: #050608;
}

.elp-phone-screen {
  border-radius: 20px;
  background: radial-gradient(circle at top, #273246 0, #111827 55%, #050815 100%);
  padding: 10px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #f9fafb;
}

.elp-phone-badge {
  align-self: flex-start;
  font-size: 0.62rem;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.elp-phone-block-row {
  display: flex;
  gap: 6px;
}

.elp-phone-block {
  flex: 1;
  border-radius: 10px;
  padding: 6px 5px 7px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.elp-phone-block-light {
  background: rgba(15, 23, 42, 0.9);
}

.elp-phone-block-strong {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.elp-phone-label {
  font-size: 0.62rem;
  opacity: 0.9;
}

.elp-phone-thumb {
  height: 42px;
  border-radius: 8px;
  background-image: repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0.18) 4px,
      transparent 4px,
      transparent 8px
    );
  background-color: rgba(15, 23, 42, 0.6);
}

.elp-phone-bars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.elp-phone-bar {
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.8);
}

.elp-phone-bar-short {
  width: 65%;
  background: rgba(148, 163, 184, 0.5);
}

.elp-phone-cta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.elp-phone-cta {
  width: 80px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e36c4a, #f97316);
}

.elp-phone-dot-row {
  display: flex;
  gap: 3px;
}

.elp-phone-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.8);
}

/* Ajustements desktop pour le hero */

@media (min-width: 900px) {
  .elp-hero-top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .elp-hero-banner {
    max-width: 420px;
  }

  .elp-hero-phone {
    justify-content: flex-end;
  }
}
