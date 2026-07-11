require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({
  dest: path.join(__dirname, "uploads"),
});

const API_KEY = process.env.SARVAM_API_KEY;

const STT_URL = "https://api.sarvam.ai/speech-to-text";
const CHAT_URL = "https://api.sarvam.ai/v1/chat/completions";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";

// CORS for Expo
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.post("/process-voice", upload.single("audio"), async (req, res) => {
  let uploadedFile = null;

  try {
    console.log("========== NEW REQUEST ==========");

    if (!API_KEY) {
      throw new Error("SARVAM_API_KEY not found in .env");
    }

    if (!req.file) {
      return res.status(400).json({
        error: "No audio uploaded. Field name must be 'audio'.",
      });
    }

    uploadedFile = req.file.path;

    console.log("Step 1: Audio uploaded");

    // --------------------------
    // Speech To Text
    // --------------------------
    console.log("Step 2: Calling Speech-to-Text...");

    const sttForm = new FormData();

    sttForm.append(
      "file",
      fs.createReadStream(uploadedFile),
      req.file.originalname
    );

    sttForm.append("model", "saarika:v2.5");
    sttForm.append("language_code", "hi-IN");

    const sttResponse = await fetch(STT_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": API_KEY,
        ...sttForm.getHeaders(),
      },
      body: sttForm,
    });

    const sttText = await sttResponse.text();

    if (!sttResponse.ok) {
      throw new Error(
        `Speech-to-Text failed (${sttResponse.status}): ${sttText}`
      );
    }

    const sttData = JSON.parse(sttText);

    const transcript = sttData.transcript;

    if (!transcript) {
      throw new Error("No transcript returned.");
    }

    console.log("Transcript:");
    console.log(transcript);

    // --------------------------
    // Chat
    // --------------------------
    console.log("Step 3: Calling Chat API...");

    const chatResponse = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer in Hindi only. Keep answers short, clear, and conversational. Maximum 2-3 sentences.",
          },
          {
            role: "user",
            content: transcript,
          },
        ],
      }),
    });

    const chatText = await chatResponse.text();

    if (!chatResponse.ok) {
      throw new Error(
        `Chat API failed (${chatResponse.status}): ${chatText}`
      );
    }

    const chatData = JSON.parse(chatText);

    let reply =
      chatData.choices &&
      chatData.choices[0] &&
      chatData.choices[0].message &&
      chatData.choices[0].message.content;

    if (!reply) {
      throw new Error("No reply returned by Chat API.");
    }

    console.log("Original Reply:");
    console.log(reply);

    // --------------------------
    // Clean reply
    // --------------------------
    reply = reply
      .replace(/[#*_\->`]/g, "")
      .replace(/\n+/g, " ")
      .trim();

    if (reply.length > 490) {
      reply = reply.substring(0, 490);
    }

    console.log("Cleaned Reply:");
    console.log(reply);

    // --------------------------
    // Text To Speech
    // --------------------------
    console.log("Step 4: Calling Text-to-Speech...");

    const ttsResponse = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [reply],
        speaker: "vidya",
        target_language_code: "hi-IN",
      }),
    });

    const ttsText = await ttsResponse.text();

    if (!ttsResponse.ok) {
      throw new Error(
        `Text-to-Speech failed (${ttsResponse.status}): ${ttsText}`
      );
    }

    const ttsData = JSON.parse(ttsText);

    if (!ttsData.audios || !ttsData.audios[0]) {
      throw new Error("No audio returned from TTS.");
    }

    console.log("TTS generated successfully.");

    res.json({
      answerText: reply,
      answerAudio: ttsData.audios[0],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  } finally {
    if (uploadedFile && fs.existsSync(uploadedFile)) {
      fs.unlinkSync(uploadedFile);
    }
  }
});

app.get("/", (req, res) => {
  res.send("Sarvam Voice Server Running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});