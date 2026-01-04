// api/process-image.js
import path from "path";
import sharp from "sharp";

const BG_MAP = {
  "studio-white": "studio-white.jpg",
  "neutral-grey": "neutral-grey.jpg",
  "textile-soft": "textile-soft.jpg",
  "terracotta": "terracotta.jpg",
  "deep-green": "deep-green.jpg",
  "warm-ivory": "warm-ivory.jpg",
  "sand-beige": "sand-beige.jpg",
  "olive-soft": "olive-soft.jpg",
  "clay-light": "clay-light.jpg",
  "charcoal": "charcoal.jpg",
};

const FORMAT_MAP = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  landscape: { w: 1200, h: 628 },
  whatsapp: { w: 1080, h: 1080 }, // léger: on compresse plus fort (voir plus bas)
};

function json(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function removeBgPngBufferFromBase64(imageBase64) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env REMOVE_BG_API_KEY");
  }

  const cleaned = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const form = new FormData();
  form.append("image_file_b64", cleaned);
  form.append("size", "auto"); // remove.bg optimise selon l'image
  // form.append("format", "png"); // pas nécessaire, PNG par défaut

  const resp = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`remove.bg failed: ${resp.status} ${txt}`);
  }

  const arr = await resp.arrayBuffer();
  return Buffer.from(arr); // PNG cutout (transparence)
}

async function buildComposite({
  cutoutPngBuffer,
  backgroundId,
  formatId,
}) {
  const bgFile = BG_MAP[backgroundId] || BG_MAP["studio-white"];
  const fmt = FORMAT_MAP[formatId] || FORMAT_MAP.square;

  const bgPath = path.join(process.cwd(), "public", "backgrounds", bgFile);

  // 1) Canvas (fond) au bon format
  const bg = sharp(bgPath)
    .resize(fmt.w, fmt.h, { fit: "cover" })
    .toColourspace("srgb");

  // 2) Redimensionnement du cutout pour qu’il rentre bien dans le canvas
  const maxW = Math.round(fmt.w * 0.82);
  const maxH = Math.round(fmt.h * 0.82);

  const cutoutResized = await sharp(cutoutPngBuffer)
    .resize(maxW, maxH, { fit: "inside", withoutEnlargement: true })
    .toBuffer();

  // 3) Compositing (centre)
  const composed = bg.composite([{ input: cutoutResized, gravity: "center" }]);

  // 4) Finalisation: léger boost + netteté + compression propre
  // - WhatsApp: compression un peu plus forte
  const jpegQuality = formatId === "whatsapp" ? 78 : 86;

  const finalJpeg = await composed
    .modulate({
      brightness: 1.04,
      saturation: 1.06,
    })
    .sharpen({ sigma: 0.9, m1: 0.5, m2: 1.0 })
    .jpeg({ quality: jpegQuality, mozjpeg: true })
    .toBuffer();

  return { buffer: finalJpeg, width: fmt.w, height: fmt.h };
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // pratique pour vérifier que l'endpoint existe
      return json(res, 200, { ok: true, hint: "Use POST with JSON { imageBase64, backgroundId, formatId }" });
    }

    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }

    const { imageBase64, backgroundId, formatId } = req.body || {};
    if (!imageBase64) {
      return json(res, 400, { error: "Missing imageBase64" });
    }

    // Étape 1 : détourage remove.bg (PNG transparent)
    const cutout = await removeBgPngBufferFromBase64(imageBase64);

    // Étape 2/3/4 : fond + resize + finalisation
    const out = await buildComposite({
      cutoutPngBuffer: cutout,
      backgroundId: backgroundId || "studio-white",
      formatId: formatId || "square",
    });

    const dataUrl = `data:image/jpeg;base64,${out.buffer.toString("base64")}`;

    return json(res, 200, {
      ok: true,
      formatId: formatId || "square",
      backgroundId: backgroundId || "studio-white",
      width: out.width,
      height: out.height,
      imageDataUrl: dataUrl,
    });
  } catch (e) {
    console.error("process-image error:", e);
    return json(res, 500, {
      error: "Processing failed",
      detail: String(e?.message || e),
    });
  }
}
