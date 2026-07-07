require("dotenv").config();

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const FormData = require("form-data");

const API_KEY = process.env.SARVAM_API_KEY;

const STT_URL = "https://api.sarvam.ai/speech-to-text";
const CHAT_URL = "https://api.sarvam.ai/v1/chat/completions";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";

const AUDIO_PATH = path.join(__dirname, "sample.wav");
const OUTPUT_PATH = path.join(__dirname, "output.wav");

async function main() {
  try {
    console.log("Step 1: Loading sample.wav...");

    if (!API_KEY) {
      throw new Error(
        "SARVAM_API_KEY is missing. Add it to your .env file."
      );
    }

    if (!fs.existsSync(AUDIO_PATH)) {
      throw new Error(`Audio file not found: ${AUDIO_PATH}`);
    }

    console.log("Step 2: Sending audio to Sarvam Speech-to-Text API...");

    const sttForm = new FormData();

    sttForm.append("file", fs.createReadStream(AUDIO_PATH));
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

    const sttRaw = await sttResponse.text();

    if (!sttResponse.ok) {
      throw new Error(
        `Speech-to-Text API failed (${sttResponse.status}): ${sttRaw}`
      );
    }

    const sttData = JSON.parse(sttRaw);
    const transcript = sttData.transcript;

    if (!transcript) {
      throw new Error(
        `No transcript returned by Speech-to-Text API: ${sttRaw}`
      );
    }

    console.log("Step 3: Transcript text:");
    console.log(transcript);

    console.log("Step 4: Sending transcript to Sarvam Chat API...");

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
            role: "user",
            content: transcript,
          },
        ],
      }),
    });

    const chatRaw = await chatResponse.text();

    if (!chatResponse.ok) {
      throw new Error(
        `Chat API failed (${chatResponse.status}): ${chatRaw}`
      );
    }

    const chatData = JSON.parse(chatRaw);
    const reply = chatData.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error(`No reply returned by Chat API: ${chatRaw}`);
    }

    console.log("Step 5: Chat reply:");
    console.log(reply);

    console.log("Step 6: Sending reply to Sarvam Text-to-Speech API...");

    const ttsResponse = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [reply.replace(/[#*_\->`]/g, '').replace(/\n+/g, ' ').trim().substring(0, 490)],
        target_language_code: "hi-IN",
        speaker: "vidya",
      }),
    });

    const ttsRaw = await ttsResponse.text();

    if (!ttsResponse.ok) {
      throw new Error(
        `Text-to-Speech API failed (${ttsResponse.status}): ${ttsRaw}`
      );
    }

    const ttsData = JSON.parse(ttsRaw);
    const base64Audio = ttsData.audios?.[0];

    if (!base64Audio) {
      throw new Error(
        `No audio returned by Text-to-Speech API: ${ttsRaw}`
      );
    }

    console.log("Step 7: Saving generated audio as output.wav...");

    const audioBuffer = Buffer.from(base64Audio, "base64");

    fs.writeFileSync(OUTPUT_PATH, audioBuffer);

    console.log(`Success! Audio saved to: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
  }
}

main();