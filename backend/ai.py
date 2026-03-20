"""
ai.py — ScreenAI  |  AI Brain
Builds the prompt, calls Groq LLaMA, parses and returns ranked results.
"""

# ─────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────
import json
import re
from groq import Groq

# ─────────────────────────────────────────
# CONFIG
# Get free key at: console.groq.com
# ─────────────────────────────────────────
GROQ_API_KEY = "YOUR_GROQ_API_KEY"
MODEL        = "llama-3.3-70b-versatile"
MAX_TOKENS   = 4000
TEMPERATURE  = 0.2
MAX_CV_CHARS = 800   # max chars per CV to stay within token limits

# ─────────────────────────────────────────
# GROQ CLIENT
# ─────────────────────────────────────────
client = Groq(api_key=GROQ_API_KEY)


# ─────────────────────────────────────────
# HELPER 1 — Trim CV text safely
# ─────────────────────────────────────────
def trim_cv(text: str, max_chars: int = MAX_CV_CHARS) -> str:
    """
    Cuts CV text to max_chars so we don't exceed Groq token limits.
    """
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n[... trimmed ...]"


# ─────────────────────────────────────────
# HELPER 2 — Build the AI prompt
# ─────────────────────────────────────────
def build_prompt(cv_data: list, jd_text: str) -> str:
    """
    Builds a clear structured prompt for LLaMA.
    cv_data = [{"filename": "john.pdf", "text": "..."}]
    """
    cv_block = ""
    for i, cv in enumerate(cv_data, start=1):
        name = cv["filename"].replace(".pdf", "").replace("_", " ").title()
        cv_block += f"""
--- CV {i} ---
Filename : {cv['filename']}
Name     : {name}
Content  :
{trim_cv(cv['text'])}
"""

    total = len(cv_data)

    prompt = f"""
You are a senior HR recruiter. Analyse each CV INDEPENDENTLY against the job description.

JOB DESCRIPTION:
{jd_text}

CANDIDATE CVs ({total} total):
{cv_block}

STRICT RULES — follow exactly:
- Analyse each CV completely SEPARATELY from others.
- matched_skills = skills this person HAS that are IN the job description.
- missing_skills = skills the job needs that this person DOES NOT have.
- NEVER copy skills from one CV to another candidate's result.
- Each candidate gets ONLY their own skills from their own CV text.
- Do NOT invent skills not mentioned in that candidate's CV.
- Scores must be unique — no two CVs get the same score.

Return ONLY a valid JSON array. No markdown, no extra text.
Each item must have EXACTLY these keys:
  rank           (int   — 1 = best, {total} = worst)
  name           (string — candidate name)
  filename       (string — original filename)
  score          (float  — 0.0 to 10.0)
  reason         (string — 2 clear sentences)
  matched_skills (list   — skills candidate HAS from JD)
  missing_skills (list   — skills candidate is MISSING from JD)

Sorted by rank ascending. All {total} CVs must appear.
"""
    return prompt.strip()


# ─────────────────────────────────────────
# HELPER 3 — Clean AI raw response
# ─────────────────────────────────────────
def clean_response(raw: str) -> str:
    """
    Removes markdown fences AI sometimes adds.
    Extracts only the JSON array part.
    """
    raw   = re.sub(r"```json|```", "", raw).strip()
    start = raw.find("[")
    end   = raw.rfind("]")

    if start == -1 or end == -1:
        raise ValueError("AI did not return a valid JSON array.")

    return raw[start : end + 1].strip()


# ─────────────────────────────────────────
# HELPER 4 — Validate one result item
# ─────────────────────────────────────────
def validate_item(item: dict, index: int) -> dict:
    """
    Makes sure every required key exists.
    Fills safe defaults if AI missed something.
    Prevents KeyError crashes in main.py.
    """
    return {
        "rank":           item.get("rank",           index + 1),
        "name":           item.get("name",           f"Candidate {index + 1}"),
        "filename":       item.get("filename",       "unknown.pdf"),
        "score":          float(item.get("score",    0.0)),
        "reason":         item.get("reason",         "No reason provided."),
        "matched_skills": item.get("matched_skills", []),
        "missing_skills": item.get("missing_skills", [])
    }


# ─────────────────────────────────────────
# MAIN FUNCTION — rank_cvs()
# Call this from main.py
# ─────────────────────────────────────────
def rank_cvs(cv_data: list, jd_text: str) -> list:
    """
    Takes CV data + job description.
    Returns a clean, validated, ranked list of results.

    cv_data format:
    [
        {"filename": "john.pdf", "text": "full extracted text..."},
        {"filename": "jane.pdf", "text": "full extracted text..."},
    ]
    """

    # Step 1 — Build prompt
    prompt = build_prompt(cv_data, jd_text)

    # Step 2 — Call Groq API
    try:
        response = client.chat.completions.create(
            model       = MODEL,
            messages    = [{"role": "user", "content": prompt}],
            temperature = TEMPERATURE,
            max_tokens  = MAX_TOKENS
        )
    except Exception as e:
        raise Exception(f"Groq API call failed: {e}")

    raw_output = response.choices[0].message.content

    # Step 3 — Clean the response
    try:
        clean_json = clean_response(raw_output)
    except ValueError as e:
        raise Exception(f"Could not find JSON in AI response: {e}\nRaw:\n{raw_output[:300]}")

    # Step 4 — Parse JSON
    try:
        parsed = json.loads(clean_json)
    except json.JSONDecodeError as e:
        raise Exception(f"AI returned invalid JSON: {e}\nCleaned:\n{clean_json[:300]}")

    # Step 5 — Validate every item
    validated = [validate_item(item, i) for i, item in enumerate(parsed)]

    # Step 6 — Sort by rank
    validated.sort(key=lambda x: x["rank"])

    print(f"✅ AI ranked {len(validated)} CVs successfully.")
    return validated