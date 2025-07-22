const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = "c508f2070cd2fe6a97f3bcabbde99ac4507ba77cf2a8d1c0b3578c4fd7e5f7e7"; // anime model

app.get("/anime", async (req, res) => {
  const prompt = req.query.text;
  if (!prompt) return res.status(400).send("Missing ?text=");

  try {
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          prompt: prompt
        }
      })
    }).then(r => r.json());

    const getUrl = prediction.urls.get;

    let output;
    while (true) {
      const result = await fetch(getUrl, {
        headers: {
          Authorization: `Token ${REPLICATE_API_TOKEN}`
        }
      }).then(r => r.json());

      if (result.status === "succeeded") {
        output = result.output;
        break;
      } else if (result.status === "failed") {
        return res.status(500).send("Generation failed");
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    res.redirect(output[0]);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.listen(3000, () => console.log("✅ Anime API ready on port 3000"));