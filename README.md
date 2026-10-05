# 🌾 Farmingo

**Farmingo** is a full-stack web platform built to empower farmers with modern technology. It combines AI-powered agricultural intelligence, a community forum, a product marketplace, and real-time messaging — all in a single, unified application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Firestore Security Rules](#firestore-security-rules)
- [Seeding Data](#seeding-data)
- [User Roles](#user-roles)
- [Security](#security)
- [Contributing](#contributing)

---

## Overview

Farmingo addresses key challenges faced by farmers in India by providing:

- AI-driven crop disease diagnosis using image recognition (Gemini 2.5 Flash + ResNet)
- Market price forecasting to help farmers decide when to sell
- Hyper-local weather prediction with farming advisories
- A community forum for peer-to-peer knowledge sharing
- A marketplace for agricultural products, seeds, fertilizers, and medicines
- Direct messaging between farmers and agricultural experts
- Multi-language support for regional accessibility

---

## Features

### AI-Powered Tools

| Feature | Description |
|---|---|
| Crop Disease Diagnosis | Upload a photo of a crop — AI identifies the disease, severity, cause, and provides organic and chemical treatment recommendations |
| Crop Price Prediction | Forecasts market prices for various crops to help farmers maximize profit |
| Weather Prediction | Localized weather forecasts with intelligent farming advisories |
| Smart Translation | Translates community posts and marketplace listings into regional Indian languages |
| Crop Recommendation | Suggests suitable crops based on soil, region, and season |

### Platform Features

| Feature | Description |
|---|---|
| Community Hub | Reddit-style forum with communities, posts, comments, upvotes/downvotes, and markdown support |
| Marketplace | E-commerce store for seeds, fertilizers, pesticides, tools, and irrigation equipment |
| Indirect Marketplace | Community-driven listings where any user can post items for sale or trade |
| Expert Connect | Browse and follow verified agricultural experts |
| Direct Messaging | Real-time one-on-one conversations between users |
| Shopping Cart & Orders | Full e-commerce flow with cart, checkout, and order history |
| Notifications | In-app notifications for expert reviews, messages, and status updates |
| User Profiles | Public profiles with follow/unfollow, post history, and region settings |
| Expert Dashboard | Dedicated dashboard for experts to review diagnosis submissions and provide feedback |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Frontend UI | ShadCN UI + Radix UI primitives |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication (Email/Password) |
| Database | Firebase Firestore |
| Server-side DB | Firebase Admin SDK |
| AI / Generative | Google Gemini 2.5 Flash via Genkit |
| Image AI | ResNet (Hugging Face Transformers) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| PDF Export | jsPDF |
| Deployment | Firebase App Hosting |

---

## Project Structure

```
farmingo/
├── scripts/                  # Utility scripts (e.g., seed-products.js)
├── src/
│   ├── ai/
│   │   ├── flows/            # Genkit AI flows (disease, price, weather, translation)
│   │   ├── dev.ts            # Genkit dev server entry
│   │   └── genkit.ts         # Genkit + Gemini initialization
│   ├── app/
│   │   ├── actions/          # Next.js server actions (Admin SDK)
│   │   ├── api/              # API route handlers
│   │   ├── community/        # Community hub pages
│   │   ├── marketplace/      # Marketplace pages
│   │   ├── messages/         # Messaging pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── disease-diagnosis/
│   │   ├── price-prediction/
│   │   ├── weather-prediction/
│   │   ├── experts/          # Agricultural experts directory
│   │   ├── expert/           # Expert dashboard (separate layout)
│   │   ├── profile/
│   │   ├── settings/
│   │   └── ...
│   ├── components/
│   │   ├── features/         # Page-level feature components
│   │   ├── layout/           # App layout, sidebar, header
│   │   └── ui/               # ShadCN UI base components
│   ├── context/              # React context providers
│   ├── firebase/
│   │   ├── admin.ts          # Firebase Admin SDK (server-side)
│   │   ├── config.ts         # Firebase client config (reads from env)
│   │   ├── provider.tsx      # Firebase context provider
│   │   └── firestore/        # Firestore hooks (useCollection, useDoc)
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── actions/          # Client-side Firestore actions
│   │   └── utils.ts
│   ├── middleware.ts          # Route protection middleware
│   └── types.ts              # Shared TypeScript types
├── firestore.rules            # Firestore security rules
├── firebase.json              # Firebase CLI config
├── .env.local                 # Environment variables (gitignored)
└── service-account.json       # Firebase Admin credentials (gitignored)
```

---

## Getting Started

### Prerequisites

- Node.js v18 or newer
- npm
- A Firebase project
- A Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
git clone https://github.com/SwapCodesDev/farmingo.git
cd farmingo
npm install
```

---

## Firebase Setup

### Step 1 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** and follow the setup wizard
3. Enable **Authentication** → Sign-in method → **Email/Password**
4. Enable **Firestore Database** → Start in **production mode**

### Step 2 — Get Firebase Client Config

1. Firebase Console → **Project Settings** (⚙️) → **General** tab
2. Scroll to **Your apps** → select or create a **Web app**
3. Copy the config values for your `.env.local`

### Step 3 — Get Firebase Admin Service Account

The Admin SDK is required for all server-side Firestore operations (server actions).

1. Firebase Console → **Project Settings** → **Service accounts** tab
2. Click **Generate new private key** → download the JSON file
3. Rename it to `service-account.json` and place it in the project root

> ⚠️ `service-account.json` is listed in `.gitignore` — never commit it to version control.

### Step 4 — Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Firebase Client SDK (browser-side, safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Firebase Admin SDK (server-side only)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Google Gemini AI
GOOGLE_GENAI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_API_KEY=your-gemini-api-key
```

> ⚠️ `.env.local` is listed in `.gitignore` — never commit it to version control.

---

## Running the Project

Open two terminals:

**Terminal 1 — Next.js development server:**
```bash
npm run dev
```
Application runs at → [http://localhost:9002](http://localhost:9002)

**Terminal 2 — Genkit AI server (required for AI features):**
```bash
npm run genkit:watch
```
Genkit Developer UI runs at → [http://localhost:4000](http://localhost:4000)

**Other commands:**

```bash
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

---

## Firestore Security Rules

The `firestore.rules` file defines access control for all Firestore collections:

| Collection | Access |
|---|---|
| `users` | Authenticated users can read; owners can update own profile fields |
| `posts` | Public read; authenticated users can create; owners can edit/delete |
| `communities` | Authenticated read; authenticated create; owners can update |
| `products` | Public read; verified sellers can create/update/delete |
| `conversations` | Authenticated list; participants can read/write |
| `marketplacePosts` | Authenticated read/create; owners can edit/delete |
| `orders` | Users can only access their own orders |
| `notifications` | Authenticated read/write |
| `cart` | Users can only access their own cart items |

After modifying `firestore.rules`, deploy with:
```bash
firebase deploy --only firestore:rules
```

---

## Seeding Data

To populate the marketplace with initial farming products:

```bash
node scripts/seed-products.js
```

This adds 15 products across categories: Seeds, Fertilizers, Plant Medicine, Pesticides, Tools, Equipment, and Irrigation.

---

## User Roles

| Role | Permissions |
|---|---|
| `user` | Basic access — browse, post in community |
| `farmer` | Same as user, can submit diagnoses for expert review |
| `expert` | Access to expert dashboard, can review diagnosis submissions |
| `moderator` | Can delete posts and comments across the platform |
| `admin` | Full access including user role management and verification |

---

## Security

| Item | Status |
|---|---|
| `.env.local` | Gitignored — contains all API keys |
| `service-account.json` | Gitignored — Firebase Admin private key |
| `src/firebase/config.ts` | Gitignored — reads from environment variables |
| Server actions | Use Firebase Admin SDK — bypass client auth, run server-side only |
| Firestore rules | Enforce per-collection access control on all client-side reads/writes |
| API keys | Never hardcoded in source — all loaded from environment variables |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code passes `npm run lint` and `npm run typecheck` before submitting.

---

## License

This project is developed as part of a Software Engineering academic project.
