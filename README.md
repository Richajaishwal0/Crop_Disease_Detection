# 🌾 Farmingo - A Modern Platform for Farmers

Welcome to **Farmingo**, your all-in-one web platform engineered to empower farmers with modern technology. Built with a powerful stack including Next.js, Firebase, and Google's Gemini AI, this application provides a robust suite of tools designed to enhance decision-making, foster a strong community, and streamline agricultural commerce.

---

## ✨ Core Features

### 🤖 AI-Powered Intelligence Hub

- **📈 Crop Price Prediction**: Forecast market prices for various crops using AI models.
- **🌿 Crop Disease Diagnosis**: Diagnose crop diseases by uploading a photo with severity assessment and treatment recommendations.
- **🌦️ Weather Prediction & Advisory**: Hyper-localized weather forecasts with intelligent farming advice.
- **🗣️ Smart Translation**: AI-powered text translation across the platform.

### ⚙️ Integrated Platform Tools

- **🛒 Dual Marketplace**: Verified Market for certified sellers + Indirect Market for community listings.
- **💬 Community Hub**: Social forum for farmers to connect, ask questions, and share knowledge.
- **👤 User Profiles & Messaging**: Public profiles, follow system, and private direct messaging.
- **🛒 Shopping Cart & Orders**: Full e-commerce experience with cart and order history.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Generative AI**: [Google's Gemini models](https://ai.google.dev/) via [Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: Optimized for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm
- A Firebase project
- A Google Gemini API key

---

## 🔧 Firebase Setup

### Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `farmingo`) → create
3. Enable **Authentication** → Sign-in method → enable **Email/Password**
4. Enable **Firestore Database** → Start in production mode

---

### Step 2 — Get Firebase Client Config

1. In Firebase Console → **Project Settings** (⚙️) → **General** tab
2. Scroll to **Your apps** → click **Web app** (or add one)
3. Copy the config values — you'll need them for `.env.local`

---

### Step 3 — Get Firebase Admin Service Account

The Admin SDK is used for all server-side Firestore operations (server actions).

1. In Firebase Console → **Project Settings** → **Service accounts** tab
2. Click **Generate new private key** → download the JSON file
3. Rename it to `service-account.json` and place it in the **project root** (`farmingo/service-account.json`)

> ⚠️ `service-account.json` is in `.gitignore` — never commit it to git.

---

### Step 4 — Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Copy the key

---

### Step 5 — Create `.env.local`

Create a `.env.local` file in the project root (`farmingo/.env.local`) with the following:

```env
# Firebase Client SDK (public — used in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Admin SDK (server-side — points to service-account.json)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Google Gemini AI API Key
GOOGLE_GENAI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_API_KEY=your-gemini-api-key
```

> ⚠️ `.env.local` is in `.gitignore` — never commit it to git.

---

### Step 6 — Deploy Firestore Security Rules

Install Firebase CLI and deploy the rules:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

This deploys `firestore.rules` which controls read/write access to all collections.

---

### Step 7 — Seed Marketplace Products

Run the seed script to populate the `products` collection in Firestore:

```bash
node scripts/seed-products.js
```

---

## 🔐 Security Notes

| File | Gitignored | Purpose |
|---|---|---|
| `.env.local` | ✅ Yes | All API keys and config |
| `service-account.json` | ✅ Yes | Firebase Admin private key |
| `src/firebase/config.ts` | ✅ Yes | Firebase client config (reads from env) |

All sensitive credentials are loaded from environment variables — no keys are hardcoded in source code.

---

## ▶️ Running the Project

**Terminal 1 — Next.js app:**
```bash
npm install
npm run dev
```
App runs at → http://localhost:9002

**Terminal 2 — Genkit AI server (for AI features):**
```bash
npm run genkit:watch
```
Genkit inspector runs at → http://localhost:4000

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please refer to the project's contributing guidelines for more information.
