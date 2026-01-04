import Busboy from "busboy";

/**
 * POST /api/process-image
 * Attendu: multipart/form-data avec champ fichier "image"
 * Retour: image/png (fond transparent) issu de remove.bg
 */
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Method not allowed" }));
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({
          error: "Missing REMOVE_BG_API_KEY in environment variables",
        })
      );
    }

    // --- Parse multipart/form-data (image file) ---
    const { fileBuffer, fileName, mimeType, fields } = await parseMultipart(req);

    if (!fileBuffer || fileBuffer.length === 0) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "No image file received" }));
    }

    // --- Call remove.bg using binary file ---
    const formData = new FormData();

    // Convert Buffer -> Blob (Node 18+ supports Blob/FormData)
    const blob = new Blob([fileBuffer], { type: mimeType || "image/png" });

    // IMPORTANT: remove.bg works best with "image_file" (binary), not image_file_b64
    formData.append("image_file", blob, fileName || "image.png");
    formData.append("size", "auto");
    formData.append("format", "png"); // transparent output

    // Optionnel (utile pour produits)
    // formData.append("type", "product");

    // Si tu veux passer des infos du front (non utilisé pour remove.bg ici)
    // ex: fields.segment, fields.background, fields.format

    const rbRes = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });

    if (!rbRes.ok) {
      const text = await rbRes.text().catch(() => "");
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({
          error: "remove.bg request failed",
          status: rbRes.status,
          details: text?.slice(0, 1200) || "No details",
        })
      );
    }

    const arrayBuffer = await rbRes.arrayBuffer();
    const out = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    // Cache off for MVP
    res.setHeader("Cache-Control", "no-store");
    return res.end(out);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        error: "Server error",
        message: err?.message || String(err),
      })
    );
  }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
      },
    });

    const fields = {};
    let fileBuffer = null;
    let fileName = "";
    let mimeType = "";

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, file, info) => {
      // On s’attend à un champ "image" côté front
      const { filename, mimeType: mt } = info || {};
      fileName = filename || "";
      mimeType = mt || "";

      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("limit", () => {
        reject(new Error("File too large (limit 10MB)"));
      });
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("error", reject);
    bb.on("finish", () => {
      resolve({ fileBuffer, fileName, mimeType, fields });
    });

    req.pipe(bb);
  });
}
