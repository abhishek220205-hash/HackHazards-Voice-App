# 🚀 हिंदी वॉइस असिस्टेंट (Hindi Voice Assistant)

> Speak in Hindi. Get answers in Hindi. No typing, no English, no barriers.

---

## 📌 Problem & Domain

Millions of Hindi-speaking Indians — farmers, students, daily wage workers — struggle to access basic information because most digital tools are English-first and text-first. Someone who wants to know about a government scheme like PM-KISAN has to navigate English websites, forms, and menus they cannot read comfortably. There is no simple voice-first way for them to just *ask* and *get an answer* in their own language.

**Themes Selected:**

- [x] Human Experience & Productivity
- [ ] Climate & Sustainability Systems
- [ ] HealthTech & Bio Platforms
- [ ] Learning & Knowledge Systems
- [ ] Work, Finance & Digital Economy
- [ ] Infrastructure, Mobility & Smart Systems
- [ ] Trust, Identity & Security
- [ ] Media, Social & Interactive Platforms
- [x] Public Systems, Governance and Civic Tech
- [ ] Developer Tools & Software Infrastructure

---

## 🎯 Objective

This app lets a user speak a question in Hindi and receive a spoken answer in Hindi — no reading, no typing required.

- **Target users:** Hindi-speaking individuals in India who are more comfortable speaking than typing or reading English — farmers, students, daily wage workers, and elderly users.
- **The pain point:** Government schemes, everyday information, and digital services are locked behind English text interfaces that exclude a huge portion of India's population.
- **The value:** A completely voice-first interaction — speak your question, hear your answer, in Hindi, in seconds.

---

## 🧠 Team & Approach

### Team Name:

`victors`

### Team Members:

- Abhishek Kumar (GitHub: abhishek220205-hash) — Backend + AI Integration + Project Lead
- Jigyanshu      (GitHub / LinkedIn) — Frontend / Expo Development
- ABHAY          (GitHub / LinkedIn) — Docs, PPT, 
- Sahil Dogra    (GitHub / LinkedIn) — Demo Video, Submission

### Your Approach:

- We chose this problem because voice access for Hindi speakers is a real, everyday gap — not a hypothetical one.
- The biggest technical challenge was chaining three separate AI API calls (Speech-to-Text → Chat → Text-to-Speech) reliably in sequence, handling markdown-formatted AI replies that broke the Text-to-Speech API, and working around a 500-character input limit on TTS.
- We deliberately kept the app scope to exactly 3 screens — Home, Listening, Result — to make sure the core voice loop was rock solid rather than spreading effort across unnecessary features.

---

## 🛠️ Tech Stack

### Core Technologies Used:

- **Frontend:** Expo (React Native), SDK 54, JavaScript
- **Backend:** Node.js, Express
- **Database:** None (stateless voice pipeline)
- **APIs:** Sarvam AI — Speech-to-Text (saarika:v2.5), Chat Completion (sarvam-30b), Text-to-Speech (speaker: vidya)
- **Hosting:** Render (backend deployment)

### Additional Technologies Used:

- [x] AI / ML
- [ ] Web3 / Blockchain
- [ ] Cyber Security
- [ ] Cloud

---

## 🏆 Sponsored Track

- [x] **Expo Track** – Built entirely using Expo (React Native), core functionality runs within the Expo ecosystem, tested live via Expo Go on a real Android device.
- [ ] **Neo4j Track**
- [ ] **Base44 Track**

**Sarvam AI Track:**
> Sarvam AI is the core of this product, not an add-on. All three Sarvam APIs are used in a live, sequential pipeline: Speech-to-Text converts the user's Hindi voice into text, Chat Completion generates a Hindi answer, and Text-to-Speech converts that answer back into spoken audio. Without Sarvam's APIs, the app has no functionality — this is the entire product.

**Expo Track:**
> The app is built end-to-end using Expo (React Native, SDK 54). All three screens (Home, Listening, Result) run natively within the Expo ecosystem, and audio recording/playback uses expo-av. The app was tested live on a physical Android device via Expo Go throughout development.

---

## ✨ Key Features

- ✅ One-tap voice recording — no forms, no typing
- ✅ Real-time Hindi speech-to-text transcription via Sarvam STT
- ✅ Context-aware Hindi answers via Sarvam Chat (sarvam-30b)
- ✅ Natural-sounding spoken responses via Sarvam TTS (auto-plays on result screen)
- ✅ Clean 3-screen flow: Home → Listening → Result
- ✅ Fully functional on a real Android device via Expo Go

---

## 📽️ Demo & Deliverables

- **Demo Video Link (Mandatory):** [Paste link]
- **Deployment Link (Recommended):** [Paste Render backend URL]
- **Pitch Deck / PPT (Optional):** [Paste Gamma.app link]

---

## ✅ Tasks & Bonus Checklist

- [ ] All team members completed the mandatory social task
- [ ] Bonus Task 1 – Badge sharing
- [ ] Bonus Task 2 – Blog/article

---

## 🧪 How to Run the Project

### Requirements:

- Node.js (v18 or higher)
- Expo Go app installed on a physical Android/iOS device
- A Sarvam AI API key (get one at [dashboard.sarvam.ai](https://dashboard.sarvam.ai))

### Local Setup:

```bash
# Clone the repository
git clone https://github.com/abhishek220205-hash/HackHazards-Voice-App.git
cd HackHazards-Voice-App

# ---- Backend ----
cd backend
npm install
# Create a .env file with:
# SARVAM_API_KEY=your_api_key_here
node server.js
# Server runs on http://localhost:3000

# ---- Frontend ----
cd ../frontend
npm install
npx expo start
# Scan the QR code with Expo Go on your phone
```

**Note:** The frontend's `App.js` currently points to a local IP address (`http://192.168.31.245:3000`) for the backend URL. Update this to your deployed Render URL, or your own local IP (find it via `ipconfig`), before running.

---

## 🧬 Future Scope

- 📈 Support for more Indian languages beyond Hindi (Tamil, Telugu, Bengali, etc.)
- 🛡️ Offline fallback mode for low-connectivity areas
- 🌐 Expand beyond government schemes to healthcare, education, and local services information

---

## 📎 Resources / Credits

- [Sarvam AI](https://sarvam.ai) — Speech-to-Text, Chat, and Text-to-Speech APIs
- [Expo](https://expo.dev) — React Native framework
- Built as part of HackHazards 2026 (NAMESPACE Community)

---

## 🏁 Final Words

Built by a first-time hackathon team from scratch — starting with zero prior experience with Expo, Node.js backend servers, or the Sarvam AI APIs. The biggest breakthrough moment was getting the full voice loop (speak → understand → answer → speak back) working end-to-end on a real phone for the first time. What started as a test script grew into a fully working mobile app within days.
