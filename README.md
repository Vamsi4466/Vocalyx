# Vocalyx

**Vocalyx** is an AI-powered voice interaction platform that transforms static documents into **real-time conversational experiences**.

Instead of reading PDFs traditionally, Vocalyx allows users to **talk to their documents using natural voice conversations**, powered by modern speech synthesis and AI-driven dialogue systems.

The platform extracts structured knowledge from uploaded documents and enables users to interact with that knowledge through **live voice sessions**, creating a more natural and immersive way to explore information.

---

## Problem

Large documents such as books, research papers, or manuals are often difficult to navigate.

Traditional reading workflows require users to:

- Manually skim through pages
- Search for keywords
- Read long passages to find answers

This process becomes inefficient when users only need **specific information quickly**.

---

## Solution

Vocalyx converts documents into **interactive voice assistants**.

Users can upload a document and immediately begin **speaking with it**, asking questions and receiving spoken responses.

This transforms static content into a **dynamic conversational interface**, enabling faster knowledge discovery and a more engaging user experience.

---

## Key Features

### Real-Time Voice Conversations
Start live voice sessions and interact naturally with AI using speech.

### AI-Powered Document Understanding
Uploaded PDFs are parsed and converted into structured text segments that power contextual responses.

### Drag & Drop Upload
Drag and drop PDFs to upload instantly, with a responsive UI that supports multi-step upload flows.

### Persona-Based Voice Responses
AI responses are synthesized with customizable voices using modern speech synthesis systems.

### Secure Authentication
Users authenticate securely before accessing their personal document library.

### Personal Knowledge Library
Upload and manage multiple documents, creating a searchable conversational knowledge base.

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Shadcn UI

### Backend / Infrastructure
- Appwrite (Authentication, Database, Storage)
- Vapi (Voice AI sessions)
- ElevenLabs (Voice synthesis)

### Document Processing
- PDF text extraction
- Segment indexing for conversational retrieval

---

## Architecture Overview

The platform follows a modern **serverless full-stack architecture**:

1. Users upload PDF documents.
2. The system extracts and processes text into structured segments.
3. A conversational AI model retrieves relevant content based on voice queries.
4. Responses are synthesized into natural speech and streamed back to the user.

This architecture enables **low-latency real-time conversations** while remaining scalable.

---


---

## Screenshots

### Home / Landing Page

![Home](<screenshots/home page.png>)

### Authentication

![Sign In](<screenshots/sign-in page(Vocalyx).png>)

![Sign Up](<screenshots/sign-up page(vocalyx).png>)

![Mobile Auth](<screenshots/mobile view auth page.png>)

### Upload Flow (Drag & Drop)

> Note: When a screen is long, it is split into Part 1 and Part 2.

![Upload Step 1](<screenshots/book upload page1(vocalyx).png>)

![Upload Step 2](<screenshots/book upload page2 (vocalyx).png>)

### Voice Conversation (split view)

> Note: Pages with a “1/2” suffix indicate the same screen split into two parts.

![Voice Conversation](<screenshots/Ai book conversation page1 (vocalyx).png>)

![Voice Conversation 2](<screenshots/Ai conversation page 2 (vocalyx).png>)

### Dialog Modals

![Rename Dialog](<screenshots/rename dialog(vocalyx).png>)

![Delete Dialog](<screenshots/delete dialog(vocalyx).png>)

![Rename + Delete Dialog](<screenshots/rename, delet dialog(vocalyx).png>)

---

## Local Development

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file at the project root with:

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT=
NEXT_APPWRITE_KEY=
NEXT_PUBLIC_APPWRITE_DATABASE=
NEXT_PUBLIC_APPWRITE_USER_COLLECTION=
NEXT_PUBLIC_APPWRITE_BOOK_COLLECTION=
NEXT_PUBLIC_APPWRITE_SEGMENT_COLLECTION=
NEXT_PUBLIC_APPWRITE_SESSION_COLLECTION=
NEXT_PUBLIC_APPWRITE_BUCKET=

# vapi
NEXT_PUBLIC_ASSISTANT_ID=
NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_ELEVENLABS_API_KEY=
```
### Run the development server

```bash
npm run dev
```

Open:

http://localhost:3000

## Deployment

The application can be deployed on platforms such as Vercel, Netlify, or AWS. Make sure environment variables are configured in the deployment platform.

## Future Improvements

- Admin dashboard for document analytics
- Multi-language voice support

Author

Vamsikrishna Setty
Frontend / Full Stack Developer

LinkedIn: https://www.linkedin.com/in/vamsikrishna-setty-b266a238a/
