# Il An Noor Beneficiary Priority Calculator

A transparent, local-first beneficiary assessment and prioritization system developed for **Il An Noor Foundation**.

The application evaluates cases across financial hardship, vulnerability, basic-needs deprivation, severity and urgency, and support/funding gaps. These dimensions are combined into the **Il An Noor Beneficiary Priority Index (INBPI)** to support consistent prioritization when charitable resources are limited.

> The score is a decision-support measure, not a measure of a person's worth or dignity. It does not replace human review, qualified medical judgment, or Shariah review where applicable.

**Current policy:** INBPI v0.1  
**Maximum score:** 100 points

## Scoring model

| Dimension | Maximum |
| --- | ---: |
| Financial Need | 30 |
| Vulnerability & Dependency | 20 |
| Basic-Necessity Deprivation | 15 |
| Severity & Urgency | 25 |
| Support & Funding Gap | 10 |
| **Total** | **100** |

### Financial Need — 30

Measures the household's ability to meet essential needs. It considers monthly income versus essential expenditure, accessible reserves, debt/arrears, and income stability.

Income coverage scoring:

| Income coverage of essential needs | Points |
| --- | ---: |
| 150% or more | 0 |
| 125–149% | 2 |
| 100–124% | 4 |
| 80–99% | 7 |
| 60–79% | 10 |
| 40–59% | 13 |
| Below 40% | 15 |

### Vulnerability & Dependency — 20

Considers functional disability, household dependency, age/life-stage vulnerability, family support structure, chronic care, and safeguarding needs.

Disability is assessed primarily by functional impact rather than treating a disability percentage as an automatic priority score:

| Functional impact | Points |
| --- | ---: |
| None | 0 |
| Mild | 1 |
| Moderate | 3 |
| Severe | 5 |
| Profound dependence | 6 |

Age alone does not determine priority. The framework intentionally avoids blanket rules such as younger people automatically outranking older people.

### Basic-Necessity Deprivation — 15

| Area | Maximum |
| --- | ---: |
| Food security and nutrition | 4 |
| Housing and shelter stability | 3 |
| Essential utilities | 2 |
| Healthcare and medication access | 2 |
| Education continuity | 2 |
| Other basic necessities | 2 |

### Severity & Urgency — 25

Considers time until serious harm, consequence of no assistance, essentiality of the requested intervention, and expected meaningful benefit.

Time urgency:

| Time until serious harm | Points |
| --- | ---: |
| More than 3 months | 0 |
| 1–3 months | 2 |
| 2–4 weeks | 4 |
| 1–2 weeks | 6 |
| Less than 72 hours | 8 |

Medical cases may additionally consider diagnosis, severity, stage, treatment suitability, urgency, cost, other coverage, clinical prognosis, and expected meaningful benefit. Medical prognosis should be informed by qualified professionals.

### Support & Funding Gap — 10

Considers realistic family/community support, government or institutional schemes, insurance/other NGO support, and the remaining uncovered requirement.

## Priority bands

| Score | Priority |
| ---: | --- |
| 85–100 | Critical |
| 70–84 | Very High |
| 55–69 | High |
| 40–54 | Moderate |
| Below 40 | Lower |

The score is not an automatic approval mechanism. Actual allocation depends on fund eligibility, available resources, urgency, verification, minimum effective assistance, other funding, and authorized human review.

## Eligibility and Zakat

Eligibility and prioritization are separate. The current configuration uses a **targeting threshold of 40** and a **prioritization threshold of 70**; these are policy values and can change.

Zakat eligibility is assessed separately from the 100-point humanitarian score and follows the Foundation's approved Shariah policy. Where the approved policy uses the silver Nisab, the reference is **612.36 grams of silver**; its rupee value changes with the applicable silver price.

## Verification and fairness

The framework is designed around:

- multidimensional assessment rather than a single income number
- no arbitrary category stacking
- avoiding double-counting
- transparent scoring criteria
- separation of need from verification status
- separation of eligibility from priority
- human review and documented overrides
- reassessment when circumstances change
- policy versioning for historical assessments

Relevant information can be self-reported, document verified, field verified, third-party verified, or pending verification. Missing documentation should not automatically be treated as lower need; the case can instead remain provisional.

## Important limitation

No scoring framework can completely capture the complexity of a human life. INBPI is a structured guide for consistent decision-making, not an automatic verdict on a beneficiary. Final decisions should consider verified evidence, professional advice, Foundation policy, available funds, Shariah requirements where applicable, and compassionate human judgment.

## Features

- Multidimensional beneficiary assessment
- INBPI 0–100 scoring
- Explainable score breakdowns
- Financial, asset, reserve, debt, and income-stability assessment
- Disability and functional-dependency assessment
- Orphan, widow, single-caregiver, elderly, and family-support assessment
- Age and life-stage context
- Food, housing, healthcare, education, livelihood, disability, debt, disaster, and other case pathways
- Medical case assessment
- Emergency review support
- Separate Zakat assessment
- Priority queue
- Case search/filtering and comparison
- Fund and allocation planning
- Reassessment and decision history
- Criteria/policy transparency pages
- PDF report generation
- Local data export/import
- Optional encrypted local vault using browser Web Crypto APIs
- Fictional demo data

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Zod
- Lucide React
- `@react-pdf/renderer`
- Vitest
- ESLint

## Project structure

```text
src/
├── app/             # Next.js App Router pages
├── components/      # Reusable UI components
├── lib/
│   ├── demo/        # Demo data
│   ├── policy/      # INBPI and Zakat policy
│   ├── scoring/     # Scoring engine
│   ├── security/    # Local vault / encryption
│   ├── storage/     # Local persistence and backup
│   └── store/       # Application state
└── types/           # Shared TypeScript models
```

## Application areas

- `/` — dashboard
- `/cases` — case management
- `/queue` — priority queue
- `/compare` — case comparison
- `/funds` — fund and allocation planning
- `/criteria` — evaluation criteria
- `/policy` — policy and methodology
- `/audit` — audit/fairness review
- `/settings` — application settings
- `/help` — help and guidance

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm, pnpm, yarn, or Bun

### Install

```bash
git clone https://github.com/abdurrahmanshkh/beneficiary-priority-calculator.git
cd beneficiary-priority-calculator
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run test` | Vitest tests |

## Local-first storage and privacy

The current version does not require a backend database. Case data and application configuration are stored in the browser using a local storage repository.

An optional local vault uses browser Web Crypto APIs to encrypt stored data when enabled.

Because the application can contain sensitive financial and medical information, it should only be used on approved and appropriately secured devices. The current MVP does **not** provide centralized multi-user access control, server-side audit logs, organizational identity management, or cloud backup, so it should not be treated as a complete enterprise security solution.

The application supports data export/import and backup tracking. Exported files may contain sensitive beneficiary information and must be stored securely.

## PDF reports

Client-side PDF reports are generated with `@react-pdf/renderer` and can include beneficiary information, assessment results, score breakdowns, verification details, fund/Zakat status, allocation information, decision history, and policy version.

## Policy versioning

The current implementation uses **INBPI v0.1**. Scoring criteria, weights, thresholds, and explanations are represented as policy configuration rather than being scattered through the UI. Completed assessments retain the policy version used for calculation.

## Policy status

INBPI v0.1 should be treated as a structured policy framework that requires validation against representative historical cases and formal approval by the appropriate Il An Noor stakeholders before being relied upon for high-stakes real-world allocation.

Particular areas requiring domain review include medical prioritization, Shariah/Zakat rules, privacy/data protection, fund-specific eligibility, threshold calibration, and fairness/bias testing.

## Future direction

Potential future improvements include secure backend storage, authenticated multi-user access, role-based permissions, centralized audit logs, secure document storage, organizational backup, policy administration, richer analytics, formal outcomes/follow-up tracking, multilingual workflows, assisted document extraction, and additional fairness testing.

Any future AI functionality should remain assistive and explainable, with human oversight over eligibility, prioritization, and final allocation decisions.

## License

Add the Foundation's chosen license before publishing or accepting external contributions.

## About Il An Noor Foundation

This project supports the charitable and community-welfare work of **Il An Noor Foundation**.

Website: https://www.ilannoor.org/
