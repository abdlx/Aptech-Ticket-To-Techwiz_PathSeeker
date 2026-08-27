"""Generate PathSeeker's original downloadable career-development PDFs.

The files are written to both the repository artifact folder and Vite's public
asset folder. Content is intentionally source-aware and uses US BLS figures only
as reference data, never as a salary guarantee.
"""

from __future__ import annotations

from pathlib import Path
from shutil import copy2

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[3]
ARTIFACT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "Project" / "frontend" / "public" / "assets" / "documents"

PAGE_W, PAGE_H = A4
INK = colors.HexColor("#26352E")
MUTED = colors.HexColor("#68766F")
GREEN = colors.HexColor("#47745A")
GREEN_DARK = colors.HexColor("#31553F")
MINT = colors.HexColor("#EAF2EB")
CREAM = colors.HexColor("#F7F4EC")
GOLD = colors.HexColor("#D9C988")
LAVENDER = colors.HexColor("#EEEAF8")
BLUE = colors.HexColor("#E7EFF6")
LINE = colors.HexColor("#D9E1DC")
WHITE = colors.white


styles = getSampleStyleSheet()
STYLES = {
    "cover_kicker": ParagraphStyle(
        "cover_kicker", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=9, leading=12, textColor=GREEN_DARK, spaceAfter=10,
        uppercase=True, tracking=1.4,
    ),
    "cover_title": ParagraphStyle(
        "cover_title", parent=styles["Title"], fontName="Helvetica-Bold",
        fontSize=31, leading=35, textColor=INK, spaceAfter=14,
    ),
    "cover_subtitle": ParagraphStyle(
        "cover_subtitle", parent=styles["Normal"], fontName="Helvetica",
        fontSize=13, leading=19, textColor=MUTED, spaceAfter=18,
    ),
    "h1": ParagraphStyle(
        "h1", parent=styles["Heading1"], fontName="Helvetica-Bold",
        fontSize=22, leading=27, textColor=INK, spaceAfter=9,
    ),
    "h2": ParagraphStyle(
        "h2", parent=styles["Heading2"], fontName="Helvetica-Bold",
        fontSize=13, leading=17, textColor=GREEN_DARK, spaceBefore=7, spaceAfter=6,
    ),
    "body": ParagraphStyle(
        "body", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=9.5, leading=14, textColor=INK, spaceAfter=7,
    ),
    "small": ParagraphStyle(
        "small", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=7.5, leading=10.5, textColor=MUTED, spaceAfter=4,
    ),
    "label": ParagraphStyle(
        "label", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=7.5, leading=10, textColor=GREEN_DARK, uppercase=True,
        tracking=0.8, spaceAfter=4,
    ),
    "bullet": ParagraphStyle(
        "bullet", parent=styles["BodyText"], fontName="Helvetica",
        fontSize=9, leading=13, textColor=INK, leftIndent=13, firstLineIndent=-8,
        bulletIndent=3, spaceAfter=4,
    ),
    "prompt": ParagraphStyle(
        "prompt", parent=styles["BodyText"], fontName="Helvetica-Bold",
        fontSize=10, leading=14, textColor=INK, spaceAfter=7,
    ),
    "center": ParagraphStyle(
        "center", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=10, leading=14, alignment=TA_CENTER, textColor=GREEN_DARK,
    ),
}


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(text, STYLES[style])


def bullets(items: list[str]) -> list[Paragraph]:
    return [Paragraph(f"- {item}", STYLES["bullet"]) for item in items]


def checkbox_list(items: list[str]) -> Table:
    rows = [[p("[ ]", "body"), p(item, "body")] for item in items]
    table = Table(rows, colWidths=[9 * mm, 155 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TEXTCOLOR", (0, 0), (0, -1), GREEN_DARK),
    ]))
    return table


def lines(count: int = 4, label: str | None = None) -> list:
    result: list = []
    if label:
        result.append(p(label, "prompt"))
    for _ in range(count):
        row = Table([[""]], colWidths=[164 * mm], rowHeights=[8 * mm])
        row.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.55, LINE)]))
        result.append(row)
    return result


def note_box(title: str, text: str, tone=CREAM) -> Table:
    body = [p(title, "label"), p(text, "body")]
    table = Table([[body]], colWidths=[164 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), tone),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return table


def data_table(headers: list[str], rows: list[list[str]], widths: list[float] | None = None) -> Table:
    content = [[p(value, "label") for value in headers]]
    content.extend([[p(value, "small") for value in row] for row in rows])
    table = Table(content, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.55, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, CREAM]),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def source_list(items: list[tuple[str, str, str]]) -> list:
    flow: list = [p("Sources and responsible use", "h2")]
    for label, url, note in items:
        flow.append(Paragraph(
            f'<link href="{url}" color="#31553F"><b>{label}</b></link><br/>{note}<br/>'
            f'<font size="7" color="#68766F">{url}</font>',
            STYLES["body"],
        ))
    flow.append(note_box(
        "Important",
        "Career requirements, salaries, and hiring practices vary by country, city, employer, experience, and economic conditions. Use occupational data as a research starting point, not a promise of employment or pay.",
        LAVENDER,
    ))
    return flow


def cover(title: str, subtitle: str, audience: str, resource_type: str) -> list:
    return [
        Spacer(1, 27 * mm),
        p("PATHSEEKER CAREER PASSPORT", "cover_kicker"),
        p(title, "cover_title"),
        p(subtitle, "cover_subtitle"),
        Spacer(1, 7 * mm),
        note_box("BEST FOR", audience, MINT),
        Spacer(1, 5 * mm),
        note_box("FORMAT", f"{resource_type} - write directly on a printed copy or duplicate the prompts into your notes app.", BLUE),
        Spacer(1, 27 * mm),
        p("Discover what fits you best - then test it with evidence.", "center"),
    ]


def section(title: str, eyebrow: str, intro: str, content: list) -> list:
    return [p(eyebrow.upper(), "label"), p(title, "h1"), p(intro, "body"), Spacer(1, 2 * mm), *content]


def on_page(canvas, doc):
    canvas.saveState()
    page_num = canvas.getPageNumber()
    canvas.setFillColor(GREEN_DARK)
    canvas.rect(0, PAGE_H - 13 * mm, PAGE_W, 13 * mm, stroke=0, fill=1)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.drawString(18 * mm, PAGE_H - 8.5 * mm, "PATHSEEKER")
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(PAGE_W - 18 * mm, PAGE_H - 8.5 * mm, doc.title[:72])
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, PAGE_W - 18 * mm, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(18 * mm, 9 * mm, "Original PathSeeker learning resource")
    canvas.drawRightString(PAGE_W - 18 * mm, 9 * mm, f"Page {page_num}")
    canvas.restoreState()


def build_pdf(filename: str, title: str, pages: list[list]) -> Path:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    artifact = ARTIFACT_DIR / filename
    doc = BaseDocTemplate(
        str(artifact),
        pagesize=A4,
        title=title,
        author="PathSeeker",
        subject="Career exploration and career readiness",
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=21 * mm,
        bottomMargin=18 * mm,
    )
    doc.title = title
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")
    doc.addPageTemplates([PageTemplate(id="pathseeker", frames=[frame], onPage=on_page)])
    story: list = []
    for index, page in enumerate(pages):
        if index:
            story.append(PageBreak())
        story.extend(page)
    doc.build(story)
    copy2(artifact, PUBLIC_DIR / filename)
    return artifact


COMMON_SOURCES = [
    ("U.S. Bureau of Labor Statistics - Occupational Outlook Handbook", "https://www.bls.gov/ooh/", "Occupation duties, education, 2024 pay, and 2024-2034 outlook reference data."),
    ("O*NET OnLine", "https://www.onetonline.org/", "Detailed occupation tasks, knowledge, skills, work activities, and technology examples."),
    ("CareerOneStop", "https://www.careeronestop.org/", "Career exploration, training, job-search, and local salary research tools."),
]


def career_decision_workbook() -> Path:
    pages = [
        cover(
            "Career Decision Workbook",
            "A guided evidence-based process for turning a long list of possibilities into one practical next experiment.",
            "Students, graduates, and professionals comparing two to five career directions.",
            "10-page workbook",
        ),
        section("Start with the decision", "01 - Define", "A useful career decision is specific enough to test. Name what you are deciding, your deadline, and what a good outcome means.", [
            *lines(2, "The decision I need to make is..."),
            *lines(2, "I want to make it by... because..."),
            note_box("Decision rule", "Do not choose a forever identity. Choose the next direction that deserves a low-risk test.", MINT),
            *lines(3, "What would count as a confident decision?"),
        ]),
        section("Values and constraints", "02 - Fit", "Separate preferences from non-negotiable constraints. This prevents an exciting role from winning a comparison it cannot realistically pass.", [
            data_table(["Factor", "Must have", "Nice to have", "Evidence"], [
                ["Income and stability", "", "", ""], ["Location or remote work", "", "", ""],
                ["Schedule and flexibility", "", "", ""], ["Learning and growth", "", "", ""],
                ["Purpose and impact", "", "", ""], ["Health or family needs", "", "", ""],
            ], [38*mm, 39*mm, 39*mm, 48*mm]),
            Spacer(1, 4*mm),
            *lines(3, "The tradeoff I am least willing to make is..."),
        ]),
        section("Run an energy audit", "03 - Patterns", "Look at actual weeks, not your idealized self. Energy patterns reveal the kinds of tasks and environments you can sustain.", [
            data_table(["Recent activity", "Energy before", "Energy after", "Why"], [
                ["", "1 2 3 4 5", "1 2 3 4 5", ""], ["", "1 2 3 4 5", "1 2 3 4 5", ""],
                ["", "1 2 3 4 5", "1 2 3 4 5", ""], ["", "1 2 3 4 5", "1 2 3 4 5", ""],
                ["", "1 2 3 4 5", "1 2 3 4 5", ""],
            ], [53*mm, 32*mm, 32*mm, 47*mm]),
            *lines(3, "Patterns I notice about people, pace, problems, and environment..."),
        ]),
        section("Build a career shortlist", "04 - Options", "Choose three options that are different enough to teach you something. Include one adjacent role that uses skills you already have.", [
            data_table(["Career", "Why it is on the list", "Biggest unknown"], [["Option A", "", ""], ["Option B", "", ""], ["Option C", "", ""]], [38*mm, 66*mm, 60*mm]),
            Spacer(1, 5*mm),
            checkbox_list(["I reviewed real job descriptions.", "I checked entry requirements in my location.", "I spoke to or watched a credible practitioner.", "I can name one task I would do weekly in this role."]),
            *lines(3, "Which option is based most on assumptions?"),
        ]),
        section("Compare evidence, not labels", "05 - Evidence", "Rate each factor from 1 (poor evidence or fit) to 5 (strong evidence or fit). Add a note so the score remains explainable.", [
            data_table(["Criterion", "Option A", "Option B", "Option C"], [
                ["Interest in daily tasks", "", "", ""], ["Current skill overlap", "", "", ""],
                ["Learning time and cost", "", "", ""], ["Local opportunity", "", "", ""],
                ["Income and stability", "", "", ""], ["Work environment fit", "", "", ""],
                ["Values and impact", "", "", ""], ["Evidence quality", "", "", ""],
            ], [62*mm, 34*mm, 34*mm, 34*mm]),
            *lines(2, "What evidence would change the ranking?"),
        ]),
        section("Reality-check the work", "06 - Reality", "Job titles hide variation. Investigate the work, context, and hiring bar for a specific market and employer type.", [
            data_table(["Question", "Option A notes", "Option B notes"], [
                ["What are the three most common tasks?", "", ""], ["What is stressful or repetitive?", "", ""],
                ["What gets measured?", "", ""], ["Which tools are common?", "", ""],
                ["What does entry-level evidence look like?", "", ""], ["What local license or degree is required?", "", ""],
            ], [56*mm, 54*mm, 54*mm]),
            note_box("Ask a practitioner", "What surprised you after joining this field, and what do candidates usually misunderstand about the work?", BLUE),
        ]),
        section("Design three small experiments", "07 - Test", "A good experiment is short, produces evidence, and exposes you to a real task or person from the field.", [
            data_table(["Experiment", "Time box", "Evidence produced", "Success signal"], [
                ["Mini project", "3-8 hours", "Artifact or case note", "I wanted to improve it"],
                ["Career conversation", "20 minutes", "Answers and referrals", "Daily work still fits"],
                ["Job-posting sample", "30 minutes", "Skill frequency list", "Gap feels learnable"],
            ], [37*mm, 28*mm, 48*mm, 51*mm]),
            *lines(4, "My next experiment, first step, and calendar date..."),
        ]),
        section("Make the decision transparent", "08 - Decide", "Use a weighted score only to reveal your reasoning. Never let a total hide a serious constraint or regulated requirement.", [
            data_table(["Criterion", "Weight 1-3", "A score", "B score", "C score"], [
                ["Daily task fit", "", "", "", ""], ["Current evidence", "", "", "", ""],
                ["Opportunity and outlook", "", "", "", ""], ["Time and cost to enter", "", "", "", ""],
                ["Lifestyle and values", "", "", "", ""], ["TOTAL", "", "", "", ""],
            ], [56*mm, 28*mm, 27*mm, 27*mm, 27*mm]),
            *lines(3, "My provisional decision and the evidence behind it..."),
            *lines(2, "The condition that would make me revisit it..."),
        ]),
        section("Commit to a 30-day action plan", "09 - Act", "Convert a decision into scheduled, observable steps. Small completed evidence beats a perfect plan.", [
            data_table(["Week", "Action", "Output", "Support person"], [["1", "", "", ""], ["2", "", "", ""], ["3", "", "", ""], ["4", "", "", ""]], [18*mm, 60*mm, 47*mm, 39*mm]),
            *lines(2, "The first action I will complete in the next 48 hours..."),
            Spacer(1, 4*mm),
            *source_list(COMMON_SOURCES),
        ]),
    ]
    return build_pdf("career-decision-workbook.pdf", "Career Decision Workbook", pages)


def ux_checklist() -> Path:
    pages = [
        cover("UX Interview and Case Study Checklist", "Plan ethical user conversations, synthesize evidence, and present a credible case study without overstating your impact.", "Aspiring UX designers, UX researchers, product designers, and student project teams.", "8-page checklist"),
        section("Frame the research", "01 - Before recruiting", "A strong interview starts with a decision the team needs to make, not a broad request to learn everything about users.", [
            *lines(2, "Decision this research will inform..."), *lines(2, "Target participant and relevant context..."),
            checkbox_list(["The research question is not leading.", "The team agrees what is in and out of scope.", "No sensitive information is required unless necessary and protected.", "Success means learning, not proving our preferred solution."]),
            *lines(2, "What this study cannot conclude..."),
        ]),
        section("Recruit responsibly", "02 - Participants", "Recruit people whose experience matches the question. Convenience alone is not a valid sampling strategy.", [
            data_table(["Criterion", "Include", "Exclude", "Why"], [["Experience", "", "", ""], ["Recent behavior", "", "", ""], ["Device or access", "", "", ""], ["Location or language", "", "", ""]], [35*mm, 42*mm, 42*mm, 45*mm]),
            checkbox_list(["Consent language is plain and voluntary.", "Recording is optional and explained.", "Compensation is fair for time and location.", "Participant contact data has a deletion plan.", "Accessibility or language support is offered."]),
        ]),
        section("Use an interview guide", "03 - Conversation", "Ask about specific past behavior before asking for opinions about a hypothetical future.", [
            data_table(["Phase", "Example prompt", "Minutes"], [
                ["Welcome", "Explain purpose, consent, and no-wrong-answer expectation.", "2"],
                ["Context", "Tell me about the last time you tried to...", "5"],
                ["Journey", "What happened next? What made that difficult?", "12"],
                ["Reflection", "What mattered most in that moment?", "5"],
                ["Close", "What should I have asked? May we follow up?", "3"],
            ], [28*mm, 115*mm, 21*mm]),
            *lines(4, "My five neutral prompts..."),
        ]),
        section("Capture evidence", "04 - During interviews", "Separate what the participant said or did from your interpretation. Capture timestamps if the participant consented to recording.", [
            data_table(["Observation or short quote", "Interpretation", "Confidence", "Follow-up"], [["", "", "Low / Med / High", ""], ["", "", "Low / Med / High", ""], ["", "", "Low / Med / High", ""], ["", "", "Low / Med / High", ""]], [58*mm, 52*mm, 28*mm, 27*mm]),
            note_box("Bias check", "What did I expect to hear, and where might that expectation have shaped my follow-up questions?", LAVENDER),
            *lines(3),
        ]),
        section("Synthesize patterns", "05 - After interviews", "A pattern should be supported by multiple observations or clearly labeled as a single-participant signal.", [
            data_table(["Signal", "Evidence count", "Who it affects", "Design implication"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]], [42*mm, 30*mm, 42*mm, 50*mm]),
            checkbox_list(["Outliers were retained, not silently removed.", "Contradictory evidence is visible.", "Claims distinguish observed behavior from stated preference.", "The team can trace each finding to notes.", "Personal identifiers were removed from the share-out."]),
        ]),
        section("Build the case-study story", "06 - Portfolio", "Show the decisions you influenced and the evidence behind them. Avoid presenting a team outcome as your individual work.", [
            data_table(["Section", "What a reviewer needs"], [
                ["Context", "User, problem, constraints, timeline, team, and your role."],
                ["Question", "The decision and uncertainty the research addressed."],
                ["Method", "Why this sample and method were appropriate; limitations."],
                ["Evidence", "Key observations, patterns, contradictions, and artifacts."],
                ["Decision", "What changed because of the evidence and why."],
                ["Outcome", "Measured result if available; otherwise the next validation step."],
                ["Reflection", "What you would repeat, change, or investigate next."],
            ], [36*mm, 128*mm]),
            *lines(3, "The one-sentence case-study takeaway..."),
        ]),
        section("Final quality gate", "07 - Review", "Run this check before publishing or presenting your project.", [
            checkbox_list(["Participant privacy is protected.", "My role and collaborators are named accurately.", "The case study explains constraints and tradeoffs.", "Every important claim has evidence.", "Screens have meaningful alt text or descriptions.", "Text contrast and type size are readable.", "The page works by keyboard.", "No client-confidential material is exposed.", "The next learning question is explicit."]),
            Spacer(1, 4*mm),
            *source_list(COMMON_SOURCES + [("W3C Web Accessibility Initiative", "https://www.w3.org/WAI/", "Accessibility principles, standards, tutorials, and evaluation guidance.")]),
        ]),
    ]
    return build_pdf("ux-interview-checklist.pdf", "UX Interview and Case Study Checklist", pages)


def data_roadmap() -> Path:
    pages = [
        cover("Junior Data Analyst 90-Day Roadmap", "A project-first plan for building spreadsheet, SQL, visualization, statistics, and communication evidence in twelve focused weeks.", "Students, graduates, and career changers targeting junior data analyst or business intelligence roles.", "9-page roadmap"),
        section("Set your baseline", "01 - Week 0", "Start with a target job sample and a diagnostic. The goal is not to learn every tool; it is to build evidence for a realistic entry role.", [
            checkbox_list(["Collect 10 relevant job descriptions.", "Count repeated skills and tools.", "Choose one spreadsheet tool, one SQL environment, and one visualization tool.", "Create a public or private project folder with a README.", "Schedule five 6-8 hour learning weeks."]),
            data_table(["Skill", "Current 1-5", "Target evidence by day 90"], [["Spreadsheets", "", "Clean and summarize a messy dataset"], ["SQL", "", "Answer business questions with joins and aggregation"], ["Visualization", "", "Create a focused dashboard or report"], ["Statistics", "", "Explain variation and uncertainty responsibly"], ["Communication", "", "Present a recommendation and limitations"]], [42*mm, 32*mm, 90*mm]),
        ]),
        section("Weeks 1-2: spreadsheet analysis", "02 - Foundations", "Use a public dataset with clear column definitions. Keep an untouched raw copy and document every transformation.", [
            checkbox_list(["Import and profile the data.", "Fix types, duplicates, missing values, and inconsistent categories.", "Use lookup, conditional, date, and aggregation functions.", "Create a pivot table that answers one stakeholder question.", "Build a one-page findings sheet with a caveat."]),
            *lines(3, "Dataset, stakeholder question, and definition of done..."),
            note_box("Evidence", "Save the cleaned file, a data dictionary, before/after quality notes, and a one-page summary.", MINT),
        ]),
        section("Weeks 3-4: SQL", "03 - Query", "Practice on a relational dataset and treat query readability as part of the deliverable.", [
            data_table(["Capability", "Practice task", "Done"], [["Filtering", "WHERE, CASE, dates, and null handling", "[ ]"], ["Aggregation", "GROUP BY, HAVING, rates, and distinct counts", "[ ]"], ["Joins", "Explain row grain before and after each join", "[ ]"], ["Window functions", "Rank, running total, and period comparison", "[ ]"], ["Validation", "Reconcile counts and investigate surprising results", "[ ]"]], [42*mm, 96*mm, 26*mm]),
            *lines(3, "Five questions my SQL project will answer..."),
            note_box("Portfolio signal", "Include commented queries and a short explanation of how you validated the result.", BLUE),
        ]),
        section("Weeks 5-6: statistics and metrics", "04 - Reason", "Use descriptive statistics to understand the data before making recommendations. Do not imply causation from correlation.", [
            checkbox_list(["Define each metric and its grain.", "Compare mean and median where skew matters.", "Inspect distributions and outliers.", "Use rates with clear denominators.", "Segment carefully and check sample sizes.", "State at least two limitations."]),
            data_table(["Metric", "Definition", "Business meaning", "Risk of misuse"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]], [34*mm, 48*mm, 44*mm, 38*mm]),
        ]),
        section("Weeks 7-8: visualization", "05 - Explain", "Every chart should help a named audience answer a question or make a decision.", [
            checkbox_list(["Use an accurate chart type.", "Write a takeaway title instead of a topic title.", "Label units, timeframe, and source.", "Use color to focus attention, not decorate.", "Check contrast and avoid relying on color alone.", "Include context, comparison, and caveats."]),
            *lines(4, "Dashboard audience, decision, three key views, and one action..."),
        ]),
        section("Weeks 9-10: Python or automation", "06 - Extend", "Add Python only if it appears in your target roles or helps make the workflow repeatable.", [
            data_table(["Step", "Minimum outcome"], [["Load", "Read data with a reproducible relative path"], ["Clean", "Create functions for repeated transformations"], ["Validate", "Assert expected columns, types, and ranges"], ["Analyze", "Produce a summary table used in the final report"], ["Export", "Write a clean dataset or figure without manual edits"]], [38*mm, 126*mm]),
            *lines(3, "The manual step I will automate and why..."),
            note_box("Skip safely", "A strong SQL and spreadsheet project is better than a copied Python notebook you cannot explain.", LAVENDER),
        ]),
        section("Weeks 11-12: capstone", "07 - Integrate", "Build one small end-to-end analysis around a real decision. Keep the scope narrow enough to finish and revise.", [
            data_table(["Artifact", "Quality gate"], [["README", "Question, audience, data source, approach, finding, limitation"], ["Data dictionary", "Field definitions, units, grain, and important nulls"], ["SQL or notebook", "Readable, validated, and runnable from a clean start"], ["Dashboard or report", "Focused story with accessible labels"], ["Five-minute presentation", "Recommendation, evidence, caveat, next step"]], [45*mm, 119*mm]),
            *lines(3, "Capstone question and intended audience..."),
        ]),
        section("Track progress and apply", "08 - Day 90", "Review evidence weekly and start conversations before the portfolio feels perfect.", [
            data_table(["Week", "Hours", "Artifact shipped", "Feedback received", "Next change"], [[str(i), "", "", "", ""] for i in range(1, 13)], [16*mm, 19*mm, 47*mm, 42*mm, 40*mm]),
            Spacer(1, 3*mm),
            *source_list(COMMON_SOURCES + [("BLS - Operations Research Analysts", "https://www.bls.gov/ooh/math/operations-research-analysts.htm", "A closely related analytical occupation: 2024 median pay and 2024-2034 outlook reference data.")]),
        ]),
    ]
    return build_pdf("data-analyst-roadmap.pdf", "Junior Data Analyst 90-Day Roadmap", pages)


def portfolio_guide() -> Path:
    pages = [
        cover("High-Impact Portfolio Guide for Tech and Design", "Turn projects into concise evidence of how you frame problems, make decisions, collaborate, and improve outcomes.", "Designers, developers, analysts, and career changers building an early-career portfolio.", "9-page guide and review checklist"),
        section("Design for a real reviewer", "01 - Purpose", "A portfolio is an evidence interface. Decide what role it supports and what a busy reviewer should remember after two minutes.", [
            *lines(2, "Target role and market..."), *lines(2, "Three capabilities I need to prove..."),
            data_table(["Reviewer question", "Where my portfolio answers it"], [["Can this person solve our kind of problem?", ""], ["Can they explain decisions?", ""], ["Can they finish and learn?", ""], ["Can they collaborate responsibly?", ""]], [72*mm, 92*mm]),
        ]),
        section("Choose fewer, stronger projects", "02 - Select", "Two or three deep projects usually communicate more than a gallery of unfinished exercises.", [
            data_table(["Candidate project", "Relevant skill", "Evidence strength 1-5", "Gap"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]], [50*mm, 47*mm, 34*mm, 33*mm]),
            checkbox_list(["The problem is understandable without insider knowledge.", "My contribution is distinct from the team's work.", "I can show decisions, not just a final screen or codebase.", "The project includes constraints or tradeoffs.", "I can discuss what changed after feedback."]),
        ]),
        section("Use a case-study spine", "03 - Story", "Make the sequence easy to scan. Put the most important evidence close to the claim it supports.", [
            data_table(["Section", "One-sentence job"], [["Snapshot", "Problem, outcome, timeframe, team, and my role"], ["Context", "Who was affected and why the problem mattered"], ["Constraints", "Time, data, policy, technology, or access limits"], ["Process", "Only the steps that changed a decision"], ["Evidence", "Research, tests, metrics, code, or analysis"], ["Outcome", "Measured result or the honest next validation step"], ["Reflection", "What I would do differently and why"]], [34*mm, 130*mm]),
            *lines(3, "My case study in one sentence..."),
        ]),
        section("Show decisions and tradeoffs", "04 - Reasoning", "Artifacts matter when you explain what they helped you decide.", [
            data_table(["Decision", "Options considered", "Evidence", "Tradeoff"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""]], [38*mm, 46*mm, 42*mm, 38*mm]),
            checkbox_list(["I explain why an option was rejected.", "I distinguish assumptions from validated findings.", "I name uncertainty and limitations.", "I credit collaborators and sources.", "I avoid claiming impact I cannot verify."]),
        ]),
        section("Make impact credible", "05 - Outcomes", "Use the strongest evidence available and label its quality. A learning result can be honest and valuable even without business metrics.", [
            data_table(["Evidence level", "Example"], [["Measured outcome", "Task completion improved from a tested baseline"], ["Behavior signal", "Users completed the key flow in a moderated test"], ["Delivery evidence", "Feature shipped with tests and documentation"], ["Stakeholder decision", "Analysis changed scope or priority"], ["Learning evidence", "Experiment invalidated an assumption and informed the next step"]], [42*mm, 122*mm]),
            *lines(4, "My strongest outcome claim, its source, and its limitation..."),
        ]),
        section("Build an accessible experience", "06 - Presentation", "A polished portfolio respects readers using keyboards, zoom, screen readers, low-bandwidth devices, and small screens.", [
            checkbox_list(["Pages use one descriptive H1 and logical headings.", "Images have useful alt text or are marked decorative.", "Color contrast is sufficient and color is not the only signal.", "Focus states are visible and order is logical.", "Links describe their destination.", "Video has captions or a transcript.", "Text remains usable at 200% zoom.", "Large media is optimized and lazy-loaded.", "A PDF resume remains selectable text."]),
            note_box("Test", "Navigate the entire portfolio with only Tab, Shift+Tab, Enter, and Escape. Then test at a narrow mobile width.", BLUE),
        ]),
        section("Technical portfolio signals", "07 - For developers and analysts", "A repository should help another person understand, run, and evaluate the work safely.", [
            checkbox_list(["README states the problem and target user.", "Setup steps work from a clean clone.", "Secrets and personal data are excluded.", "Sample environment variables are documented.", "Architecture choices and tradeoffs are explained.", "Tests cover the most important behavior.", "Known limitations are honest.", "Screenshots or a live demo show the result.", "Commit history or changelog shows iteration."]),
            *lines(3, "The technical decision I am most ready to defend..."),
        ]),
        section("Publish and improve", "08 - Final gate", "Ask reviewers to evaluate specific capabilities, not whether they generally like the portfolio.", [
            data_table(["Review", "Question", "Change"], [["Role relevance", "Which capability is clearest or missing?", ""], ["Story clarity", "Where did you lose the thread?", ""], ["Evidence", "Which claim needs stronger support?", ""], ["Usability", "What was hard to find or use?", ""], ["Credibility", "What would you ask in an interview?", ""]], [38*mm, 78*mm, 48*mm]),
            Spacer(1, 3*mm),
            *source_list(COMMON_SOURCES + [("W3C Web Accessibility Initiative", "https://www.w3.org/WAI/", "Accessibility standards, tutorials, and evaluation techniques.")]),
        ]),
    ]
    return build_pdf("portfolio-guide.pdf", "High-Impact Portfolio Guide for Tech and Design", pages)


def skills_gap_template() -> Path:
    pages = [
        cover("Skills Gap Analysis and Practice Template", "Translate a target role into evidence you already have, gaps that matter, and deliberate practice you can schedule.", "Any explorer preparing for a specific role, internship, promotion, or career transition.", "7-page reusable template"),
        section("Define the target role", "01 - Scope", "Analyze one role family and market at a time. Similar titles can have very different expectations.", [
            *lines(2, "Target title, location or remote market, and employer type..."),
            *lines(2, "Ten job descriptions sampled and date collected..."),
            data_table(["Repeated requirement", "Frequency / 10", "Entry evidence expected"], [["", "", ""], ["", "", ""], ["", "", ""], ["", "", ""], ["", "", ""]], [60*mm, 34*mm, 70*mm]),
        ]),
        section("Rate skill and evidence separately", "02 - Baseline", "Confidence is not evidence. Rate current ability and proof as separate dimensions.", [
            data_table(["Skill", "Importance 1-3", "Ability 1-5", "Evidence 0-3", "Required"], [["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]], [45*mm, 28*mm, 28*mm, 28*mm, 35*mm]),
            note_box("Evidence scale", "0 = none; 1 = practice exercise; 2 = completed project; 3 = reviewed work used by someone or measured against a standard.", MINT),
        ]),
        section("Inventory transferable evidence", "03 - Reframe", "Prior work, volunteering, study, and life experience may contain relevant evidence even when the title is different.", [
            data_table(["Experience", "Action I took", "Skill demonstrated", "Proof"], [["", "", "", ""], ["", "", "", ""], ["", "", "", ""], ["", "", "", ""]], [42*mm, 48*mm, 40*mm, 34*mm]),
            *lines(3, "The strongest transferable story I can tell..."),
        ]),
        section("Prioritize the right gaps", "04 - Focus", "Prioritize gaps that are frequent, important, and possible to demonstrate. Do not spend equal time on every missing keyword.", [
            data_table(["Gap", "Importance", "Time to evidence", "Risk if ignored", "Priority"], [["", "High / Med / Low", "", "", ""], ["", "High / Med / Low", "", "", ""], ["", "High / Med / Low", "", "", ""], ["", "High / Med / Low", "", "", ""]], [40*mm, 33*mm, 33*mm, 34*mm, 24*mm]),
            *lines(3, "The one gap that unlocks the most opportunities..."),
        ]),
        section("Design deliberate practice", "05 - Practice", "A practice task should resemble the target work, include feedback, and produce evidence.", [
            data_table(["Gap", "Practice task", "Feedback source", "Evidence", "Deadline"], [["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]], [31*mm, 50*mm, 35*mm, 31*mm, 18*mm]),
            checkbox_list(["The task uses realistic constraints.", "I can explain the quality standard.", "A person or test will provide feedback.", "The result can be shown without violating privacy.", "The scope fits the deadline."]),
        ]),
        section("Run a six-week sprint", "06 - Schedule", "Schedule output and feedback, not just course consumption.", [
            data_table(["Week", "Practice output", "Feedback", "Revision", "Status"], [[str(i), "", "", "", ""] for i in range(1, 7)], [16*mm, 52*mm, 38*mm, 40*mm, 18*mm]),
            *lines(3, "What I will stop, reduce, or ask for help with..."),
            Spacer(1, 4*mm),
            *source_list(COMMON_SOURCES),
        ]),
    ]
    return build_pdf("skills-gap-template.pdf", "Skills Gap Analysis and Practice Template", pages)


def interview_pack() -> Path:
    pages = [
        cover("Career Interview Preparation Pack", "Research the role, build concise evidence stories, practice responsibly, and evaluate the employer as carefully as they evaluate you.", "Students, graduates, professionals, and career changers preparing for internships or job interviews.", "8-page preparation pack"),
        section("Build a role brief", "01 - Research", "Prepare for the specific role and organization rather than memorizing generic answers.", [
            data_table(["Area", "Notes"], [["Organization and customers", ""], ["Role outcomes in first 6-12 months", ""], ["Repeated skills in the description", ""], ["Likely team and collaborators", ""], ["Recent product, service, or market context", ""], ["Questions or risks to clarify", ""]], [58*mm, 106*mm]),
            *lines(2, "My 30-second reason for this role..."),
        ]),
        section("Create an evidence bank", "02 - Stories", "Use Situation, Task, Action, and Result as a structure, not a script. Emphasize your decisions and what you learned.", [
            data_table(["Competency", "Story", "Result / learning"], [["Problem solving", "", ""], ["Teamwork", "", ""], ["Communication", "", ""], ["Ownership", "", ""], ["Learning from failure", "", ""], ["Managing priorities", "", ""]], [42*mm, 65*mm, 57*mm]),
            note_box("Result", "Use a measured outcome when available. If not, name the decision, delivery, feedback, or learning produced.", MINT),
        ]),
        section("Practice high-value questions", "03 - Behavioral", "Answer aloud in one to two minutes. Then shorten without removing the decision or result.", [
            *bullets(["Tell me about a time you solved an ambiguous problem.", "Describe a disagreement and how you handled it.", "Tell me about feedback that changed your work.", "Describe a mistake, its impact, and what changed afterward.", "How have you prioritized when everything felt urgent?", "Tell me about a time you influenced without authority.", "What is a skill you learned recently, and how did you apply it?"]),
            *lines(4, "The answer that needs the most practice..."),
        ]),
        section("Prepare for a work sample", "04 - Technical or case", "Clarify the goal and constraints before solving. Think aloud selectively so the interviewer can follow your reasoning.", [
            checkbox_list(["Restate the problem and desired outcome.", "Ask about users, data, constraints, and success criteria.", "Name assumptions.", "Outline an approach before diving into detail.", "Check edge cases, risks, or accessibility.", "Validate the answer where possible.", "Summarize tradeoffs and the next step."]),
            data_table(["Prompt", "Assumptions", "Approach", "Validation"], [["", "", "", ""], ["", "", "", ""]], [34*mm, 42*mm, 50*mm, 38*mm]),
        ]),
        section("Ask better questions", "05 - Evaluate", "Use your questions to understand expectations, support, ethics, and the reality behind the job description.", [
            checkbox_list(["What outcome would make the first six months successful?", "What does a typical week look like?", "How does the team make and review decisions?", "How is feedback given, and how often?", "What support exists for learning and onboarding?", "What is the hardest unresolved challenge for this role?", "How does the organization handle accessibility, privacy, or safety relevant to the work?", "Why is the role open, and what changed recently?"]),
            *lines(3, "My two role-specific questions..."),
        ]),
        section("Run a mock interview", "06 - Rehearse", "Ask the reviewer to score observable qualities and record one actionable change per round.", [
            data_table(["Quality", "1", "2", "3", "4", "5", "Feedback"], [["Clear structure", "", "", "", "", "", ""], ["Specific evidence", "", "", "", "", "", ""], ["Relevant detail", "", "", "", "", "", ""], ["Honest limitations", "", "", "", "", "", ""], ["Concise delivery", "", "", "", "", "", ""], ["Thoughtful questions", "", "", "", "", "", ""]], [42*mm, 10*mm, 10*mm, 10*mm, 10*mm, 10*mm, 72*mm]),
            *lines(3, "One change for the next practice round..."),
        ]),
        section("Interview-day checklist", "07 - Ready", "Reduce avoidable friction so you can focus on the conversation.", [
            checkbox_list(["Confirm time, time zone, format, and participants.", "Test camera, audio, internet, screen sharing, and charging.", "Keep the job description, resume, portfolio, notes, and water ready.", "Prepare a quiet and accessible environment or request accommodations.", "Join or arrive 5-10 minutes early.", "Pause before answering and ask for clarification when needed.", "Do not disclose confidential information from previous work.", "Send a concise follow-up and record what you learned."]),
            *lines(3, "Follow-up note: interest, relevant takeaway, and next step..."),
            Spacer(1, 3*mm),
            *source_list(COMMON_SOURCES),
        ]),
    ]
    return build_pdf("career-interview-preparation-pack.pdf", "Career Interview Preparation Pack", pages)


def main() -> None:
    outputs = [
        career_decision_workbook(),
        ux_checklist(),
        data_roadmap(),
        portfolio_guide(),
        skills_gap_template(),
        interview_pack(),
    ]
    for output in outputs:
        print(output.relative_to(ROOT))


if __name__ == "__main__":
    main()
