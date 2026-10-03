# StudyMate AI

> Your notes. Your tutor. Your next breakthrough.

StudyMate AI is a personalized study workspace that turns lecture PDFs and course notes into an interactive, grounded learning experience.

Upload your study material, ask questions, learn concepts step by step, test yourself, identify weak topics, build a revision plan, and generate a last-minute exam rescue sheet — all from the material you provide.

## 🚀 Live Demo

**Web app:** https://studymateai-fea9.onrender.com/

## ✨ What StudyMate AI Does

### 📚 Upload Your Course Material
Upload lecture PDFs and notes into your private workspace.

StudyMate:
- extracts text page by page
- splits content into study chunks
- creates searchable representations of the chunks
- keeps document and page metadata for source references

### 💬 Study Chat
Ask questions about your uploaded material.

Choose a response style based on how you want to study:
- **Quick** — concise explanations
- **2-Mark** — short exam-ready answers
- **5-Mark** — structured exam answers
- **10-Mark** — detailed answers
- **Teach Me** — concept-focused learning

Responses are grounded in retrieved sections of the student's uploaded material and can include document and page references.

### 🧠 Teach Me
Learn a difficult topic through a structured explanation with:
- intuition
- concept explanation
- example
- important points
- common mistakes
- a quick knowledge check

### 📝 Generate Quizzes
Generate multiple-choice questions from uploaded lecture material.

After submitting a quiz, StudyMate AI calculates performance and identifies topics associated with missed questions.

### 📊 Track Progress
The progress view uses completed quiz results to show:
- questions answered
- correct answers
- topic accuracy
- missed questions
- areas marked as **Mastered**, **Needs Review**, or **Knowledge Gap**

### 🗓️ Personalized Study Plans
Generate a multi-day revision plan using:
- uploaded course material
- quiz performance
- identified weak topics
- preferred study hours
- exam date
- optional focus areas

Tasks can include concept review, practice quizzes, active recall, and source deep-dives.

### ⚡ Last-Minute Rescue
StudyMate AI's signature pre-exam feature.

Generate a rapid revision sheet containing:
- high-yield definitions
- core formulas and rules
- likely exam questions
- key points to include
- common exam pitfalls

Each generated item is associated with source material and page references.

## 🏗️ How It Works

```text
Lecture PDFs
    ↓
Page-level text extraction
    ↓
Chunking + tokenization
    ↓
Hybrid retrieval
    ├── feature-hashing similarity
    └── BM25 lexical matching
    ↓
Relevant lecture chunks
    ↓
Gemma-powered generation
    ↓
Answer / Teach / Quiz / Plan / Rescue Sheet
```

The application combines retrieval with generation so the model receives relevant excerpts from the student's own material instead of answering from an unrestricted knowledge base.

## 🔎 Retrieval & Grounding

StudyMate AI currently uses a lightweight hybrid retrieval pipeline implemented directly in the server:

- page-level extraction with **pdfjs-dist**
- overlapping text chunks
- **256-dimensional normalized feature-hashing embeddings**
- lexical token matching with **BM25-style scoring**
- hybrid relevance scoring
- page-level provenance attached to retrieved chunks
- user-scoped document retrieval

The server also includes grounding guards for cases where no documents have been uploaded or no relevant chunks can be retrieved.

## 🤖 AI Model

The primary model is configurable through:

```text
GEMMA_MODEL=gemma-3-27b-it
```

Generation is handled through Google's GenAI SDK.

The generation layer can retry throttled requests and move through a configured fallback model pool when the primary model is unavailable.

For the Hacktoberfest challenge submission, Gemma is intended to be the primary open-weight model used for StudyMate AI's study generation workflows.

## 🔐 Authentication & User Isolation

StudyMate AI uses:
- **JWT** for authentication
- **bcryptjs** for password hashing
- user-scoped document, chat, quiz, progress, plan, and rescue data

The browser stores the JWT session token and sends it to protected API routes using the Authorization header.

## 🗄️ Data Storage

The project supports **MongoDB Atlas** through the MongoDB Node.js driver.

A local JSON-backed store is also included as a development fallback when MongoDB is unavailable.

### Important production note

For a production deployment, MongoDB Atlas should be configured and reachable so persistent application data does not depend on the local filesystem.

## 🎨 Frontend

The frontend is a React + Vite application with a dark cinematic interface.

UI technologies include:
- React
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React

The interface includes animated navigation, page transitions, geometric wipes, and feature-card expansion effects.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Motion | Motion |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Authentication | JWT + bcryptjs |
| AI SDK | Google GenAI |
| Primary Model | Gemma (configurable) |
| PDF Processing | pdfjs-dist |
| Retrieval | Feature Hashing + BM25-style Hybrid Retrieval |
| Database | MongoDB Atlas |
| Deployment | Render |

## 📁 Project Structure

```text
StudyMateAI/
├── src/
│   ├── components/
│   │   ├── DashboardPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── StudyChatPage.tsx
│   │   ├── TeachMePage.tsx
│   │   ├── QuizPage.tsx
│   │   ├── ProgressPage.tsx
│   │   ├── StudyPlanPage.tsx
│   │   ├── LastMinuteRescuePage.tsx
│   │   ├── LandingPage.tsx
│   │   └── ...
│   ├── context/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── server.ts
├── vite.config.ts
├── package.json
└── index.html
```

## ⚙️ Run Locally

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (recommended for persistence)
- Google GenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/saivardhan1245/StudyMateAI.git
cd StudyMateAI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file:

```env
GEMINI_API_KEY=your_api_key
GEMMA_MODEL=gemma-3-27b-it
JWT_SECRET=replace_with_a_secure_random_secret
MONGODB_URI=your_mongodb_atlas_connection_string
NODE_ENV=development
```

Do **not** commit `.env` or any secret keys to GitHub.

### 4. Start the development server

```bash
npm run dev
```

The app runs on:

```text
http://localhost:3000
```

## 🚢 Production Build

Build the frontend:

```bash
npm run build
```

Start the application:

```bash
npm start
```

The Express server serves the Vite production build when `NODE_ENV=production`.

## 🌐 Render Deployment

StudyMate AI is deployed as a Node web service on Render.

Typical settings:

```text
Build Command: npm install && npm run build
Start Command: npm start
```

Required environment variables should be configured in Render's Environment settings rather than committed to the repository.

## 🔌 API Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Documents
- `GET /api/documents`
- `POST /api/documents/upload`
- document/chunk inspection endpoints

### Study
- `GET /api/chat/history`
- `POST /api/chat/ask`
- `GET /api/teach/history`
- `POST /api/teach/explain`

### Quizzes
- `GET /api/quizzes`
- `POST /api/quizzes/generate`
- `POST /api/quizzes/:id/submit`

### Progress
- `GET /api/progress`

### Study Plans
- `GET /api/study-plans`
- `POST /api/study-plans/generate`
- `PATCH /api/study-plans/:planId/tasks/:taskId`

### Last-Minute Rescue
- `GET /api/rescue`
- `POST /api/rescue/generate`

## 💡 Why Open Innovation Matters

StudyMate AI is designed around the idea that useful AI study tools should be more than a generic chat interface.

Open technologies make it possible to:
- choose and configure the model layer
- inspect and control the retrieval pipeline
- keep grounding logic close to the application's data
- adapt the experience to a student's actual syllabus
- build an end-to-end learning workflow instead of a single prompt box

The result is a study assistant where the application controls the learning flow, retrieval, source handling, personalization, and user experience.

## 🏆 Hacktoberfest 2026

StudyMate AI was built for the **Hacktoberfest 2026 DEV Weekend Challenge** under the theme **Build for a Friend**.

The project focuses on a real student problem: turning scattered lecture material into a practical study workflow that helps a student learn, practice, diagnose weak areas, plan revision, and handle last-minute preparation.

## 📌 Current Limitations

This project is actively developed. Current implementation details worth knowing:

- MongoDB support is present, but the application also contains a local JSON fallback.
- The retrieval system is intentionally lightweight and implemented without an external vector database.
- AI generation availability depends on the configured GenAI API and model access.
- PDF extraction works best with text-based PDFs; scanned/image-only PDFs may not produce useful text without OCR.
- Production deployments should use MongoDB Atlas for durable application data.

## 🔒 Security

Never commit:
- `.env`
- API keys
- database passwords
- JWT secrets

Use environment variables locally and in your deployment platform.

## 📄 License

No license has currently been specified for this repository.

## 👤 Author

Built by **Sai Vardhan**.

