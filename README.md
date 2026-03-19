<div align="center">

<img src="https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-Enabled-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/Google_Vision_API-Enabled-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" />
<img src="https://img.shields.io/badge/Groq-LLM_Powered-FF6B35?style=for-the-badge" />

<br /><br />

# 🔍 CertVerify

### *OCR-Powered Certificate Verification. Instantly. Accurately.*

**CertVerify** is a full-stack certificate verification system that uses OCR and AI vision models to authenticate academic documents — degrees, marksheets, transcripts, and more. Upload a certificate, and CertVerify extracts text and logos, validates the institution, scores the document's authenticity, and makes it available to recruiters through a dedicated portal.

Built at **IEEE ARCNAE** — Hackathon project by Team **Commit & Chill**.

</div>

---

## 📋 Table of Contents

- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Verification Score Logic](#-verification-score-logic)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## ⚙️ How It Works

```
User uploads certificate (PDF / Image)
        ↓
Frontend sends file to FastAPI OCR backend
        ↓
Backend extracts text + logos via Google Vision API
        ↓
Groq LLM maps extracted data to a structured schema
        ↓
Verification score is calculated (0–100)
        ↓
Results saved to Supabase (Certificates table + Storage bucket)
        ↓
Dashboard shows status badge → Recruiter portal shows verified docs
```

---

## 🏗️ Architecture

The project is split into two independently runnable components:

**`web/` — Next.js Frontend**
Handles user authentication, certificate uploads, dashboard display, and the recruiter portal. Powered by Supabase for auth, file storage, and a PostgreSQL database with Row Level Security.

**`TextExtraction/` — Python FastAPI Backend**
Processes uploaded certificates using Google Vision API for OCR and logo detection. Groq LLM maps the raw extracted text into a structured, searchable data schema. Exposes a single REST endpoint consumed by the frontend.

---

## ✨ Features

### 📄 Certificate Upload & Storage
Users upload degree certificates, marksheets, or any academic document. Files are stored securely in a Supabase `Certificates` storage bucket, linked to the user's profile.

### 🔬 OCR & Logo Extraction
The FastAPI backend processes each document using **Google Vision API** — extracting printed text, detecting institutional logos, and identifying key document fields.

### 🤖 AI-Powered Data Mapping
**Groq** LLM takes raw OCR output and intelligently maps it to a structured schema — extracting fields like institution name, candidate name, degree, grade, and issue date.

### 🏛️ Institution Authenticity Verification
Extracted institution names and logos are cross-referenced to validate authenticity, contributing to the overall verification score.

### 📊 Verification Score & Status Badges
Every certificate receives a score from 0–100, displayed on the dashboard with a clear status badge:

| Badge | Status | Condition |
|---|---|---|
| 🟢 **VERIFIED** | Authentic | Score ≥ 80 |
| 🟡 **PARTIALLY VERIFIED** | Needs review | Score 50–79 |
| 🔴 **FAILED** | Not verified | Score < 50 |

### 🧑‍💼 Recruiter Portal
Verified documents are surfaced on a dedicated recruiter portal, allowing employers to independently view and validate a candidate's credentials.

### 🔐 Secure Authentication & RLS
Full user sign-up and login via Supabase Auth. Row Level Security (RLS) policies in PostgreSQL ensure users can only access their own data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js (TypeScript) + Tailwind CSS |
| **Backend Framework** | Python FastAPI |
| **Database** | Supabase (PostgreSQL) with RLS |
| **Authentication** | Supabase Auth |
| **File Storage** | Supabase Storage Buckets |
| **OCR & Vision** | Google Vision API |
| **LLM / Schema Mapping** | Groq |
| **PDF Processing** | Poppler (`pdf2image`) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Python** v3.10 or higher
- A **Supabase** project (get your URL and anon key from the dashboard)
- **Poppler** installed and `POPPLER_PATH` set in `TextExtraction/text.py`
- A **Google Vision API** key
- A **Groq API** key

---

### Step 1 — Database Setup (Supabase)

1. Open the **SQL Editor** in your Supabase project dashboard.
2. Run all SQL commands from `web/supabase_schema.sql`. This creates:
   - `public.user_profiles` table
   - `public.certificates` table
   - Row Level Security (RLS) policies
3. Go to **Storage** and create a bucket named exactly `Certificates`.
   - A **public** bucket is recommended for local development.
   - For production, use a private bucket and update the frontend to use `createSignedUrl` instead of `getPublicUrl`.

---

### Step 2 — Backend Setup (FastAPI OCR Service)

```bash
cd TextExtraction
pip install -r requirements.txt
python api_server.py
```

The backend API will start at **`http://localhost:8000`**.

> **Windows users:** You can also run `start_server.bat`
> **Linux/Mac users:** You can also run `./start_server.sh`

Make sure `POPPLER_PATH` and your **Google Vision API key** are configured inside `TextExtraction/text.py`, and your **Groq API key** is set in `TextExtraction/beautifyText.py`.

---

### Step 3 — Frontend Setup (Next.js App)

**1. Create a `.env.local` file** in the `web/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OCR_API_URL=http://localhost:8000/api/verify-certificate
```

**2. Install dependencies and start the dev server:**

```bash
cd web
npm install
npm run dev
```

The frontend will be available at **`http://localhost:3000`**.

---

## 🔑 Environment Variables

| Variable | Location | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `web/.env.local` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `web/.env.local` | Your Supabase anon/public key |
| `NEXT_PUBLIC_OCR_API_URL` | `web/.env.local` | FastAPI backend endpoint URL |
| `GOOGLE_VISION_API_KEY` | `TextExtraction/text.py` | Google Cloud Vision API key |
| `GROQ_API_KEY` | `TextExtraction/beautifyText.py` | Groq LLM API key |
| `POPPLER_PATH` | `TextExtraction/text.py` | Path to Poppler binaries for PDF processing |

> ⚠️ Never commit `.env.local` or any file containing API keys to version control.

---

## 📊 Verification Score Logic

Each uploaded certificate is scored from **0 to 100** based on:

- Text completeness and clarity extracted via OCR
- Successful logo detection and institution matching
- Structural integrity of the document (expected fields present)
- Groq schema mapping confidence

The final score maps to one of three statuses displayed on the dashboard:

```
Score ≥ 80  →  🟢 VERIFIED
Score 50–79 →  🟡 PARTIALLY_VERIFIED
Score < 50  →  🔴 FAILED
```

---

## 📁 Project Structure

```
IEEE_ARCNAE_COMMIT_CHILL/
│
├── TextExtraction/                  # Python FastAPI backend
│   ├── api_server.py                # Main FastAPI app & /api/verify-certificate endpoint
│   ├── text.py                      # Google Vision OCR + logo extraction (set POPPLER_PATH here)
│   ├── beautifyText.py              # Groq LLM schema mapping (set GROQ_API_KEY here)
│   ├── requirements.txt             # Python dependencies
│   ├── start_server.bat             # Windows startup script
│   └── start_server.sh              # Linux/Mac startup script
│
└── web/                             # Next.js frontend
    ├── app/                         # Next.js App Router pages
    │   ├── dashboard/               # User dashboard with verification results
    │   ├── recruiter/               # Recruiter portal for viewing verified docs
    │   └── auth/                    # Sign up / login pages
    ├── components/                  # Reusable UI components
    ├── lib/                         # Supabase client, utility functions
    ├── supabase_schema.sql          # Database schema & RLS policies — run this first
    ├── .env.local                   # Environment variables (do NOT commit)
    └── package.json                 # Node dependencies
```

---

## 🔒 Additional Notes

**CORS:** The FastAPI backend must allow requests from `http://localhost:3000`. This is configured in `api_server.py` via FastAPI's `CORSMiddleware`.

**Private Buckets:** If you switch the `Certificates` storage bucket to private in production, update the frontend to generate signed URLs:
```typescript
// Replace getPublicUrl with:
const { data } = await supabase.storage
  .from('Certificates')
  .createSignedUrl(filePath, 3600); // 1-hour expiry
```

**Recruiter Access Control:** Tighten the Supabase RLS policies in `supabase_schema.sql` to control which recruiters can view which certificates in production deployments.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: your feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

<div align="center">

Built with ❤️ at **IEEE ARCNAE Hackathon** by Team **Commit & Chill**

**[⭐ Star this repo](https://github.com/Swaraj1657/IEEE_ARCNAE_COMMIT_CHILL)** if you found it useful!

</div>
