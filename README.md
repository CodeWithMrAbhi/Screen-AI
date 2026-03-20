# ScreenAI — AI Resume Screener

Upload 10 CVs. Paste a job description. Get ranked results in seconds.

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?style=flat-square&logo=fastapi)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-orange?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

---

## The Problem

HR teams read dozens of resumes by hand. It takes hours. It is slow and inconsistent.

ScreenAI fixes this. You upload your CVs, paste the job description, and the AI does the rest.

---

## What You Get

- Upload up to 10 PDF resumes at once
- Paste any job description
- AI reads every CV and ranks candidates from best to worst
- Each candidate gets a score out of 10
- Each card shows why the candidate was ranked that way
- Green tags show skills the candidate has from your JD
- Red tags show skills the candidate is missing
- All results save to your MySQL database
- Dark galaxy UI with twinkling stars background

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI |
| AI Engine | Groq API + LLaMA 3.3 70B |
| PDF Reading | pdfplumber |
| Database | MySQL |
| Server | Uvicorn |

---

## Folder Structure

```
ScreenAI/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
└── backend/
    ├── main.py
    ├── ai.py
    ├── database.py
    ├── extractor.py
    └── .env
```

---

## Setup

### What you need before starting

- Python 3.12 or above
- MySQL 8.0
- A free Groq API key from [console.groq.com](https://console.groq.com)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/yourusername/screenai.git
cd screenai
```

---

### Step 2 — Create the database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE screenai;
exit
```

---

### Step 3 — Add your secret keys

Create a `.env` file inside your `backend` folder:

```
GROQ_API_KEY=your_groq_api_key_here
DB_PASSWORD=your_mysql_password
```

---

### Step 4 — Install libraries

```bash
cd backend
pip install fastapi uvicorn pdfplumber groq mysql-connector-python python-multipart
```

---

### Step 5 — Start the backend

```bash
uvicorn main:app --reload
```

You will see this in your terminal:

```
ScreenAI server started successfully!
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

### Step 6 — Open the frontend

Open `frontend/index.html` in your browser. Or run:

```bash
cd frontend
npx live-server .
```

---

## How It Works

```
You upload CVs and paste a job description
        ↓
FastAPI receives the files
        ↓
pdfplumber reads text from each PDF
        ↓
AI extracts required skills from your JD
        ↓
AI checks each CV against those exact skills
        ↓
AI ranks all candidates with scores and reasons
        ↓
Results save to MySQL
        ↓
Your screen shows ranked cards with skill tags
```

---

## API Reference

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/` | Health check |
| POST | `/screen` | Send CVs and JD, get ranked results back |

### Sample Response

```json
{
  "success": true,
  "total": 2,
  "results": [
    {
      "rank": 1,
      "name": "Abhishek Choudhary",
      "filename": "abhishek_cv.pdf",
      "score": 8.5,
      "reason": "Strong background in AI and backend development. Skills align well with the job requirements.",
      "matched_skills": ["Python", "FastAPI", "LLaMA"],
      "missing_skills": ["Docker", "Kubernetes"]
    }
  ]
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your key from console.groq.com |
| `DB_PASSWORD` | Your MySQL root password |

Never push your `.env` file to GitHub. Add it to `.gitignore` before your first commit.

---

## What to Build Next

- [ ] HR login and authentication
- [ ] Export results as a PDF report
- [ ] Email shortlisted candidates automatically
- [ ] History of past screening sessions
- [ ] Support for DOCX files
- [ ] Bulk email to top candidates

---

## Screenshots

Add your screenshots here after uploading them to the repo.

---

## Built By

**Abhishek Choudhary**

Student project built to learn full-stack AI development end to end.
---

## License

MIT License. Use it, change it, build on it.

---

If this project helped you, give it a star on GitHub.
