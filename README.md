# ⚡ SCREEN AI
### *Reinventing Hiring with Artificial Intelligence*

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered-blueviolet?style=for-the-badge">
  <img src="https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge">
  <img src="https://img.shields.io/badge/Render-Cloud-blue?style=for-the-badge">
</p>

---

# 🧠 What is ScreenAI?

**ScreenAI** is a next-generation AI-powered Resume Screening Platform that intelligently analyzes resumes against job descriptions using Large Language Models (LLMs).

Instead of manually reviewing hundreds of resumes, recruiters can now:
- upload resumes
- paste a job description
- instantly get AI-ranked candidates

⚡ Faster Hiring  
⚡ Smarter Screening  
⚡ Better Talent Discovery  

---

# 🎯 The Problem

Recruiters spend:
- hours screening resumes
- manually matching skills
- filtering irrelevant candidates

Traditional ATS systems:
❌ miss talented candidates  
❌ rely only on keywords  
❌ lack contextual understanding  

---

# 🚀 The Solution

ScreenAI uses AI + NLP + LLM intelligence to:

✅ Understand resumes semantically  
✅ Match skills intelligently  
✅ Rank candidates automatically  
✅ Reduce hiring time drastically  
✅ Improve hiring accuracy  

---

# 🔥 Key Features

## 🤖 AI Resume Ranking
Advanced LLMs analyze candidate-job relevance intelligently.

---

## 📄 Smart PDF Parsing
Extracts structured information from resumes automatically.

---

## 🎯 Job Description Matching
Compares candidate profiles with recruiter requirements.

---

## ⚡ Lightning Fast Screening
Get ranked candidates within seconds.

---

## 🌐 Fully Deployed Cloud Platform
- Frontend → Vercel
- Backend → Render

---

## 🔒 Secure Architecture
Uses:
- `.env`
- `.gitignore`
- secure API management

---

# 🛠️ Tech Stack

<table>
<tr>
<td><b>Frontend</b></td>
<td>HTML, CSS, JavaScript</td>
</tr>

<tr>
<td><b>Backend</b></td>
<td>FastAPI, Python</td>
</tr>

<tr>
<td><b>AI Engine</b></td>
<td>Groq LLM API</td>
</tr>

<tr>
<td><b>Resume Processing</b></td>
<td>PyMuPDF, pdfplumber</td>
</tr>

<tr>
<td><b>Database</b></td>
<td>MySQL</td>
</tr>

<tr>
<td><b>Deployment</b></td>
<td>Render + Vercel</td>
</tr>
</table>

---

# 🧩 System Architecture

```text
                 ┌────────────────┐
                 │   Frontend     │
                 │ HTML/CSS/JS    │
                 └──────┬─────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ FastAPI Backend │
               └──────┬──────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼                           ▼
┌────────────────┐       ┌────────────────┐
│ Resume Parsing │       │   Groq LLM AI  │
│ PyMuPDF        │       │ Candidate Rank │
└────────────────┘       └────────────────┘
```

---

# 📂 Project Structure

```bash
Screen-AI/
│
├── backend/
│   ├── main.py
│   ├── ai.py
│   ├── extractor.py
│   ├── database.py
│   ├── requirements.txt
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   └── New Frame/
│       ├── index.html
│       ├── styles.css
│       └── script.js
│
└── README.md
```

---

# ⚙️ Installation Guide

# 1️⃣ Clone Repository

```bash
git clone https://github.com/CodeWithMrAbhi/Screen-AI.git
cd Screen-AI
```

---

# 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 3️⃣ Configure Environment Variables

Create `.env`

```env
GROQ_API_KEY=your_api_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=screenai
```

---

# 4️⃣ Run Backend

```bash
uvicorn main:app --reload
```

---

# 5️⃣ Launch Frontend

Open:

```bash
index.html
```

---

# 🌍 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |

---

# 📸 Preview

> Add screenshots of your UI here

Example:
- Homepage
- Resume upload page
- AI ranking results

---

# 🧠 AI Workflow

```text
Resume Upload
      ↓
PDF Extraction
      ↓
Text Processing
      ↓
LLM Analysis
      ↓
JD Matching
      ↓
Candidate Ranking
      ↓
Final Results
```

---

# 🚀 Future Roadmap

- ✅ AI Resume Ranking
- 🔜 Recruiter Dashboard
- 🔜 Authentication System
- 🔜 Interview Recommendation AI
- 🔜 ATS Score Generator
- 🔜 Resume Improvement Suggestions
- 🔜 Email Reports
- 🔜 Cloud Database
- 🔜 Multi-company Support

---

# 💡 Why ScreenAI is Different?

Unlike traditional ATS systems, ScreenAI:
- understands context
- analyzes semantic relevance
- performs intelligent matching
- uses real AI reasoning

This makes hiring:
⚡ faster  
⚡ smarter  
⚡ more accurate  

---

# 👨‍💻 Developer

## Abhishek Choudhary
B.Tech CSE Student  
AI & Full Stack Developer  
Passionate about building impactful AI products.

---

# 🤝 Contributing

Contributions are welcome!

```bash
Fork → Clone → Improve → Pull Request 🚀
```

---

# ⭐ Show Your Support

If you liked this project:

🌟 Star the repository  
🍴 Fork the project  
📢 Share with others  

---

# 📜 License

MIT License © 2026

---

# ⚡ Final Vision

> “The future of hiring is not manual filtering.  
> The future of hiring is intelligent AI-powered decision making.”

**SCREEN AI** aims to revolutionize recruitment through Artificial Intelligence.
