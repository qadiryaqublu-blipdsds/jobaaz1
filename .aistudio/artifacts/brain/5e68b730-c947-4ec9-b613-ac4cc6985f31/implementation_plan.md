# Professional Summary Report Component for Deep CV Analyzer

A dedicated, comprehensive analysis module integrated directly within the ATS Audit tab of the Deep CV Analyzer that delivers deterministic structural recommendations, keyword density comparisons, and copy-ready summary rewrites.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during interactive clarification and will govern the implementation:

- **Confirmed Placement**: Directly integrated as an interactive report section within the ATS Audit tab of `AICVAnalyzerDashboard`, immediately accessible alongside the 100-point score and criteria audit.
- **Confirmed Analytical Scope**:
  1. *Missing vs. Detected Industry Keywords Comparison*: Interactive matrix of domain terms with density, status, and target placement recommendations.
  2. *Actionable Rewrite Suggestions with Highlighted ATS Keywords*: Side-by-side or before-and-after draft breakdowns with highlighted high-impact keywords.
  3. *Section-by-Section Structural Checklist & Ordering Advice*: Recommended standard ATS section order (Contact -> Summary -> Experience -> Skills -> Education -> Certifications) with pass/improve status badges.
  4. *Role-Tailored Elevator Pitch Generation*: Distinct variations (Executive, Impact/Metric-driven, Technical Specialist, Career Switcher) customized to the candidate's field.
- **Confirmed Output Affordance**: One-click clipboard copy with animated visual feedback and text export.
- **Repository Policy Compliance**: Automatic update of `/BUSINESS_PLAN.md` Section 8 Changelog upon implementation.

---

## 1. Overview & Core Concept

- **What It Does**: The `ProfessionalSummaryReport` component analyzes the candidate's existing summary (or flags its absence), parses the extracted skills, target industry, and career progression, and presents an actionable diagnostic and improvement engine. It highlights missing vs. matched keywords, evaluates structural clarity against ATS standards, and generates tailored professional summary variations that users can copy with one click.
- **Target Audience / Persona**: Job seekers in Azerbaijan and regional markets wanting their CVs to beat automated ATS screeners and impress corporate recruiters.
- **Key Value**: Bridges the gap between passive CV analysis and active improvement by providing copyable, keyword-optimized text and structural fixes directly where the ATS audit findings are reviewed.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Discovery**: User runs a CV analysis (PDF/DOCX or text). Upon viewing the ATS Audit tab, a prominent, polished "Peşəkar Xülasə & Struktur Bələdçisi" (Professional Summary & Structural Guide) panel appears right above or within the criteria details.
2. **Current State Diagnostic**: The card shows the detected summary (or "Xülasə aşkar edilmədi" warning), its structural grade, keyword density, and word count benchmark (recommended: 40–80 words / 3–5 sentences).
3. **Keyword Impact Matrix**: Candidates view detected high-value keywords vs. critical missing industry keywords with placement tips (e.g. *where* in the summary to insert them).
4. **Interactive Rewrite Studio**: Candidate can toggle between 4 tailored styles:
   - *Korporativ / İcraçı (Executive & Leadership)*
   - *Nəticəyönümlü / Metrika (Results & Metric-Driven)*
   - *Texniki Mütəxəssis (Technical & Hard Skills)*
   - *Karyera Keçidi / Hibrid (Versatile & Growth)*
5. **One-Click Copy & Insertion**: User clicks "Kopyala" on any rewritten variant, receiving an instant feedback state (`Kopyalandı!`), ready to paste into their Word document or Jobia CV Creator.
6. **Structural Ordering Checklist**: Displays the gold-standard ATS section hierarchy with quick diagnostic status for the candidate's CV.

### Visual Identity & Theme
- **Color Palette**: 60% neutral slate background (`#F8FAFC` to `#FFFFFF`), 30% structural surfaces with hairline borders (`border-slate-200`), 10% accent budget using Jobia primary blue (`#2563EB`) and emerald accents for matched status (`#059669`).
- **Typography & Hierarchy**: `Plus Jakarta Sans` for display headers; `Public Sans` / `DM Sans` for body text; `font-mono tabular-nums` for keyword metrics and word counts.
- **Zero-Pill Discipline**: Clean typographic separators (`·`, `/`) for informational metadata; interactive tabs use structured segmented button controls rather than floating candy badges.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Integration in ATS Tab vs. Standalone Tab**
  - *Chosen Approach*: Section embedded directly inside the ATS Audit tab.
  - *Why*: The candidate's summary and keyword usage are the core drivers of their ATS score; having the actionable fixes right next to the criteria breakdown eliminates tab-switching fatigue and provides immediate remediation.
  - *Alternatives Considered*: A separate top-level tab was considered, but embedding inside ATS Audit keeps diagnostic context unified.

- **Decision 2: Deterministic Hybrid Keyword Synthesis**
  - *Chosen Approach*: Dynamically compute keyword matches, gaps, and tailored rewrite options based on the actual parsed `data.skills`, `data.candidateProfile`, `data.workExperience`, and `data.keywordAnalysis`.
  - *Why*: Guarantees instant response time without waiting for additional network round-trips while remaining 100% faithful to the factual content parsed from the CV.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DeepCVAnalyzerView                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    AICVAnalyzerDashboard                         │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ Tab: 'ats' (100-Point Deterministic ATS Audit)             │  │  │
│  │  │                                                            │  │  │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │  │
│  │  │  │ 1. Hero Score & Breakdown Strip                     │  │  │  │
│  │  │  └──────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                            │  │  │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │  │
│  │  │  │ 2. NEW: ProfessionalSummaryReport                   │  │  │  │
│  │  │  │    ├─ Diagnostic & Word Count Meter                  │  │  │  │
│  │  │  │    ├─ Missing vs. Detected Keyword Grid             │  │  │  │
│  │  │  │    ├─ Multi-Style Rewrite Studio (Copyable)          │  │  │  │
│  │  │  │    └─ Section-by-Section ATS Structure Checklist     │  │  │  │
│  │  │  └──────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                            │  │  │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │  │
│  │  │  │ 3. 10 ATS Criteria Accordion                        │  │  │  │
│  │  │  └──────────────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Mapping
- Component Props: `data: CVAnalyzerResult`
- Local Component State:
  - `activeSummaryTab`: Selected rewrite persona (`'executive' | 'metrics' | 'technical' | 'elevator'`)
  - `copiedIndex`: Tracks active copy feedback timeout
  - `activeKeywordFilter`: Filter for keyword matrix (`'all' | 'missing' | 'matched'`)
  - `isExpanded`: Toggle for full structural checklist

### Verification Plan
1. Compile the applet with `compile_applet`.
2. Verify all interactive controls (copy to clipboard, style switching, keyword filters, checklist expand/collapse) operate smoothly.
3. Update `BUSINESS_PLAN.md` with the new capability in the changelog as mandated by project instructions.
