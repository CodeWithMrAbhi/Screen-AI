"""
database.py — ScreenAI
All MySQL logic lives here. main.py just calls these functions.
"""

# ─────────────────────────────────────────
# IMPORTS
# ─────────────────────────────────────────
import mysql.connector
from mysql.connector import Error

# ─────────────────────────────────────────
# CONFIG  ← change these values
# ─────────────────────────────────────────
DB_CONFIG = {
    "host":               "localhost",
    "user":               "root",
    "password":           "Abhi1234567890",
    "database":           "screenai",
    "connection_timeout": 3
}


# ─────────────────────────────────────────
# HELPER — Get DB connection
# ─────────────────────────────────────────
def get_connection():
    """
    Opens and returns a MySQL connection.
    Raises a clear error if connection fails.
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        raise Exception(f"❌ Could not connect to MySQL: {e}")


# ─────────────────────────────────────────
# SETUP — Create all 3 tables if not exist
# ─────────────────────────────────────────
def setup_tables():
    """
    Run this once on app startup.
    Safely creates tables only if they don't exist.
    """
    conn   = get_connection()
    cursor = conn.cursor()

    # TABLE 1 — resumes
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            filename       VARCHAR(255)      NOT NULL,
            extracted_text LONGTEXT,
            uploaded_at    DATETIME          DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # TABLE 2 — job_descriptions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_descriptions (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            jd_text    LONGTEXT             NOT NULL,
            created_at DATETIME             DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # TABLE 3 — results
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS results (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            resume_id      INT,
            jd_id          INT,
            rank_position  INT,
            score          FLOAT,
            reason         TEXT,
            matched_skills TEXT,
            missing_skills TEXT,
            saved_at       DATETIME          DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (resume_id) REFERENCES resumes(id)          ON DELETE CASCADE,
            FOREIGN KEY (jd_id)     REFERENCES job_descriptions(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ All tables created / verified successfully.")


# ─────────────────────────────────────────
# INSERT — Save one resume, return its ID
# ─────────────────────────────────────────
def insert_resume(filename: str, extracted_text: str) -> int:
    """
    Saves one CV's filename + extracted text to DB.
    Returns the new row ID.
    """
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO resumes (filename, extracted_text) VALUES (%s, %s)",
        (filename, extracted_text)
    )

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    print(f"📄 Resume saved → ID {new_id} | File: {filename}")
    return new_id


# ─────────────────────────────────────────
# INSERT — Save job description, return ID
# ─────────────────────────────────────────
def insert_job_description(jd_text: str) -> int:
    """
    Saves the job description text to DB.
    Returns the new row ID.
    """
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO job_descriptions (jd_text) VALUES (%s)",
        (jd_text,)
    )

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    print(f"📋 Job description saved → ID {new_id}")
    return new_id


# ─────────────────────────────────────────
# INSERT — Save one AI result row
# ─────────────────────────────────────────
def insert_result(resume_id: int, jd_id: int, result: dict):
    """
    Saves one ranked result to DB.
    result dict must have: rank, score, reason, matched_skills, missing_skills
    """
    conn   = get_connection()
    cursor = conn.cursor()

    matched = ", ".join(result.get("matched_skills", []))
    missing = ", ".join(result.get("missing_skills", []))

    cursor.execute(
        """INSERT INTO results
           (resume_id, jd_id, rank_position, score, reason, matched_skills, missing_skills)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (
            resume_id,
            jd_id,
            result.get("rank"),
            result.get("score"),
            result.get("reason"),
            matched,
            missing
        )
    )

    conn.commit()
    cursor.close()
    conn.close()

    print(f"✅ Result saved → Rank #{result.get('rank')} | Score: {result.get('score')}/10")


# ─────────────────────────────────────────
# SELECT — Get all results for a JD
# ─────────────────────────────────────────
def get_results_by_jd(jd_id: int) -> list:
    """
    Fetches all ranked results for a given job description ID.
    Returns a list of dicts.
    """
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            r.filename,
            res.rank_position,
            res.score,
            res.reason,
            res.matched_skills,
            res.missing_skills,
            res.saved_at
        FROM results res
        JOIN resumes r ON r.id = res.resume_id
        WHERE res.jd_id = %s
        ORDER BY res.rank_position ASC
    """, (jd_id,))

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return rows


# ─────────────────────────────────────────
# SELECT — Get all past job descriptions
# ─────────────────────────────────────────
def get_all_jds() -> list:
    """
    Returns all saved job descriptions.
    Useful for history feature later.
    """
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, LEFT(jd_text, 100) AS preview, created_at FROM job_descriptions ORDER BY created_at DESC"
    )

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return rows


# ─────────────────────────────────────────
# DELETE — Clear all data (for testing only)
# ─────────────────────────────────────────
def clear_all_data():
    """
    Deletes all rows from all 3 tables.
    USE ONLY DURING TESTING — not in production.
    """
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM results")
    cursor.execute("DELETE FROM resumes")
    cursor.execute("DELETE FROM job_descriptions")

    conn.commit()
    cursor.close()
    conn.close()

    print("🗑️  All data cleared from database.")