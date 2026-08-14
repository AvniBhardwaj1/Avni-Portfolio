from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

W, H = A4
ACCENT = HexColor("#0891b2")
DARK = HexColor("#111827")
GREY = HexColor("#4b5563")

c = canvas.Canvas("/app/frontend/public/Avni_Bhardwaj_Resume.pdf", pagesize=A4)

y = H - 22 * mm

def line(text, x, size=10, color=DARK, font="Helvetica", dy=5.2):
    global y
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, text)
    y -= dy * mm

def section(title):
    global y
    y -= 2 * mm
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(18 * mm, y, title.upper())
    y -= 2 * mm
    c.setStrokeColor(ACCENT)
    c.setLineWidth(0.6)
    c.line(18 * mm, y, W - 18 * mm, y)
    y -= 4.5 * mm

c.setFillColor(DARK)
c.setFont("Helvetica-Bold", 26)
c.drawString(18 * mm, y, "Avni Bhardwaj")
y -= 7 * mm
c.setFillColor(ACCENT)
c.setFont("Helvetica", 12)
c.drawString(18 * mm, y, "Computer Engineering | Data, Cloud & AI")
y -= 6 * mm
c.setFillColor(GREY)
c.setFont("Helvetica", 9)
c.drawString(18 * mm, y, "Indore, Madhya Pradesh  ·  avnibhardwaj01.ab@gmail.com  ·  +91 96913 85721")
y -= 5 * mm
c.drawString(18 * mm, y, "github.com/avnibhardwaj1  ·  linkedin.com/in/avni-bhardwaj10  ·  leetcode.com/u/AvniBhardwaj10")
y -= 8 * mm

section("Experience")
line("Airbus India — Data & AI Engineering Intern", 18 * mm, 10.5, DARK, "Helvetica-Bold", 5.5)
line("Architected FP-BOT, a Dockerized RAG pipeline deployed via Jenkins CI/CD for natural-language", 22 * mm, 9.5, GREY)
line("querying of technical documentation via FastAPI.", 22 * mm, 9.5, GREY)
line("Built AirSimuPy, a Python + PySide6 simulation platform executing block-diagram data pipelines", 22 * mm, 9.5, GREY)
line("on NetworkX graphs with NumPy, via a Hybrid Compiled Architecture.", 22 * mm, 9.5, GREY)
line("Executed mathematical validation of a Python-based Sorting Tool against legacy Fortran solvers.", 22 * mm, 9.5, GREY)

section("Projects")
line("Autonomous AI Research Agent — Pydantic AI × Gemini, daily digests via GitHub Actions", 18 * mm, 9.5, DARK, "Helvetica-Bold", 5.5)
line("Personalized AI Financial Advisor — Agentic RAG (LangChain ReAct), Llama-3 8B fine-tuned via Unsloth", 18 * mm, 9.5, DARK, "Helvetica-Bold", 5.5)
line("MapMyNotes — NLP study companion (Streamlit + Google Gemini) turning text into mind maps", 18 * mm, 9.5, DARK, "Helvetica-Bold", 5.5)
line("Pediatric Bone Age Prediction — DenseNet201 + SE-ResNet50 ensemble for medical diagnostics", 18 * mm, 9.5, DARK, "Helvetica-Bold", 5.5)
line("IoT Actuator Control — Arduino Uno + ESP8266 hardware integration", 18 * mm, 9.5, DARK, "Helvetica-Bold", 5.5)

section("Leadership & Achievements")
for t in [
    "National Finalist — Chaitanya: The Leadership Event, Atharv Ranbhoomi'24, IIM Indore (Team INNOV8, top 20 of 977)",
    "GDSC Lead (2023-24) — Google Developer Student Clubs",
    "Techinnovation 6th Rank Winner — IIT Kanpur (x2: CCTV analytics frontend, top 5 of 25,000; environmental monitor)",
    "Organizing Committee — WittyHacks 4.0, NMIMS Indore",
    "Top 10 — Execute Hackathon, Technxex-Turing Club (AI fashion try-on, TensorFlow + OpenCV)",
    "Winner — GDSC Oracle Challenge 2023",
]:
    line("•  " + t, 18 * mm, 9, GREY, dy=5)

section("Skills")
line("Data Engineering & Cloud:  AWS · Docker · Kubernetes · Kafka · ClickHouse", 18 * mm, 9.5, GREY, dy=5.5)
line("AI & Machine Learning:  PyTorch · LangChain · RAG", 18 * mm, 9.5, GREY, dy=5.5)
line("Backend:  Python · C++ · FastAPI", 18 * mm, 9.5, GREY, dy=5.5)

section("Education")
line("B.Tech, Computer Engineering — NMIMS Indore", 18 * mm, 9.5, DARK, "Helvetica-Bold", 5.5)
line("Languages: English · Hindi · Korean (I)", 18 * mm, 9.5, GREY)

c.setFont("Helvetica-Oblique", 8)
c.setFillColor(GREY)
c.drawString(18 * mm, 14 * mm, '"Today no knowledge, tomorrow master."')
c.save()
print("PDF written")
