export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image manquante" });
    }

    // Appel à remove.bg
    const formData = new FormData();
    formData.append("image_file_b64", imageBase64.replace(/^data:image\/\w+;base64,/, ""));
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "Erreur remove.bg",
        details: errorText,
      });
    }

    const buffer = await response.arrayBuffer();
    const base64Result = Buffer.from(buffer).toString("base64");

    res.status(200).json({
      image: `data:image/png;base64,${base64Result}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur IA" });
  }
}
