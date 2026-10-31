"""
build_playbook_pdf.py: Headless Vector PDF Compiler for the
'Capital Infrastructure & Plant Reliability Playbook' by Amaresh Das, PMP®.
Uses Google Chrome or Microsoft Edge to generate an A4 vector PDF with print styles.
"""

import os
import sys
import subprocess
import shutil

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(BASE_DIR, "industrial_capital_projects_playbook.html")
PDF_PATH = os.path.join(BASE_DIR, "industrial_capital_projects_playbook.pdf")
PM_PDF_PATH = "d:/PM/06_Conversion_and_Engagement_Infrastructure/industrial_capital_projects_playbook.pdf"

def find_browser_executable():
    paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def compile_pdf():
    browser = find_browser_executable()
    if not browser:
        print("[ERROR] Neither Chrome nor Edge executable was found.")
        return False

    print(f"Using browser: {browser}")
    print(f"Compiling HTML -> PDF...")
    print(f"Source: {HTML_PATH}")
    print(f"Target: {PDF_PATH}")

    file_url = f"file:///{HTML_PATH.replace(os.sep, '/')}"

    cmd = [
        browser,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_PATH}",
        file_url
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(PDF_PATH) and os.path.getsize(PDF_PATH) > 10000:
        size_kb = os.path.getsize(PDF_PATH) / 1024
        print(f"SUCCESS: Compiled vector PDF! File size: {size_kb:.1f} KB")

        # Copy to PM directory
        os.makedirs(os.path.dirname(PM_PDF_PATH), exist_ok=True)
        shutil.copy2(PDF_PATH, PM_PDF_PATH)
        print(f"Copied to PM Workspace: {PM_PDF_PATH}")
        return True
    else:
        print(f"FAILED to compile PDF. Output: {res.stdout}\nStderr: {res.stderr}")
        return False

if __name__ == "__main__":
    compile_pdf()
