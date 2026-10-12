# 🎨 Teammate Contribution Guide: Susmitha
### Role: Principal Frontend Systems & Human-in-the-Loop UX Engineer
**Google Student Club Welcome Hackathon 2026 — Track 03: Adaptive Interview Intelligence**

---

## 📌 1. Your Role & Technical Ownership
As the **Principal Frontend Systems & Human-in-the-Loop UX Engineer**, you own the candidate experience, the recruiter decision studio, and the tactile design system. Your crowning achievement is the **Click-to-Proof UX architecture**, where recruiters never see ungrounded AI verdicts—every score, badge, and quote is clickable to exact transcript spans and audio playback.

### Your Key Files & Deliverables in this Codebase:
1. **Interactive Proofline & Recruiter Decision Studio (Module 05)**:
   - `apps/web/src/components/ProoflineDrawer.tsx` — The interactive proofline drawer that expands upon clicking any citation `[EVID-XXX]` or score chip, scrubbing directly to the verbatim quote span and timestamp.
   - `apps/web/src/app/recruiter/reports/` & `page.tsx` — Evidence Dossier synthesis view featuring the 4-Quadrant Matrix, Competency Uncertainty Curves, and recruiter decision logging.
   - `apps/web/src/app/recruiter/roles/` — Role blueprint calibrator with scroll-isolated target roles and competency requirement rubrics.
   - `apps/web/src/app/recruiter/interviews/` — Practice sessions and live interview management dashboard.
2. **Live Candidate Interview Interface**:
   - `apps/web/src/app/interview/start/page.tsx` — Candidate camera & audio interview room with real-time waveform visualizers, speech-to-text live captioning, and WhyCard display.
   - `apps/web/src/components/AudioVisualizerOrb.tsx` — Responsive 3D audio orb that reacts dynamically to voice pitch and AI speech synthesis.
   - `apps/web/src/components/CandidateConsentModal.tsx` — Candidate AI disclosure and ethical consent agreement.
3. **Core App Shell, Command Center & Design System**:
   - `apps/web/src/components/AppShell.tsx` — Master tactile application layout with topbar quick triggers, responsive navigation, and authenticated user profiles.
   - `apps/web/src/components/CommandPalette.tsx` — Universal ⌘K spotlight command search for jumping between candidates, blueprints, and audits.
   - `apps/web/src/components/ProvenanceManifestoModal.tsx` — Interactive 5-module workflow visualizer and architecture inspector.
   - `apps/web/src/app/globals.css` — High-craft CSS design tokens (WCAG 2.2 AA compliant, reduced-motion support, tactile elevation).

---

## 💻 2. Git Setup & Push Instructions

When you clone or extract this repository, run the following commands in your terminal (PowerShell or Bash) to push your commits with your official name:

```bash
# 1. Configure your Git Identity
git config user.name "Susmitha"
git config user.email "YOUR_GITHUB_EMAIL@example.com"

# 2. Check Git status
git status

# 3. Add your frontend files and deliverables
git add apps/web/ docs/UI_DESIGN_SPEC.md SUSMITHA_ROLE_GUIDE.md

# 4. Commit your frontend engineering contribution
git commit -m "feat(frontend): implement click-to-proof decision studio, real-time audio orb, and proofline drawer"

# 5. Link your GitHub repository (if not already set)
git remote add origin https://github.com/YOUR_ORGANIZATION_OR_USERNAME/YOUR_REPO_NAME.git

# 6. Push your branch or master/main
git branch -M main
git push -u origin main
```

---

## 🧪 3. How to Run & Verify Your Systems

```bash
# In apps/web directory:
cd apps/web

# Start Next.js development server
npm run dev

# Verify TypeScript compilation (0 errors)
npx tsc --noEmit
```

---

## 🎤 4. Your 1-Minute Pitch to the Hackathon Judges

> *"Hello Judges, I'm Susmitha, Principal Frontend Systems & Human-in-the-Loop UX Engineer.
> 
> My mission was to eliminate opaque, stressful interview interfaces for both candidates and recruiters. For the candidate, I designed an accessible room featuring an interactive Audio Visualizer Orb and real-time captions with zero cognitive overload.
> 
> For recruiters, I pioneered our signature 'Click-to-Proof' UX in the Decision Studio. In traditional tools, recruiters receive arbitrary ratings like '8/10'. In Provenance, every single badge, score, and summary statement is an interactive citation. Clicking any citation opens our Proofline Drawer, instantly displaying the exact verbatim quote and scrubbing audio playback to that second. Human recruiters make the final decision with 100% verified evidence."*
