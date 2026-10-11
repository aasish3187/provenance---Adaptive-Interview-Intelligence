# UI Design Spec — Provenance

**Design concept:** Quiet Intelligence  
**Signature interaction:** Proofline — every important finding opens the exact source behind it.  
**Primary promise:** “See what was demonstrated. Open the proof. Decide with context.”

This file is the visual and interaction contract for Antigravity. Build to these rules instead of inventing new colors, spacing, card styles, or navigation patterns on each screen.

## 1. Experience principles

1. **Calm over theatrical:** no glowing AI orbs, moving star fields, fake holograms, excessive gradients, or oversized KPI dashboards.
2. **One clear primary action per screen:** other actions are secondary, under an overflow menu, or progressively disclosed.
3. **Evidence is the interface:** the important interaction is to open proof—not a chart that merely looks intelligent.
4. **Progressive disclosure:** summary first; details on demand. Do not show recruiter-only evaluation to the candidate.
5. **Candidate dignity:** transparent AI disclosure, no pressure copy, no accusatory integrity language, and a usable text path.
6. **Accessible by default:** keyboardable controls, semantic headings, proper focus states, WCAG 2.2 AA target, captions, reduced motion, no color-only meaning.
7. **Real states, not fake certainty:** loading, empty, partial, uncertain, unsupported browser, offline, and error states are designed explicitly.
8. **No dark-patterned consent:** the choice is clear; declining stops the interview and explains the next contact route without shaming the candidate.

## 2. Visual identity and tokens

Use the CSS variables below as the single source of truth. If a needed token is missing, add it here before using it. Use colors by semantic role, never arbitrary one-off hex values in components.

```css
:root {
  color-scheme: light;
  --canvas: #F6F7FB;
  --surface: #FFFFFF;
  --surface-raised: #FFFFFF;
  --surface-subtle: #EEF1F7;
  --ink: #182238;
  --ink-strong: #10192B;
  --ink-muted: #667189;
  --ink-soft: #8791A5;
  --border: #E1E6EF;
  --border-strong: #CBD3E1;
  --accent: #5A5BE7;
  --accent-hover: #4647CD;
  --accent-soft: #EEEEFF;
  --focus: #3F68FF;
  --success: #167653;
  --success-soft: #E6F6EE;
  --warning: #925B0A;
  --warning-soft: #FFF3D8;
  --danger: #AD3948;
  --danger-soft: #FBEAEC;
  --info: #2B6598;
  --info-soft: #E8F3FC;
  --shadow-sm: 0 1px 2px rgb(16 25 43 / 5%);
  --shadow-popover: 0 16px 48px rgb(16 25 43 / 14%);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --content-max: 1440px;
}
```

### Typography

- Use **Geist** or **Inter**. Use one family for the app; do not mix decorative fonts.
- Display: 30–34px, weight 600; page heading: 24–28px, weight 600; section heading: 16–18px, weight 600; body: 14–16px; labels/captions: 12–13px.
- Body line-height 1.45–1.6. Evidence quotes use 15–16px and comfortable spacing.
- Avoid light gray for important text. Never use tiny all-caps labels for primary navigation.
- Use tabular numerals for durations, timestamps, and counts.

### Layout

- 4px spacing grid. Use the tokens above.
- Recruiter desktop shell: 232px sidebar, 64px topbar, content max width 1440px, 28–32px main gutters.
- Candidate interface has no recruiter sidebar; use a centered content column around 680–760px.
- Breakpoints: small <640px, medium 640–1023px, desktop >=1024px. All major workflows work at 360px width.
- Cards use white surfaces, subtle border, low shadow. Prefer whitespace, section dividers, and typographic hierarchy over nested cards inside cards.
- Avoid fixed-width tables on mobile; convert rows to stacked cards with labels.

### Color semantics

- Indigo is for primary action, selection, and active state—not “AI confidence.”
- Green = demonstrated/verified state; amber = uncertain or needs validation; red = evidence-backed “tested, not demonstrated,” not a character judgment; gray = not assessed.
- Integrity severity uses a neutral event marker and explicit text. Do not rely only on red/green.
- Do not color a whole page based on a person's status.

## 3. Brand and copy

- Wordmark: `provenance` in lower case, with a small linked-point mark or proofline glyph. Keep the logo simple and easy to reproduce in SVG.
- Tagline: **Every finding has a source.**
- Secondary copy: **Adaptive interviews. Evidence you can inspect.**
- Use sentence case for headings and buttons.
- Buttons should say the action: `Create role`, `Review blueprint`, `Start interview`, `Open evidence`, `Request human review`, `Finish interview`.
- Avoid vague actions such as `Continue` when a more specific label fits.

## 4. Signature interaction: Proofline

Proofline is the one interaction that should make Provenance memorable and defensible.

### What appears when a finding is clicked

Open a right-side evidence drawer on desktop, or a full-screen/slide-up evidence sheet on mobile. Do not navigate away from the dossier by default.

Show in this order:

1. **Finding:** the exact sentence or competency claim the recruiter clicked.
2. **Source:** question text, candidate quote, speaker, transcript timestamp, and turn ID.
3. **Why it counts:** rubric criteria met/missed and a short, plain-language rationale.
4. **Change:** prior estimate → updated estimate, plus uncertainty and evidence count. Explain that this is a competency signal, not an overall hiring score.
5. **Context:** `Open transcript at this point`, plus one adjacent turn before/after if available.
6. **Actions:** `Copy quote`, `Mark for review`, `Close evidence`.

Do not show a quote that failed server-side verification. When evidence is unavailable, show `No verified quote attached` and prevent the claim from being presented as scored evidence.

## 5. Navigation and information architecture

### Recruiter navigation

- **Overview** — current activity and next actions.
- **Roles** — role library and Blueprint Studio.
- **Interviews** — in progress, completed, needs review.
- **Reports** — dossiers/review queue.
- **Audit** — consent, model/prompt versions, review decisions, deletions; admin-only where appropriate.

Keep `Settings` and profile at the bottom. Do not create a separate nav entry for each of the five modules; they appear as connected stages in role/interview workflows.

### Candidate navigation

No global navigation. The candidate flow is a single, focused journey: `Invitation → Consent → Device check → Interview → Completion`.

## 6. Screen specs

### Screen A — Recruiter overview

**Goal:** answer “What needs my attention?” within five seconds.

Layout:
- Sidebar + topbar with workspace label, role switcher/search, profile.
- Heading: `Good morning` is optional; useful section title is `Your hiring workspace`.
- Primary button: `Create role`.
- A compact `Needs your review` section with recent dossiers awaiting a human review.
- `In progress` list with candidate display names only where authorized, role, stage, last activity, and next action.
- `Recent roles` with counts for in progress/completed.

Avoid generic dashboard KPI tiles like “AI score,” “average candidate quality,” or made-up percentages. Show only metrics with a clear definition and useful action.

States: first-use empty state with a sample synthetic role action; loading skeleton; service-error state with retry; access-denied state.

### Screen B — Create role / Blueprint Studio

**Goal:** make the role definition quick and auditable.

Step flow (visible stepper): `Role details → Documents → Blueprint → Invite`.

Documents panel:
- Job description upload + paste-text alternative.
- Resume upload for synthetic/demo candidates; production candidate association follows access controls.
- Accepted formats and file size limits displayed before upload.
- Parsing state must indicate progress, not a spinner that never explains itself.

Blueprint Studio:
- Left: role requirements and extracted skill groups.
- Main: competency rows with name, importance, must-have toggle, how it can be verified, resume claim count, estimated question time.
- Right: interview plan summary: expected duration, must-have coverage, and unresolved resume claims.
- Drag-reorder must have keyboard alternatives (`Move up`/`Move down`) and a non-drag method.
- Clearly label `AI suggestion` and `Recruiter-edited` changes.
- Every extracted skill can be edited, removed, or added manually.
- Before save, show `Review changes` with concise summary.

Do not allow blueprint creation to silently lock the rubric. Recruiter approval precedes invitation.

### Screen C — Candidate consent and setup

**Goal:** make the candidate understand what happens before permission is requested.

Use a calm, light background, no recruiter navigation, no flashy animation. One centered card, short paragraphs, clear hierarchy.

Required content:
- `You’re about to interview with an AI interviewer.`
- What the system uses: the answers/transcript and role-related rubrics; if voice is enabled, microphone audio is processed to conduct the conversation and produce transcript segments.
- What it does **not** do: emotion detection, personality inference, face recognition, or automated rejection.
- Retention and who can view the report. This must reflect the actual implemented policy; never invent a retention promise.
- Text alternative and what happens if microphone permissions fail.
- If presence/face-count sensors are enabled for a role, separate disclosure of exactly what is counted, whether it is optional, that frames remain on-device, and what metadata is stored. No sensor starts before consent.
- AI disclosure and link to privacy details.
- Explicit `I agree and start` and `Decline` actions with equal visual clarity.

Setup checks: mic permission with test meter, headphones recommendation (not a hard requirement), captions preference, `Use text instead` available without penalty.

### Screen D — Candidate interview room

**Goal:** keep all attention on understanding and answering one question.

Layout:
- Top: Provenance wordmark, `AI interview` label, elapsed time/estimated time remaining, `Help` control.
- Main center: one question in a large, readable panel with a short context label (`Technical skill · Kubernetes`). Do not expose scores/weakness labels to the candidate while answering.
- Bottom interaction dock: large `Start speaking` / `Pause` / `Submit answer` controls, `Type answer instead`, captions/transcript toggle, audio state.
- Small progress line reports sections/topics covered—not likelihood of passing.
- Candidate can edit their typed answer before submission; voice transcripts should be visibly labelled as machine-generated and editable/correctable where feasible.
- `Need a break?` and `Request human assistance` are available but not visually competing with the main action.

Voice states: ready, listening, processing, AI speaking, interrupted, reconnecting, text fallback. Text mode follows identical steps.

Never show camera preview as a default centerpiece. If an explicitly consented presence sensor is active, explain it unobtrusively and provide a clear policy link/indicator.

### Screen E — Recruiter live observer

**Goal:** understand the interview without distracting from the conversation.

Three-column desktop layout:

- **Left rail (240–280px):** competency coverage and statuses, uncertainty, evidence count; compact not a giant chart.
- **Center (flex):** transcript with timestamps and clear speaker labels. New segments appear gently; user can pause auto-scroll and search.
- **Right rail (300–340px):** current question + `Why this question` card, rubric criteria being checked, last competency change, integrity event feed (neutral style).

Top strip: interview mode, connection state, elapsed time, and `Observer mode · read only` unless authorized for a human review action.

The WhyCard must display:
- `Target skill`
- `Reason` in plain English, e.g. “The resume mentions Kubernetes, but the previous answer did not explain how autoscaling decisions are made.”
- `Question type`: verify / probe / drill / elevate / bridge
- `What a strong answer should cover` with 3–5 observable rubric criteria
- `Alternative considered` only in an expandable detail view

During lag, do not block the candidate. Show `Assessment is catching up; answer saved` and queue evaluation. Never invent a profile delta before the evaluator returns.

On medium screens, right and left rails become switchable tabs. On mobile, make this an observer summary first; detailed transcript/evidence appears in stacked sections.

### Screen F — Reality Matrix (skill-gap map)

**Goal:** show what has and has not been demonstrated for this role.

Use a clean table/list, not a 3D or force-directed diagram as the only representation. Each row includes:
- skill and role importance
- status label: `Verified`, `Claimed — needs validation`, `Tested — not demonstrated`, `Not assessed`
- confidence/uncertainty with text, not just a meter
- evidence count and source links
- resume claim indicator, including `Required but absent from resume` when appropriate
- ambiguity label if evidence conflicts

Filters: `All`, `Needs validation`, `Not assessed`, `Must-have`, plus search. Sort by importance or status. Clicking the row opens Proofline evidence. If the skill is not assessed, show no fabricated quote and a clear `No interview evidence yet` message.

A compact optional “constellation” overview may summarize relationships only if a table/list alternative remains fully available and keyboard-accessible.

### Screen G — Candidate dossier

**Goal:** make a decision-support report scannable in two minutes and defensible in two clicks.

Header:
- role, candidate, interview date, status `Ready for human review`
- clear note: `AI-generated analysis is decision support. A human makes the hiring decision.`
- action buttons: `Add review note`, `Export`, `Open full transcript`.

Sections in order:
1. **At a glance:** four or five evidence-backed themes, no overall hire score.
2. **Demonstrated strengths:** sentence + evidence chip + linked skill state.
3. **Needs validation / risks:** what remains unproven, with evidence and uncertainty.
4. **Skill map:** Reality Matrix.
5. **Open questions:** questions the interview did not resolve.
6. **Suggested follow-ups:** specific next question, why it matters, which evidence prompted it.
7. **Integrity signals:** separate neutral timeline; clearly separate detected events from interpretation.
8. **Evidence appendix:** transcript spans, rubric hits/misses, model/prompt versions, audit references.

Every AI-generated sentence must be tied to one or more evidence IDs (except explicitly non-evaluative metadata). Validator rejects unsupported sentences. Add a `Show only evidence-backed findings` filter and an uncertainty label where evidence conflicts or is weak.

### Screen H — Integrity Tide

**Goal:** provide context for human review without making accusations.

Timeline entries are factual observations:
- `Tab visibility changed` — time and duration if available.
- `Paste event detected` — approximate size bucket and timing after question; do not store clipboard content.
- `Fullscreen exited` — timestamp.
- `Presence count changed` only if camera/presence sensing was separately enabled and consented to.

For each cluster show:
- detected facts and sensor source
- severity contribution and detector confidence, with definitions available
- innocent/benign explanations
- what the system cannot infer
- action `Mark reviewed` and optional reviewer note

Do not show a gauge named “cheating probability.” Overall output is `Review priority: None / Low / Moderate / High`. Show the events that contributed and the reason the band was assigned. One benign tab switch should remain Low or below based on calibration tests.

### Screen I — Audit and settings (MVP-lite)

Provide a working audit list for consent events, role/blueprint edits, model/prompt versions, evidence verification failures, human review actions, export events, and deletion requests. Include actor, timestamp, action, object ID, and filter/export. Redact private transcript content from ordinary audit rows.

Settings should expose actual implemented retention and sensor settings only. Do not display inactive controls that imply a capability exists.

## 7. Shared component inventory

Build these once and use them everywhere:

- `AppShell`, `SidebarNav`, `TopBar`, `Breadcrumbs`
- `PageHeader` with one primary action
- `Button`, `IconButton`, `LinkButton`, `TextField`, `Textarea`, `Select`, `Switch`, `Checkbox`, `SegmentedControl`
- `StatusTag` with icon + text + accessible label
- `ConfidenceMeter` with value/uncertainty text and accessible description
- `EvidenceChip` and `ProoflineDrawer`
- `WhyCard`
- `SkillRow` and `RealityMatrix`
- `TranscriptTimeline` and `TranscriptSegment`
- `IntegrityEvent` and `IntegrityTimeline`
- `EmptyState`, `LoadingSkeleton`, `ErrorPanel`, `ConnectionBanner`, `OfflineBanner`
- `ConsentSummary`, `MicPermissionCheck`, `CaptionPanel`
- `ConfirmDialog`, `Toast`, `Tooltip`, `ReviewNote`

Use Lucide icons consistently. Each icon-only control requires an accessible name and tooltip. Avoid using an icon as the only representation of a skill status.

## 8. Interaction rules

- Every clickable row must have a clear focus state and keyboard activation.
- Clickable evidence chips use an informative accessible label, e.g. `Open evidence for “Kubernetes autoscaling”`.
- Drawer opens without clearing the current filters or scroll position. `Escape` closes it, and focus returns to the trigger.
- Toasts announce success/failure to assistive technology. Important validation errors are inline and specific.
- Autosave fields show `Saving…`, `Saved`, or `Couldn’t save — Retry`.
- Destructive actions require a clear confirmation and describe the impact.
- Long-running AI operations show progress stages (`Reading documents`, `Mapping skills`, `Preparing interview plan`) and allow retry/cancel where safe.
- No silent state changes after reconnection: show whether answers were saved and which question is current.

## 9. Accessibility requirements

- WCAG 2.2 AA target; contrast check all body/interactive text.
- Full keyboard path with logical order, no keyboard traps, visible focus ring.
- Semantic landmarks and one `h1` per page; headings reflect the content hierarchy.
- Respect `prefers-reduced-motion`; motion is optional decoration, never a required cue.
- Captions/transcript accessible at all times in voice mode; do not evaluate speaking style or accent as a competency.
- All status changes are announced politely; do not announce every incoming token.
- Touch targets at least 44x44 CSS px where practical.
- Responsive reflow at 320–360px, 200% zoom, and browser text enlargement.
- Provide typed-response alternative without worse scoring or reduced competency coverage.
- Do not require camera, fullscreen mode, or drag/drop to finish the interview.

## 10. Motion and micro-interactions

Use subtle transitions only:
- 120–180ms ease for menus, buttons, drawers, and status updates.
- When a competency state changes, briefly highlight the row and show a textual explanation `Evidence E14 moved estimate 0.52 → 0.71`.
- Transcript autoscroll pauses if the recruiter scrolls up; show `Jump to latest`.
- New Proofline connections draw once, in under 250ms, and can be disabled by reduced motion.
- Do not use confetti, pulsing urgency, flashing red, or animation to imply model certainty.

## 11. Responsive and state design

Every screen must include and be tested in the relevant states:

- initial empty workspace
- loading/skeleton
- no resume text extracted / unsupported file
- partially parsed blueprint
- AI generation timeout and retry
- saved answer but evaluator delayed
- zero verified evidence
- conflicting evidence
- no must-have coverage due time ending
- microphone denied or device missing
- Live API disconnected / expired session
- browser does not support a sensor
- no consent / declined consent
- unauthorized role/interview
- empty integrity timeline
- dossier with no evidence, which must not fabricate strengths
- demo replay mode clearly marked

## 12. Implementation and design QA

Before calling UI work complete, Antigravity must:

1. Read this spec and identify the screens/components being changed.
2. Produce plan artifact first; only start implementation after approval when schema/security is affected.
3. Use tokens in CSS variables. No hardcoded one-off colors or arbitrary spacing.
4. Run lint, typecheck, unit tests, Playwright flows, and axe checks where configured.
5. Capture screenshots for desktop (1440px), tablet (768px), and mobile (390px); include a browser recording for major journeys.
6. Verify tab order, focus return from drawers, reduced motion, caption/text fallback, and visible error states manually.
7. State any spec deviations clearly and do not claim WCAG conformance from automated checks alone.

### Visual acceptance test

A first-time recruiter should be able to find `Create role`, edit a must-have skill, open a dossier, and jump from a sentence to its source quote without training. A first-time candidate should understand AI use, consent, text alternative, and interview state before starting. The interface should feel complete even when data is empty or a service fails.
