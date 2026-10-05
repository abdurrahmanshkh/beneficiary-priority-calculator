# Build a Complete Il An Noor Beneficiary Evaluation, Prioritization & Donation Allocation Web App

## 1. ROLE AND OBJECTIVE

Act as a senior full-stack engineer, product designer, UX researcher, data-model designer, decision-support-system architect and QA engineer.

Build a complete production-quality frontend web application for **Il An Noor Foundation** that helps its staff evaluate beneficiary cases consistently, transparently and objectively, calculate a multidimensional priority score, compare cases, manage a local case queue and make better-informed donation allocation decisions.

This is a **decision-support system**, not an autonomous decision-maker.

The application must NEVER present the score as an absolute measurement of a person's worth or “deservingness”. It must represent the relative urgency, vulnerability, deprivation, financial need and support gap of a case according to the Foundation's published assessment policy.

The system must be:

- transparent
- explainable
- auditable
- configurable
- humane
- accessible
- mobile responsive
- offline/local-first
- privacy-conscious
- easy for non-technical Foundation staff to use
- suitable for explaining the methodology to beneficiaries
- ready for future migration from local storage to a backend database

Do not build merely a form and a dashboard. Build the complete workflow from case registration through evaluation, verification, prioritization, review, allocation recommendation, reporting and reassessment.

---

# 2. IMPORTANT PRINCIPLES

The following principles are mandatory.

### 2.1 Do not use category stacking as the main scoring mechanism

Do NOT implement simplistic rules such as:

PWD = +10  
Widow = +10  
Orphan = +10  
Elderly = +10

This produces distorted results.

Instead, measure the underlying vulnerability represented by those conditions:

- functional limitation
- dependence on caregivers
- household dependency
- absence of parents/guardian
- lack of support
- inability to work
- poverty
- deprivation
- urgency
- medical severity
- funding gap

A beneficiary can therefore score highly because several genuine dimensions of vulnerability are present, not simply because they possess several labels.

### 2.2 Avoid double-counting

Different questions must represent genuinely different dimensions.

For example:

Disability causing inability to work should not automatically receive full points under disability, lost income, support gap and dependency if all four are simply describing the same underlying fact.

Create explicit scoring dependencies and caps where necessary.

Every criterion must have a documented reason for existing.

### 2.3 Separate eligibility from prioritization

The application must distinguish:

1. **Fund eligibility**
2. **Need assessment**
3. **Priority score**
4. **Allocation recommendation**
5. **Human final decision**

A person may be highly vulnerable but ineligible for a restricted fund.

A person may be eligible for assistance but not currently fall within the Foundation's highest-priority allocation group.

### 2.4 Score incompleteness separately from need

Missing information must NEVER automatically mean:

> 0 points

and it must NEVER automatically mean:

> maximum points.

Instead mark the criterion as:

**Unknown / Not assessed**

and flag the case as:

**Provisional assessment**

until the necessary information has been obtained.

Display:

- Data completeness
- Verification status
- Number of unresolved fields
- Whether the current score is provisional

Do not allow missing information to silently bias the score.

### 2.5 Human review is mandatory

The score is a recommendation.

A reviewer or committee must be able to:

- approve the recommendation
- modify it
- place the case on hold
- request more information
- override the recommendation
- reject the application
- approve partial funding

Every override must require a written reason.

Never allow a silent manual change to the final score.

---

# 3. TECHNOLOGY STACK

Use:

- Next.js 16+
- React 19+
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form
- Zod
- Zustand or an equally clean lightweight state-management solution
- `@react-pdf/renderer` for client-side PDF generation
- Vitest for unit tests
- React Testing Library
- Playwright for end-to-end testing

Use the latest stable compatible package versions at implementation time.

Do not introduce unnecessary libraries.

Do not use a backend database in this version.

Do not create API routes merely for storing application data.

All beneficiary data must remain on the user's device in this version.

---

# 4. DATA STORAGE ARCHITECTURE

Implement a storage abstraction so the application does not become permanently dependent on localStorage.

Create an interface similar to:

StorageRepository

with operations such as:

- createCase()
- updateCase()
- getCase()
- getAllCases()
- deleteCase()
- duplicateCase()
- exportData()
- importData()
- clearAllData()

The initial implementation will use browser local storage.

Use versioned storage keys such as:

`ilannoor_cases_v1`

`ilannoor_settings_v1`

`ilannoor_policy_v1`

`ilannoor_metadata_v1`

Implement schema versioning and migrations.

Do not store React state directly without validation.

All data loaded from localStorage must be treated as untrusted input and validated before use.

---

# 5. PRIVACY AND LOCAL VAULT

The application will handle:

- names
- phone numbers
- addresses
- household income
- assets
- debt
- disability information
- medical information
- family circumstances

Therefore privacy must be treated seriously.

Implement a simple **Local Vault**.

On first use:

Create a local passcode/password.

Use browser Web Crypto APIs to encrypt stored case data before putting it into localStorage.

Do not store the plaintext beneficiary database in localStorage when vault mode is enabled.

The app should:

- lock after inactivity
- allow manual lock
- require passcode to unlock
- clearly warn that this is device-local storage
- warn users not to use the application on shared/public computers
- provide “Delete all local data”
- provide “Export encrypted backup”
- provide “Import backup”
- make it clear that losing the local password can make encrypted data unrecoverable

Do not implement cloud sync in this version.

Do not use:

- Google Analytics
- advertising scripts
- unnecessary third-party trackers
- remote logging of beneficiary information
- external AI APIs
- third-party form analytics

Do not upload beneficiary information to the server.

Do not store uploaded medical reports, Aadhaar scans or other documents as base64 blobs in localStorage.

Instead, store document metadata such as:

- document type
- document present
- verified/unverified
- verification note
- document reference/name if necessary

The actual files can be handled manually outside this MVP.

---

# 6. SECURITY

Use strong frontend security practices.

Implement:

- strict Content Security Policy where practical
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame-ancestors protection
- safe handling of user-entered notes
- no `dangerouslySetInnerHTML` for beneficiary content
- Zod validation for all structured input
- numeric range validation
- date validation
- robust sanitization of text displayed in reports

Do not treat localStorage as a security boundary.

Clearly communicate this in the application's privacy information.

---

# 7. CORE SCORING MODEL

Implement the following initial policy as:

**Il An Noor Beneficiary Priority Index**

**INBPI v0.1 – Draft Policy**

Total score:

**100 points**

The score consists of five dimensions.

| Dimension | Maximum |
|---|---:|
| Financial Need | 30 |
| Vulnerability & Dependency | 20 |
| Basic-Necessity Deprivation | 15 |
| Severity & Urgency | 25 |
| Support & Funding Gap | 10 |
| **TOTAL** | **100** |

Keep all scoring rules in a single typed policy configuration.

Do not hard-code scoring rules throughout components.

The same policy configuration must power:

- calculator
- score breakdown
- criteria page
- explanation page
- PDF
- report
- test fixtures

There must be one source of truth.

---

# 8. FINANCIAL NEED – 30 POINTS

## 8.1 Income-to-essential-needs gap – 15 points

Collect:

- total household monthly income
- income per household member
- income by individual household member
- income source
- stable/unstable income
- employment status
- pension
- benefits
- regular family support
- business/self-employment income
- seasonal income

Calculate monthly essential household expenditure separately:

- food
- rent
- utilities
- essential medicines
- essential transportation
- education
- caregiving
- other essential expenses

Do not count the requested one-time donation as normal household monthly expenditure.

Calculate an understandable household coverage ratio.

Example:

`coverageRatio = dependableMonthlyResources / essentialMonthlyNeeds`

Use configurable scoring bands.

Default:

| Coverage of essential monthly needs | Points |
|---|---:|
| ≥150% | 0 |
| 125–149% | 2 |
| 100–124% | 4 |
| 80–99% | 7 |
| 60–79% | 10 |
| 40–59% | 13 |
| <40% | 15 |

Allow the policy configuration to change these thresholds later.

Clearly display the calculation.

---

# 9. ASSETS AND LIQUIDITY – 7 POINTS

Collect detailed household assets.

Separate:

### Liquid/near-liquid assets

- cash
- bank balance
- savings
- investments
- easily realizable financial assets

### Physical assets

- gold
- silver
- land
- additional property
- business assets
- vehicles
- livestock
- inventory
- other valuable assets

### Essential assets

- primary residence
- essential work equipment
- essential vehicle
- basic household goods
- essential assistive devices

Do not treat all assets as equally realizable.

A primary home should not automatically be treated the same way as idle investment property.

Score based primarily on **accessible resources available to meet current essential needs**.

Use the concept:

**accessible reserves measured against essential monthly needs**

Example:

| Accessible reserve | Points |
|---|---:|
| >6 months of essential needs | 0 |
| 3–6 months | 1 |
| 1–3 months | 3 |
| 0.5–1 month | 5 |
| <0.5 month | 7 |

Where appropriate, adjust based on documented non-essential realizable assets.

Do not reward someone simply because they declare a very low asset value without verification.

---

# 10. DEBT AND FINANCIAL OBLIGATIONS – 4 POINTS

Collect:

- total outstanding debt
- monthly debt obligation
- debt type
- medical debt
- rent arrears
- utility arrears
- food debt
- essential education debt
- business debt
- informal debt
- credit card/loan debt
- interest-bearing debt if relevant to the Shariah assessment, but do not make this an automatic moral judgment in the general welfare score
- due date
- consequence of non-payment

Score based on the effect of obligations on essential household stability.

Example:

| Debt burden | Points |
|---|---:|
| None/minimal | 0 |
| <5% of dependable income | 1 |
| 5–15% | 2 |
| 15–30% | 3 |
| >30% or serious essential arrears | 4 |

Keep Zakat-specific debt treatment separate.

---

# 11. INCOME STABILITY – 4 POINTS

| Income situation | Points |
|---|---:|
| Highly stable | 0 |
| Mostly stable | 1 |
| Variable | 2 |
| Highly unstable | 3 |
| No reliable income | 4 |

Examples:

Permanent employment with predictable salary = low points.

Daily wage work with unpredictable work availability = higher points.

Unemployed household with no reliable income = maximum.

---

# 12. VULNERABILITY & DEPENDENCY – 20 POINTS

## 12.1 Functional disability – 6 points

Do not score disability purely by certificate percentage.

Capture:

- disability type
- disability percentage
- UDID/certificate status
- physical limitation
- visual limitation
- hearing limitation
- speech limitation
- intellectual/developmental disability
- psychosocial limitation where relevant
- neurological limitation
- multiple disabilities
- ability to work
- ability to perform activities of daily living
- requirement for caregiver
- additional disability-related expenses

Score functional impact:

| Functional impact | Points |
|---|---:|
| No meaningful limitation | 0 |
| Mild | 1 |
| Moderate | 3 |
| Severe | 5 |
| Profound dependence | 6 |

Record disability percentage for reference and verification.

Do NOT assume:

80% disability automatically means 8 points.

---

# 13. DEPENDENCY AND CARE BURDEN – 5 POINTS

Collect:

- household size
- number of earners
- number of non-earning dependents
- children
- elderly dependents
- disabled dependents
- chronically ill dependents
- people requiring full-time care
- caregiver availability
- caregiver employment impact

Calculate an approximate dependency burden.

Do not simply reward large families.

A large household with three earners should be treated differently from a large household with one earner.

---

# 14. AGE AND LIFE-STAGE – 3 POINTS

Age must be collected for every beneficiary.

Use:

- date of birth
- automatically calculated age
- life-stage category

Examples:

- infant
- young child
- adolescent
- young adult
- adult
- older adult

IMPORTANT:

Do NOT make the general rule:

> younger person = more valuable

and do NOT automatically give older people fewer points.

Age should contribute only where it creates an objectively relevant vulnerability, such as:

- child requiring adult protection
- elderly person without functional independence
- age-related dependency
- inability to work due to advanced age
- combination of age and lack of support

Age alone should normally contribute 0 points.

In medical cases, age must be considered through the clinical assessment described later.

---

# 15. FAMILY STRUCTURE / SOCIAL VULNERABILITY – 4 POINTS

Support circumstances include:

- orphan with no parents
- orphan with one living parent
- single-parent household
- widow/widower
- elderly person living alone
- abandoned individual
- separated family
- no legally/reliably available guardian
- dependent children without adequate caregiver
- caregiver with severe limitations

The system must prevent stacking several labels that represent the same underlying vulnerability.

For example:

“widow + female-headed household + single parent”

should not automatically receive three independent full bonuses.

Instead calculate the underlying family-support vulnerability once.

Suggested framework:

| Circumstance | Typical points |
|---|---:|
| Stable support system | 0 |
| Some limitation | 1 |
| Significant support gap | 2 |
| Single caregiver / major support burden | 3 |
| No reliable parent/guardian/support | 4 |

---

# 16. CHRONIC CARE / SAFEGUARDING – 2 POINTS

Capture:

- chronic illness
- long-term care
- recurring medication dependency
- serious mental/functional dependency where relevant
- safeguarding risk
- abuse/neglect risk
- lack of safe living environment

Do not award points merely for having a diagnosis.

Score the actual impact on vulnerability.

---

# 17. BASIC-NECESSITY DEPRIVATION – 15 POINTS

Inspired by multidimensional poverty approaches, assess several dimensions rather than relying solely on income.

## Food security – 4

Capture:

- meals per day
- reduced portions
- skipped meals
- days without adequate food
- children affected
- nutritional concerns
- food stock remaining

Suggested:

0 = adequate food  
1 = occasional reduction  
2 = regular reduction  
3 = frequent skipped meals  
4 = acute food insecurity

## Housing – 3

Capture:

- ownership/rent
- rent arrears
- eviction risk
- homelessness
- overcrowding
- unsafe structure
- weather exposure
- inadequate sleeping arrangements

## Utilities – 2

- electricity
- water
- cooking fuel
- sanitation

## Essential health/medication access – 2

- medication unavailable
- treatment interruption
- inability to afford essential care
- recurring medical expenses

## Education deprivation – 2

- child not attending school
- risk of dropout
- inability to pay essential education costs
- examination/admission barrier

Do not give automatic points for low marks.

Need, not academic prestige, is the principal concern.

## Other basic needs – 2

- clothing
- hygiene
- transportation
- menstrual hygiene
- essential household goods
- communication necessary for education/work/medical access

---

# 18. SEVERITY & URGENCY – 25 POINTS

This is intentionally high because the same financial condition can produce completely different priority depending on what happens if assistance is delayed.

## 18.1 Time urgency – 8

| Time until serious harm | Points |
|---|---:|
| >3 months | 0 |
| 1–3 months | 2 |
| 2–4 weeks | 4 |
| 1–2 weeks | 6 |
| <72 hours | 8 |

## 18.2 Consequence of no assistance – 7

| Consequence | Points |
|---|---:|
| Limited hardship | 1 |
| Moderate deterioration | 2–3 |
| Serious hardship | 4 |
| Severe/irreversible harm | 5–6 |
| Immediate threat to life, shelter, safety or essential functioning | 7 |

## 18.3 Essentiality of requested intervention – 4

Assess whether the requested item/service is:

- optional
- helpful but non-essential
- important
- essential
- critical

Do not confuse “expensive” with “important”.

## 18.4 Expected meaningful benefit from assistance – 6

This measures:

> Can the requested assistance reasonably address a meaningful part of the actual problem?

NOT:

> How much benefit can we buy for ₹1?

Do not use crude cost-effectiveness to determine whether someone is worth helping.

For medical cases, this field must be clinician-informed.

For education cases, assess probability that support allows continuation.

For livelihood cases, assess viability of restoring income.

For food/housing cases, assess whether assistance meaningfully resolves the immediate crisis.

---

# 19. SUPPORT & FUNDING GAP – 10 POINTS

## Family/community support – 3

Assess whether relatives, friends or community can realistically support the beneficiary.

Do not assume family support simply because relatives exist.

## Government/insurance/other schemes – 3

Capture:

- Ayushman Bharat/PM-JAY or applicable state schemes
- disability schemes
- pensions
- scholarships
- insurance
- hospital concessions
- government relief
- CSR support
- NGO support
- employer assistance
- educational concessions

The purpose is not to penalize applicants.

The purpose is to determine whether Il An Noor is the only realistic source of assistance.

## Remaining funding gap – 4

Capture:

- total verified requirement
- amount already available
- amount committed by others
- amount requested from Il An Noor
- minimum effective funding
- remaining gap

Compute the proportion of the verified need that remains uncovered.

---

# 20. FINAL SCORE

Implement:

Financial Need: 0–30  
Vulnerability & Dependency: 0–20  
Basic Deprivation: 0–15  
Severity & Urgency: 0–25  
Support/Funding Gap: 0–10

Final:

**0–100**

Store both:

- raw component scores
- total score
- score version
- timestamp
- calculation trace

Do not only store the final number.

---

# 21. PRIORITY BANDS

Start with:

| Score | Priority |
|---:|---|
| 85–100 | Critical |
| 70–84 | Very High |
| 55–69 | High |
| 40–54 | Moderate |
| <40 | Lower |

Label these clearly as:

**Illustrative thresholds for INBPI v0.1**

Make them configuration-driven.

Allow thresholds to change in the policy file.

Do not silently change them.

---

# 22. TARGETING THRESHOLD VS PRIORITIZATION THRESHOLD

Implement two separate thresholds.

### Targeting threshold

Example:

40+

Means the case is potentially eligible for general assistance subject to fund rules.

### Prioritization threshold

Example:

70+

Means the case falls within the highest-priority allocation group when resources are scarce.

A case can therefore be:

**Eligible but not currently prioritized**

rather than simply “Rejected”.

Create statuses:

- Not Eligible
- Eligible
- Prioritized
- Emergency Review
- Waiting List
- Needs Verification

The Foundation should be able to adjust the prioritization threshold depending on available funds.

---

# 23. EMERGENCY OVERRIDE

Create an emergency mechanism independent of normal score ranking.

Possible triggers:

- immediate threat to life
- imminent homelessness
- no essential food
- critical medication interruption
- immediate safeguarding danger
- imminent irreversible harm

Mark:

**Emergency Review Required**

Such cases must go directly to human review.

Do not allow paperwork completeness to automatically suppress genuine emergencies.

---

# 24. MEDICAL CASE MODULE

Medical cases require much more information than a normal financial-assistance case.

Create a dedicated medical assessment.

Capture:

### Patient

- age
- sex/gender where clinically relevant
- diagnosis
- date of diagnosis
- duration
- current condition
- comorbidities
- disability
- functional status

### Diagnosis

- disease category
- specific diagnosis
- stage
- severity
- complications
- acute/chronic
- stable/deteriorating
- life-threatening status

### Treatment

- treatment required
- treatment already received
- proposed intervention
- surgery
- chemotherapy
- radiotherapy
- medication
- dialysis
- hospitalization
- assistive device
- rehabilitation
- diagnostic investigation

### Clinical urgency

- immediate
- within days
- within weeks
- within months
- non-urgent

### Medical evidence

- doctor report available
- diagnosis verified
- estimate available
- hospital verification
- treating doctor
- government/insurance coverage
- hospital concession

### Clinical benefit

Require medical reviewer input:

- treatment appropriate?
- expected meaningful benefit?
- likelihood of preventing severe deterioration?
- likelihood of restoring function?
- expected survival benefit where clinically established?
- curative/palliative/supportive intent
- alternative lower-cost medically appropriate options

Do not have the software independently predict cancer survival.

Do not use an AI-generated medical prognosis.

---

# 25. CANCER CASES AND AGE

For cancer cases specifically, collect:

- age
- cancer type
- stage
- metastatic/non-metastatic status
- affected organ/system
- treatment intent
- current treatment
- proposed treatment
- performance/functional status if provided by clinician
- major comorbidities
- clinician-estimated prognosis
- treatment urgency
- expected clinical benefit
- whether treatment is potentially curative
- whether treatment is disease-controlling
- expected consequence of non-treatment

Age must be available to the reviewer but must NOT automatically produce:

20–30 years = high priority  
60+ years = low priority

Do not implement blanket age cutoffs.

Instead:

**Age may inform clinician-assessed expected benefit/prognosis where medically justified.**

Create an optional policy configuration called:

`clinicalAgePolicy`

Possible states:

- `contextualOnly` – recommended default
- `clinicianInformedModifier`
- `boardApprovedAgeModifier`

The default must be `contextualOnly`.

If a future Il An Noor policy adopts an age modifier, it must be visibly documented in the criteria page and report and have its own maximum cap.

The software should never hide age-related policy from the beneficiary.

---

# 26. EDUCATION CASE MODULE

Support:

- school
- junior college
- undergraduate
- postgraduate
- vocational education
- professional education
- examination fee
- admission fee
- tuition
- books
- uniforms
- transportation
- hostel
- assistive educational requirements

Capture:

- student age
- grade/course
- institution
- academic year
- fee amount
- deadline
- amount already paid
- scholarship
- concession
- government support
- risk of discontinuing education
- family income
- dependency
- special educational needs
- distance/transport problem

Do not treat academic marks as a person's overall deservingness.

Academic performance can be recorded but should only influence a case-specific education-benefit assessment if the Foundation formally chooses to use it.

---

# 27. FOOD / RATION CASE MODULE

Capture:

- household size
- children under five
- elderly
- disabled members
- pregnant/lactating members
- meals/day
- days of food remaining
- income
- employment interruption
- ration access
- PDS availability
- food debt
- immediate food requirement
- requested ration period

Automatically calculate food-security severity.

---

# 28. HOUSING CASE MODULE

Support:

- rent
- rent arrears
- eviction
- homelessness
- emergency repair
- unsafe housing
- temporary shelter
- flood/fire/disaster damage
- overcrowding

Capture:

- eviction date
- amount due
- current shelter
- alternative shelter
- children
- elderly
- PWD
- medical vulnerabilities
- immediate safety risk

An imminent homelessness case should be capable of entering Emergency Review.

---

# 29. DISABILITY / ASSISTIVE DEVICE MODULE

Support:

- wheelchair
- hearing device
- visual aid
- prosthesis
- mobility aid
- communication aid
- rehabilitation equipment
- other assistive device

Capture:

- disability type
- percentage
- functional limitations
- medical prescription
- current device
- replacement/repair requirement
- expected functional improvement
- cost
- government subsidy availability
- other funding

Prioritize functional necessity rather than disability label alone.

---

# 30. ELDERLY SUPPORT MODULE

Capture:

- age
- living arrangement
- spouse
- family support
- caregiver
- pension
- income
- chronic illness
- disability
- medication requirements
- mobility
- food access
- housing stability

Age alone should not generate large priority points.

The main vulnerability should come from:

- absence of support
- inability to meet essential needs
- functional limitations
- medical needs
- financial hardship.

---

# 31. ORPHAN / CHILD PROTECTION MODULE

Capture:

- age
- number of parents alive
- guardian
- guardian income
- guardian relationship
- legal guardianship where relevant
- siblings
- school attendance
- food
- shelter
- health
- safety
- caregiver capacity

Differentiate:

**No parents + no adequate guardian**

from:

**One surviving parent with stable support**

and from:

**One parent but severely deprived household**.

Do not reduce the entire case to “orphan = X points”.

---

# 32. WIDOW / SINGLE-PARENT MODULE

Capture:

- marital status
- reason for single-parent household where relevant
- number of dependents
- earning members
- income
- pension
- family support
- housing
- childcare burden
- disability
- education burden

Widowhood itself is not an automatic maximum-priority condition.

The score should come from the resulting vulnerability.

---

# 33. LIVELIHOOD / EMPLOYMENT MODULE

Support:

- job loss
- business interruption
- disability-induced loss of income
- tools/equipment requirement
- vocational training
- small business restart
- self-employment
- essential work vehicle/equipment

Capture:

- previous income
- current income
- cause of loss
- requested amount
- business model
- expected income restoration
- realistic feasibility
- alternative funding
- whether a small intervention can restore stable income

Do not maximize “return on donation”.

The case remains needs-based.

---

# 34. DEBT / DISTRESS MODULE

Capture:

- creditor
- purpose of debt
- date
- amount
- due date
- consequences
- essential vs non-essential debt
- medical/rent/food/education debt
- other support
- legal/safety consequences

Prioritize essential-distress debt over discretionary consumption debt.

Zakat eligibility must be assessed independently.

---

# 35. DISASTER / EMERGENCY MODULE

Support:

- fire
- flood
- natural disaster
- displacement
- loss of home
- loss of essential belongings
- loss of livelihood
- emergency medical needs
- food shortage
- temporary accommodation

Emergency conditions should be capable of triggering Emergency Review.

---

# 36. OTHER CASE TYPE

Allow:

**Other / Custom Case**

Require:

- description
- requested assistance
- urgency
- consequence
- financial need
- support gap
- supporting evidence
- reviewer notes

The generic severity engine must still work.

---

# 37. ZAKAT ELIGIBILITY MODULE

Zakat eligibility must be completely separate from the generic priority score.

Create:

**Zakat Assessment**

Collect:

- religion where necessary for the Zakat policy
- cash
- bank balances
- savings
- gold
- silver
- investments
- trade inventory
- receivables
- other assessable assets
- essential personal assets
- additional property
- business assets
- liabilities/debts
- other relevant deductions
- number of household members
- basic needs
- applicant's Zakat recipient category

Create a configurable Zakat policy.

Do not hard-code a simplistic:

> monthly income < Nisab = Zakat eligible

rule.

Zakat assessment may depend on wealth/assets, essential needs, liabilities and the Foundation's approved Fiqh policy.

The app should clearly label the result:

**Preliminary Zakat Assessment – Requires approved Foundation policy / scholarly review**

---

# 38. NISAB CONFIGURATION

Create a Zakat Settings section.

Support:

- silver Nisab grams
- gold Nisab grams
- silver price per gram
- gold price per gram
- currency
- effective date
- source name
- source note
- selected Nisab basis

Use:

**612.36 grams silver**

as the initial configurable silver value if that matches the Foundation's approved policy.

Do NOT hard-code a permanent rupee Nisab amount because the value of silver changes.

The system should calculate:

`Silver Nisab Value = 612.36 × configured silver price per gram`

Display:

- metal
- grams
- price/g
- calculated Nisab
- effective date
- source

Allow the Foundation to update the price manually.

Do not silently fetch live prices from an external API in this MVP.

---

# 39. ZAKAT AND GENERAL WELFARE MUST REMAIN DISTINCT

The dashboard should classify each case as potentially eligible for:

- Zakat
- Sadaqah/General Welfare
- Medical Fund
- Education Fund
- Emergency Fund
- Other Restricted Fund

Do not assume that a person eligible for one fund is automatically eligible for another.

Create fund-specific eligibility rules in configuration.

---

# 40. CASE INTAKE WORKFLOW

Create a polished multi-step assessment wizard.

Suggested flow:

### Step 1
Case registration

### Step 2
Beneficiary profile

### Step 3
Household composition

### Step 4
Financial assessment

### Step 5
Assets and liabilities

### Step 6
Vulnerability

### Step 7
Basic deprivation

### Step 8
Case-specific module

### Step 9
Support and alternative funding

### Step 10
Zakat assessment if applicable

### Step 11
Verification

### Step 12
Review

### Step 13
Score and recommendation

### Step 14
Final decision

Do not show irrelevant questions.

Use conditional logic.

For example:

If Case Type = Medical:

show Medical Assessment.

If disability = Yes:

show Disability Assessment.

If children exist:

show child-related fields.

If Zakat assessment selected:

show Zakat module.

If housing crisis:

show housing module.

---

# 41. UX FOR DATA ENTRY

Make the wizard extremely easy for staff.

Requirements:

- clear progress indicator
- section names
- save automatically
- save draft
- continue later
- previous/next navigation
- review before finalization
- keyboard support
- clear error messages
- inline validation
- human-friendly descriptions
- information tooltips
- examples for difficult fields
- “Why are we asking this?” expandable explanation

Avoid giant forms.

Use progressive disclosure.

Use cards and grouped sections.

Avoid unnecessary animations.

---

# 42. SCORE PREVIEW

As staff enter data, provide a non-intrusive score preview.

Show:

**Current Priority**

`72 / 100`

and:

Financial Need `23/30`  
Vulnerability `16/20`  
Basic Deprivation `12/15`  
Severity/Urgency `14/25`  
Support Gap `7/10`

But clearly label:

**Score is provisional until assessment is complete and verified.**

Allow the reviewer to expand each component.

---

# 43. SCORE EXPLANATION / TRACE

Every individual scoring decision must be explainable.

For example:

> Financial Need: 23/30  
> Household income covers approximately 55% of essential monthly needs: +13  
> Accessible reserves cover less than one month: +5  
> Debt burden: +2  
> Income instability: +3

Another:

> Vulnerability: 16/20  
> Severe functional disability: +5  
> High dependency burden: +4  
> No reliable caregiver: +4  
> Age-related vulnerability: +1  
> Chronic care requirement: +2

The score engine must return a machine-readable trace:

```text
criterionId
criterionName
answer
points
maxPoints
explanation
source/policyReference
```

This trace powers both UI and PDF.

---

# 44. VERIFICATION SYSTEM

Each important field should optionally have:

- self-reported
- document verified
- field verified
- third-party verified
- pending verification

Create a verification checklist.

Example:

Financial:

☐ Income verified  
☐ Bank/asset information verified  
☐ Household members verified  
☐ Expense claims reviewed

Medical:

☐ Diagnosis verified  
☐ Hospital report verified  
☐ Cost estimate verified  
☐ Doctor information verified

Do not deduct score because documents are unavailable.

Instead display:

**Verification confidence: Low / Medium / High**

as a separate dimension.

---

# 45. DATA COMPLETENESS SCORE

Create a separate indicator:

**Assessment Completeness**

For example:

`92% complete`

This must NOT be part of the beneficiary priority score.

Use it only to determine whether:

- assessment is provisional
- more information is required
- case is ready for decision

---

# 46. DUPLICATE CASE DETECTION

Because the system is local-only, implement local duplicate detection.

Compare:

- beneficiary name
- phone
- household members
- case type
- approximate date
- address
- previous case history

Do not claim this is a perfect duplicate detector.

Show:

**Possible duplicate**

and allow the reviewer to inspect.

---

# 47. CASE HISTORY

Each beneficiary should be able to have multiple cases over time.

For example:

Beneficiary A

2026:
Medical case – ₹40,000

2027:
Education support

2028:
Medical recurrence

Do not overwrite historical assessments.

Create new assessment versions.

Record:

- case ID
- assessment date
- policy version
- score at time of assessment
- decision
- amount approved
- amount disbursed
- current status
- reassessment date

---

# 48. REASSESSMENT

Allow:

**Reassess Case**

This creates a new assessment version.

Show:

Previous Score: 61  
New Score: 82

and identify what changed.

For example:

Income decreased  
Medical severity increased  
Support disappeared

This is important because vulnerability is time-sensitive.

---

# 49. CASE STATUSES

Implement:

- Draft
- Submitted
- Under Review
- Needs Verification
- Verified
- Assessment Complete
- Emergency Review
- Ready for Decision
- Approved
- Partially Approved
- Waitlisted
- Rejected
- Deferred
- Assistance Disbursed
- Closed
- Reassessment Due

---

# 50. ALLOCATION DASHBOARD

Create a dedicated:

**Priority Queue**

Display all eligible cases sorted by priority.

Columns:

- rank
- case ID
- beneficiary
- case type
- score
- priority band
- financial need
- urgency
- vulnerability
- requested amount
- minimum effective amount
- fund eligibility
- verification status
- status

Filters:

- priority
- score range
- case type
- fund
- medical
- emergency
- Zakat eligible
- verification status
- age group
- disability
- orphan
- elderly
- geographic area
- amount requested
- status

---

# 51. COMPARISON MODE

Allow staff to select 2–5 cases.

Create:

**Compare Cases**

Display side-by-side:

- score
- financial need
- vulnerability
- deprivation
- severity
- support gap
- requested amount
- minimum effective amount
- fund eligibility
- verification
- major reasons for priority

Make the explanation neutral.

Example:

> Case A scores 8 points higher primarily because of greater financial deprivation, lack of caregiver support and higher urgency.

Do not write:

> Case A is more deserving.

---

# 52. TIE HANDLING

Do not pretend:

81.3

is meaningfully different from:

81.5

Create a tie band such as:

**Within 2 points = substantively similar priority**

Tie-break sequence:

1. Emergency status
2. Urgency
3. vulnerability
4. verified need
5. due date
6. human review
7. random selection/lottery where cases are genuinely indistinguishable and the Foundation's policy permits it

Document the tie-break mechanism.

---

# 53. ALLOCATION PLANNER

Create a budget planning screen.

Staff can enter:

Available Zakat Fund: ₹____  
Available Medical Fund: ₹____  
Available Education Fund: ₹____  
Available General Fund: ₹____

The application should show:

- available funds
- eligible cases
- total requested amount
- total minimum effective amount
- recommended allocation
- remaining budget

Allow:

**Full funding**

**Partial funding**

**Waitlist**

Do not automatically reject lower-ranked cases simply because the budget has been exhausted.

Show:

> Eligible but currently not prioritized due to current budget

where applicable.

---

# 54. MINIMUM EFFECTIVE GRANT

Every case that requests money should have:

- requested amount
- verified requirement
- minimum amount that produces meaningful benefit
- recommended amount
- remaining requirement

For example:

Treatment cost: ₹1,00,000  
Other support: ₹40,000  
Remaining gap: ₹60,000  
Minimum effective Il An Noor contribution: ₹25,000

This allows the committee to make partial awards intelligently.

Do NOT use:

> “₹1 spent here gives more value than ₹1 spent there”

as the fundamental deservingness criterion.

---

# 55. HUMAN DECISION SCREEN

Before final decision, show:

## Case Summary

## Priority Score

## Score Breakdown

## Verification

## Zakat Status

## Requested Amount

## Minimum Effective Amount

## Other Funding

## Recommended Action

Possible decisions:

- Approve full
- Approve partial
- Waitlist
- Decline
- Request more information
- Emergency escalation

Require:

**Decision reason**

for every final decision.

---

# 56. OVERRIDE SYSTEM

If reviewer changes the recommended priority or allocation, require:

- override selected
- reason
- reviewer
- timestamp

Example:

> “Score 68 but escalated because hospital treatment will be discontinued within 24 hours. Emergency committee approval.”

Never modify the underlying calculated score.

Instead retain:

**Calculated score = 68**

**Final committee priority = Emergency**

This preserves auditability.

---

# 57. APPEAL / RECONSIDERATION

Create:

**Request Reassessment**

Store:

- appeal date
- appeal reason
- disputed information
- new information
- reviewer
- decision
- reason

The system must support revising decisions.

Do not erase the original assessment.

---

# 58. TRANSPARENCY / CRITERIA PAGE

This is a major part of the application.

Create:

`/criteria`

The page must explain the entire evaluation framework in simple language.

Include:

### What is INBPI?

### Why Il An Noor uses it

### How the 100 points work

### Financial Need – 30

Detailed scoring method.

### Vulnerability – 20

### Basic Deprivation – 15

### Severity & Urgency – 25

### Support Gap – 10

### How medical cases are assessed

### How disability is assessed

### How age is treated

### How orphan/widow/elderly cases are handled

### How assets are considered

### Zakat eligibility is separate

### What information is not used

Explicitly state that the Foundation does not score:

- wealth/status as social worth
- political affiliation
- donor connections
- who referred the applicant
- social media influence
- English proficiency
- personal relationships with staff
- arbitrary religious preference in general welfare scoring
- caste
- race
- ethnicity
- irrelevant personal characteristics

The public criteria page must explain what is considered and why.

---

# 59. BENEFICIARY TRANSPARENCY VIEW

Create:

**Beneficiary Transparency Report**

It should show a simple explanation:

Your assessment was based on:

Financial Need: 21/30  
Vulnerability: 15/20  
Basic Needs: 11/15  
Urgency: 18/25  
Support Gap: 7/10

Total:

**72/100**

Then explain:

> Your case received 21 points for financial need because household resources were assessed against essential household expenses and available assets.

Provide expandable details.

Do not show private internal notes.

Do not show information about other beneficiaries.

Do not expose internal fraud/suspicion flags.

---

# 60. DOWNLOADABLE PDF REPORTS

Implement at least three PDF types.

## A. Internal Assessment Report

Include:

- Il An Noor branding
- report title
- case ID
- assessment date
- policy version
- beneficiary summary
- household
- financial assessment
- assets
- debt
- vulnerability
- basic deprivation
- case-specific assessment
- medical/education details if applicable
- Zakat assessment
- verification status
- score breakdown
- exact calculation trace
- priority band
- requested amount
- minimum effective amount
- recommendation
- decision
- reviewer notes
- override reason
- signatures/approval fields

## B. Beneficiary Transparency Report

Include:

- beneficiary summary
- applicable assessment criteria
- score
- score breakdown
- explanation
- priority band
- general decision
- appeal/reassessment information

Exclude internal notes and sensitive internal review information.

## C. Criteria & Methodology PDF

A standalone document that explains:

- entire scoring system
- all dimensions
- point ranges
- examples
- Zakat separation
- medical assessment
- age policy
- verification
- appeals
- limitations of the score

The criteria PDF should be shareable with beneficiaries and donors.

Use `@react-pdf/renderer`.

PDF generation must happen client-side.

Make sure PDFs use local fonts/assets wherever possible.

Use proper page headers, footers, page numbering and tables.

---

# 61. DASHBOARD HOME

Create a clean dashboard.

Cards:

**Total Cases**

**Critical Cases**

**Very High Priority**

**Needs Verification**

**Zakat Eligible**

**Awaiting Decision**

**Total Requested**

**Currently Allocatable**

Charts:

- cases by priority
- cases by category
- cases by fund
- average score
- requests by amount
- approved vs waitlisted
- vulnerability distribution

Do not make the dashboard visually overwhelming.

---

# 62. FUND DASHBOARD

Create:

`/funds`

Funds:

- Zakat
- General Welfare
- Medical
- Education
- Emergency
- Custom

Each fund displays:

- available budget
- number of eligible cases
- total requested
- total minimum effective requirement
- top priority cases
- waiting cases
- allocation status

Do not execute actual payments.

This is an allocation-planning application.

---

# 63. POLICY / METHODOLOGY VERSIONING

Create:

`/policy`

Display:

**INBPI v0.1 Draft**

with:

- effective date
- last updated
- methodology description
- weight configuration
- thresholds
- Zakat policy version
- age policy
- medical policy
- notes

Every completed assessment stores:

**Policy version used**

Therefore future policy changes do not retroactively change old reports.

A historical case must always be reproducible using its original policy version.

---

# 64. POLICY SHOULD BE CONFIG-DRIVEN

Create a central structure such as:

`src/lib/policy/scoringPolicy.ts`

with definitions for:

- dimensions
- criteria
- weights
- bands
- thresholds
- scoring options
- explanations
- labels
- version
- effective date

The criteria page should render from this configuration.

The score engine should calculate from this configuration.

The PDF methodology report should render from this configuration.

This ensures:

**Displayed methodology = actual algorithm**

and eliminates inconsistencies between UI and scoring.

---

# 65. PURE SCORING ENGINE

Create:

`src/lib/scoring/`

with pure functions.

For example:

`calculateFinancialScore()`

`calculateVulnerabilityScore()`

`calculateDeprivationScore()`

`calculateSeverityScore()`

`calculateSupportGapScore()`

`calculateTotalScore()`

`calculatePriorityBand()`

`calculateZakatAssessment()`

`buildScoreTrace()`

The scoring engine must have no UI dependencies.

Do not place scoring calculations directly inside React components.

---

# 66. SCORE ENGINE INVARIANTS

Implement safeguards:

- score never below 0
- score never above 100
- each dimension never exceeds its maximum
- invalid numeric values rejected
- disability percentage restricted to 0–100
- age restricted to reasonable bounds
- income cannot be negative
- asset values cannot be negative
- dates validated
- total household members must match member entries where required
- score cannot become NaN
- missing answers cannot silently become maximum points

---

# 67. DATA QUALITY WARNINGS

Detect anomalies such as:

- income = ₹0 but very large liquid assets
- income = ₹5,000 but essential expenses = ₹1,00,000
- household size = 1 but five dependents entered
- disability = 150%
- age = 250
- medical case with no diagnosis
- medical bill = 0 but request = ₹5,00,000
- requested amount greater than verified requirement without explanation
- asset totals not matching asset components
- duplicate household members
- inconsistent dates

Display:

**Data Quality Warning**

Do not automatically accuse the beneficiary of fraud.

Use neutral language.

---

# 68. FRAUD / INCONSISTENCY FLAGGING

Create a separate internal field:

**Verification / Inconsistency Flags**

Examples:

- conflicting income information
- duplicate case
- missing medical documentation
- inconsistent household data
- asset information requires verification

These flags must:

- NOT automatically reduce the beneficiary's priority score
- NOT be shown in the beneficiary transparency report
- require human investigation

This separates:

**Need**

from:

**Verification confidence**

---

# 69. FAIRNESS CONTROLS

Build a dedicated internal:

`/audit`

page.

Show:

- score distribution
- average score by case type
- average score by vulnerability type
- approval rates
- rejection rates
- override rates
- average assistance amount
- average waiting time
- appeal rates
- verification failure rates

Allow comparison of results across different groups without using protected characteristics as arbitrary allocation criteria.

The purpose is to detect unintended bias.

---

# 70. SENSITIVITY ANALYSIS

Create an internal:

**Policy Simulator**

Allow authorized users to test hypothetical weight changes.

Example:

Financial: 30 → 25  
Vulnerability: 20 → 25

Then show:

- current ranking
- simulated ranking
- cases moving up/down
- largest changes
- whether critical cases remain critical

Do not change the official policy from the simulator.

Make it explicitly:

**Simulation Only**

---

# 71. HISTORICAL CASE TESTING SCREEN

Create a developer/internal tool:

**Scenario Tester**

Include predefined synthetic examples.

At minimum:

### Case 1
Low income only.

### Case 2
Same income + severe disability.

Case 2 should normally score higher.

### Case 3
Widow with stable income and support.

### Case 4
Widow with low income, dependents and no support.

Case 4 should be substantially higher.

### Case 5
Orphan with capable guardian.

### Case 6
Orphan with no parents and no reliable guardian.

Case 6 should be higher.

### Case 7
Elderly person with family support.

### Case 8
Elderly person living alone, no income, dependent on neighbours.

Case 8 should be higher.

### Case 9
Cancer patient, younger, medically treatable.

### Case 10
Cancer patient, older, medically treatable.

The score should depend primarily on clinical facts and need, not a simple age preference.

### Case 11
Cancer patient, young but treatment has extremely low expected meaningful benefit.

### Case 12
Cancer patient, older but treatment has strong expected benefit and severe financial deprivation.

Ensure the system does not blindly rank younger age above medically stronger cases.

### Case 13
High income + high assets + medical request.

Should not automatically rank highly merely because the case is medical.

### Case 14
Very low income + severe food insecurity.

Should rank highly even without disability.

### Case 15
Large family with several earners.

Do not automatically classify as highly vulnerable.

### Case 16
One earning member + six dependents.

Should reflect high dependency.

### Case 17
Low income but substantial liquid savings.

Should not receive the same financial score as a household with no reserves.

### Case 18
Medical emergency requiring help within 48 hours.

Emergency status should be visible.

### Case 19
Non-urgent expensive elective request.

Should have much lower urgency.

### Case 20
Identical cases entered by two users.

Must produce identical scores.

---

# 72. UNIT TEST COVERAGE

Write extensive tests around every criterion.

Test:

- boundary values
- missing values
- zeros
- maximum values
- invalid values
- combined vulnerabilities
- conflicting information
- policy versioning
- Zakat calculations
- priority bands
- tie detection
- emergency override
- provisional scoring

The scoring engine must have strong automated coverage.

---

# 73. END-TO-END TESTS

Use Playwright to test:

- create case
- save draft
- reload browser
- resume case
- complete assessment
- calculate score
- review score
- save decision
- search case
- filter queue
- compare cases
- export case
- import backup
- download PDF
- open criteria
- use mobile viewport
- lock/unlock local vault
- delete a case
- reassess a case

---

# 74. ACCESSIBILITY

Target WCAG 2.2 AA.

Requirements:

- semantic HTML
- correct labels
- keyboard navigation
- visible focus states
- screen-reader-friendly controls
- sufficient contrast
- proper error messages
- accessible dialogs
- accessible tables
- no information conveyed by colour alone
- form instructions
- error summaries
- review before finalization

Do not use tiny text.

Do not rely on icons without accessible labels.

---

# 75. RESPONSIVE DESIGN

The primary users may use:

- desktop
- laptop
- tablet
- Android phones

The system must be genuinely mobile responsive.

On mobile:

- cards become single-column
- sticky bottom navigation can be used
- long tables become horizontal scroll or card views
- score card remains prominent
- filters become drawers
- wizard controls are easy to tap

Do not simply shrink a desktop UI.

---

# 76. VISUAL DESIGN

The application should look like a serious humanitarian/institutional system.

Do NOT make it look like generic AI-generated SaaS.

Avoid:

- excessive gradients
- excessive glassmorphism
- oversized decorative illustrations
- unnecessary animations
- neon colours
- excessive cards inside cards
- dashboard clutter
- meaningless 3D elements
- fake AI branding

Prioritize:

- calm typography
- strong hierarchy
- generous whitespace
- clear tables
- readable forms
- restrained use of colour
- understandable status badges
- visual grouping
- humane tone

The interface should communicate:

**dignity + fairness + trust + clarity**

rather than “financial scoring machine”.

---

# 77. SEARCH AND CASE MANAGEMENT

Implement global case search by:

- case ID
- beneficiary name
- phone
- household member
- case type

Add filters:

- date
- score
- band
- status
- fund
- Zakat
- medical
- emergency
- verification
- disability
- orphan
- widow
- elderly

Sorting:

- highest priority
- lowest priority
- newest
- oldest
- urgency
- requested amount
- case deadline

---

# 78. IMPORT / EXPORT

Because there is no database, this is essential.

Implement:

**Export All Data**

Generate a structured JSON backup.

Implement:

**Import Data**

Validate schema before importing.

Support:

- duplicate handling
- overwrite vs merge
- preview before import
- import summary
- rejected records report

Also provide:

**Export Selected Cases**

and:

**Export Case as JSON**

Do not expose the data in the URL.

---

# 79. BACKUP UX

Dashboard should show:

**Last backup: Never**

or:

**Last backup: 5 October 2026**

Show:

**Backup recommended**

if the user has not exported recently.

Do not send backups anywhere automatically.

---

# 80. BENEFICIARY PRIVACY INFORMATION

Create a privacy page.

Explain plainly:

- what information is collected
- why it is collected
- how it is used for assessment
- that the MVP stores data locally on the device
- that the Foundation should use approved secure devices
- that reports contain sensitive information
- that reports should not be shared unnecessarily
- how to delete local data
- how to make a correction/reassessment request

Do not make legal claims that the app is automatically legally compliant.

Instead say the implementation should be reviewed against applicable Indian privacy requirements before operational deployment.

---

# 81. INFORMATION / HELP SYSTEM

Each complex section should have:

**Why are we asking this?**

Example:

> We ask about household assets to understand whether the family has accessible resources that can reasonably meet the current need. Essential household assets are treated differently from realizable surplus assets.

For disability:

> Disability percentage is recorded for reference and verification. Priority primarily considers how the disability affects daily functioning, work capacity, care requirements and household vulnerability.

For age:

> Age may be relevant to life-stage vulnerability or medical assessment, but age alone does not determine a person's priority.

For Zakat:

> Zakat eligibility is assessed separately from the general humanitarian priority score according to the Foundation's approved Shariah policy.

---

# 82. PUBLIC CRITERIA FAQ

Create FAQ questions such as:

**Why does Il An Noor use a score?**

**Does a higher score guarantee donation?**

**Can two people with the same income have different scores?**

**Why do you ask about assets?**

**Does being a widow automatically give points?**

**Does disability percentage determine priority?**

**Why is age collected?**

**Does being younger guarantee higher medical priority?**

**How are cancer cases evaluated?**

**Does being Zakat eligible automatically mean I receive Zakat?**

**What happens if I disagree with my assessment?**

**Can my case be reassessed?**

---

# 83. REPORT LANGUAGE

The application must not use demeaning words such as:

- deserving poor
- undeserving poor
- useless case
- low-value beneficiary
- financially useless
- worthless treatment

Use neutral language:

- priority
- vulnerability
- unmet need
- assistance requirement
- verified need
- urgency
- support gap
- assessment
- eligibility
- recommendation

The purpose is to preserve beneficiary dignity.

---

# 84. SCORE LIMITATIONS PAGE

The application must explicitly state:

> The Priority Index is a structured decision-support tool. It does not determine a person's value, dignity or entitlement by itself. It uses available information to support consistent allocation decisions when resources are limited. Human review remains necessary.

Also explain:

- self-reported data can be incomplete
- verification affects confidence
- weights reflect Foundation policy
- policy may change
- thresholds may change with funding availability
- medical assessments require qualified professionals
- Zakat requires approved scholarly policy

---

# 85. MOBILE-FIRST QUICK ASSESSMENT

Provide an optional:

**Quick Assessment**

for first-level screening.

This can capture:

- household size
- total income
- assets
- age
- key vulnerability
- urgent need
- case type
- amount required
- Zakat possibility

Then:

**Complete Full Assessment**

for detailed cases.

Quick Assessment must clearly say:

**Preliminary screening only. Not a final priority score.**

---

# 86. STAFF DASHBOARD SHORTCUTS

Provide:

**New Beneficiary**

**New Medical Case**

**New Zakat Assessment**

**Priority Queue**

**Needs Verification**

**Emergency Cases**

**Compare Cases**

**Allocation Planner**

**Criteria**

**Reports**

**Settings**

---

# 87. COMMAND / QUICK SEARCH

On desktop, optionally implement a command palette:

Ctrl/Cmd + K

Actions:

- New case
- Search case
- Open priority queue
- Open criteria
- Open allocation planner
- Export backup
- Open settings

Keep it simple.

---

# 88. EMPTY STATES

Make empty states useful.

Example:

> No Critical cases

rather than an empty white screen.

Example:

> No cases are waiting for verification. All currently assessed cases have completed the required verification steps.

---

# 89. ERROR HANDLING

Never display technical messages such as:

> Cannot read property 'score' of undefined

to staff.

Show:

> We could not complete this calculation because some required information is missing. Please review the highlighted fields.

Log technical errors only locally and without beneficiary data where possible.

---

# 90. DEMO DATA

Create a clearly separated:

**Demo Mode**

with fictional beneficiaries.

Never mix demo cases with real local cases.

Make fictional data obviously synthetic.

Do not use real names or real medical cases.

---

# 91. SAMPLE DATA FOR DEMONSTRATION

Include 10–15 fictional cases covering:

- low-income family
- PWD
- orphan
- widow
- elderly person
- medical emergency
- cancer case
- education
- food insecurity
- housing crisis
- livelihood
- assistive device
- Zakat-eligible case

Use fictional names and obviously fictional data.

---

# 92. FILE / PROJECT STRUCTURE

Use a clean structure such as:

```text
src/
  app/
    page.tsx
    cases/
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx
        report/
          page.tsx
    queue/
      page.tsx
    compare/
      page.tsx
    funds/
      page.tsx
    criteria/
      page.tsx
    policy/
      page.tsx
    audit/
      page.tsx
    settings/
      page.tsx
    help/
      page.tsx

  components/
    dashboard/
    cases/
    assessment/
    scoring/
    reports/
    criteria/
    funds/
    common/
    ui/

  lib/
    scoring/
    policy/
    storage/
    validation/
    pdf/
    security/
    utils/

  types/
    beneficiary.ts
    assessment.ts
    household.ts
    scoring.ts
    zakat.ts
    decision.ts
    policy.ts
```

Adapt this if a better architecture is justified.

---

# 93. CORE DATA TYPES

Design structured types around:

### BeneficiaryCase

- id
- createdAt
- updatedAt
- status
- primaryBeneficiary
- household
- caseType
- requestedAmount
- minimumEffectiveAmount
- fundingSources
- assessment
- verification
- zakatAssessment
- calculatedScore
- scoreTrace
- priorityBand
- policyVersion
- decisionHistory
- reassessmentHistory

### HouseholdMember

- id
- name
- relationship
- age/DOB
- gender where relevant
- employment
- monthly income
- disability
- dependency
- education status
- chronic care needs

### FinancialProfile

- totalIncome
- incomeSources
- essentialExpenses
- assets
- debts
- incomeStability

### VulnerabilityProfile

- disability
- dependency
- caregiver
- familyStructure
- ageRelatedVulnerability
- chronicCare
- safeguarding

### DeprivationProfile

- food
- housing
- utilities
- health
- education
- hygiene/transport/clothing

### CaseNeed

- urgency
- severity
- consequence
- essentiality
- expectedBenefit
- requestedAmount
- minimumEffectiveAmount

### SupportGap

- familySupport
- governmentSupport
- insurance
- otherNGOS
- otherFunding
- remainingGap

### ZakatAssessment

- assessableAssets
- liabilities
- netAssessableWealth
- nisab
- nisabBasis
- recipientEligibility
- scholarlyReviewStatus

### Decision

- recommendation
- finalDecision
- approvedAmount
- reason
- override
- reviewer
- timestamp

---

# 94. CRITERIA AS DATA

Do not hard-code labels in multiple files.

Use structured configuration:

```text
dimension
criterion
maxPoints
question
answerOptions
pointMapping
description
whyItMatters
verificationRequirement
applicableCaseTypes
```

The criteria page should automatically render these.

The score breakdown should use these.

The PDF methodology should use these.

This is essential.

---

# 95. ZAKAT POLICY MUST ALSO BE CONFIGURABLE

Create:

`src/lib/policy/zakatPolicy.ts`

Include:

- Nisab basis
- asset types
- deductions
- recipient eligibility rules
- approved categories
- required reviewer
- effective date
- version

Do not pretend the generic welfare score determines whether Zakat is Shariah-valid.

---

# 96. FUTURE DATABASE MIGRATION

Design the repository layer so later it can be replaced with:

- PostgreSQL
- MongoDB
- Supabase
- Firebase
- another secure backend

without rewriting:

- scoring
- forms
- reports
- criteria
- data model

The app should be local-first now but backend-ready later.

---

# 97. FUTURE MULTI-USER ARCHITECTURE

Do not implement authentication now.

However, document future roles:

- Assessment Volunteer
- Verifier
- Medical Reviewer
- Zakat Reviewer
- Committee Member
- Finance Officer
- Administrator

Document future permissions.

Do not fake multi-user security in the local-only MVP.

---

# 98. FUTURE AI

Do NOT make the current score dependent on AI.

Future AI can potentially assist with:

- extracting structured information from documents
- summarizing long medical reports
- identifying missing fields
- translating beneficiary statements
- detecting duplicate narratives
- suggesting clarification questions

But AI must never silently determine the final beneficiary priority.

When AI is eventually introduced, preserve:

- human oversight
- explainability
- source traceability
- privacy
- ability to override
- audit logs

---

# 99. IMPORTANT POLICY GOVERNANCE

The application should prominently state that the initial weights are a **draft policy**.

Before live use, Il An Noor should test the framework against historical and synthetic cases.

Create a methodology note inside the app explaining:

1. Collect representative historical cases.
2. Score them using the proposed model.
3. Have independent reviewers assess the same cases.
4. Compare system ranking with expert consensus.
5. Investigate unexpected results.
6. Identify double-counting.
7. Identify cases the model unfairly pushes down.
8. Adjust weights.
9. Repeat sensitivity analysis.
10. Approve the policy.
11. Version it.
12. Pilot it.
13. Review outcomes periodically.

Do not claim that the first version is mathematically perfect.

---

# 100. FAIRNESS TESTING

Create test scenarios specifically designed to catch bias.

Examples:

### Income test

Two families with identical income but different household sizes.

### Asset test

Same income, but one has significant liquid savings.

### Disability test

Same poverty level, with and without significant functional disability.

### Orphan test

Two orphan cases with different guardian situations.

### Widow test

Widow with high stable income vs widow with no income.

### Elderly test

Older person with full family support vs older person living alone.

### Medical age test

Younger low-benefit case vs older high-benefit case.

### Documentation test

Same underlying case with complete documentation vs incomplete documentation.

Documentation should change verification status, not automatically destroy the need score.

---

# 101. SENSITIVITY / ROBUSTNESS REQUIREMENT

The final application must allow the Foundation to identify:

- which criteria have the greatest influence
- which cases are near the cutoff
- which cases would move tiers under reasonable weight changes

Show:

**Near Threshold**

for cases within a configured number of points of a threshold.

For example:

`68`

with prioritization threshold `70`

should show:

**Near priority threshold**

rather than treating 68 and 69 as fundamentally different from 70.

---

# 102. NO AUTOMATIC REJECTION BASED ON SCORE ALONE

A score below the prioritization threshold should mean:

**Not currently prioritized**

not:

**Person does not deserve assistance**

Allow committee review.

This is especially important during emergencies or when unusual circumstances exist.

---

# 103. DECISION EXPLANATION

When finalizing a decision, generate a clear explanation.

For example:

> The case received a Very High Priority score primarily because of severe financial hardship, high caregiver dependency, acute medical urgency and limited alternative funding. The committee approved ₹35,000 as this was the minimum verified amount required to address the immediate treatment gap.

Allow reviewers to edit the explanation.

Do not generate manipulative or emotionally exaggerated language.

---

# 104. PDF DESIGN

Make reports professional enough to be used in committee meetings.

Use:

- clear title
- case ID
- date
- policy version
- section numbering
- tables
- score visualization
- page numbers
- footer
- confidentiality label

Example:

**IL AN NOOR FOUNDATION**

**Beneficiary Priority Assessment**

**INBPI v0.1**

Do not expose raw internal storage keys in reports.

---

# 105. REPORT REPRODUCIBILITY

Every report should contain:

**Assessment Policy: INBPI v0.1**

**Assessment Date**

**Calculation Date**

**Zakat Policy Version**

This allows future reviewers to understand how the score was produced.

---

# 106. CRITERIA PDF

Create an attractive but simple methodology document.

Include:

1. Purpose
2. Philosophy
3. 100-point model
4. Financial scoring
5. Vulnerability scoring
6. Deprivation scoring
7. Severity scoring
8. Support gap
9. Zakat eligibility
10. Medical assessment
11. Age policy
12. Verification
13. Appeals
14. Human review
15. Limitations

Also include representative examples.

---

# 107. BENEFICIARY-FACING LANGUAGE

Keep the public methodology understandable to an ordinary person.

Instead of:

> socioeconomic vulnerability index

say:

> We assess financial hardship, family responsibilities, basic needs, urgency, health-related needs and access to other support.

Technical terminology can appear in detailed sections.

---

# 108. PRINTABILITY

Every major page must be printable.

Provide:

**Print Assessment**

**Print Criteria**

**Print Queue**

where appropriate.

PDF is preferred for official reports.

---

# 109. NO SERVER DEPENDENCY

After the static application is loaded, the core workflow should continue functioning without an API.

The application should be usable for:

- data entry
- calculation
- search
- scoring
- criteria
- PDF generation
- export/import

without needing a server database.

---

# 110. OFFLINE / PWA READINESS

Prepare the application for future PWA installation.

At minimum:

- manifest
- app icons
- offline architecture considerations
- local-first storage

Do not claim full offline functionality until it has actually been tested.

---

# 111. PERFORMANCE

The app should remain responsive with at least:

- 500 cases
- 1,000 cases
- 5,000 cases

stored locally.

Use:

- memoization
- efficient filtering
- pagination/virtualization where required
- debounced search

Do not render 5,000 large cards simultaneously.

---

# 112. PDF PERFORMANCE

Reports will generally be small.

For large PDFs or bulk report generation, avoid blocking the UI.

Keep PDF generation modular so a Web Worker can be introduced later.

---

# 113. DATE AND CURRENCY HANDLING

Default:

**Indian Rupee (₹)**

Use:

`Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`

Support:

- lakh formatting
- crore formatting where useful
- exact numeric values
- Indian date format where appropriate

Do not store formatted currency strings as the actual numerical value.

---

# 114. FORM VALIDATION

Use Zod schemas.

Validate:

- required fields
- numeric boundaries
- conditional fields
- household consistency
- medical requirements
- Zakat fields
- dates
- phone number format
- percentages

Errors should identify:

1. what is wrong
2. where it is wrong
3. how to fix it

---

# 115. AUTOSAVE

Autosave drafts locally.

Show:

**Saved just now**

or:

**Saved 30 seconds ago**

Never lose completed assessment data because of navigation.

Before leaving a partially completed form, preserve state.

---

# 116. CONFIRMATION BEFORE FINAL DECISION

Before final submission show:

**Review Assessment**

A full summary must be displayed.

Allow corrections.

Do not force the user to submit irreversible data without confirmation.

---

# 117. NO SECRET SCORING

The criteria page, assessment screen and report must make the scoring methodology discoverable.

Do not hide points in JavaScript.

Do not have undocumented bonuses.

Do not use “magic numbers”.

Every score contribution must correspond to a visible policy rule.

---

# 118. NO MANIPULATIVE LANGUAGE

The application should never encourage staff to exaggerate cases to increase scores.

Make staff guidance explicit:

> Enter the best available verified information accurately. Do not adjust information to obtain a desired priority score.

---

# 119. ALLOCATION QUEUE EXPLANATION

For every ranked case provide:

**Why this case is here**

with the top contributing factors.

Example:

> High financial deprivation  
> High dependency  
> Immediate medical urgency  
> Limited alternative funding

Do not rank cases based solely on one factor.

---

# 120. CASE DETAIL PAGE

The case detail page should have:

### Header

Beneficiary name  
Case ID  
Status  
Priority  
Score

### Tabs

Overview  
Household  
Financial  
Vulnerability  
Need  
Verification  
Zakat  
Score Breakdown  
Decision History  
Reports

On mobile, convert tabs into a horizontal scroll or dropdown.

---

# 121. SETTINGS

Settings should contain:

General  
Foundation information  
Currency  
Policy version  
Priority thresholds  
Zakat settings  
Privacy/vault  
Backup  
Import/export  
Demo mode  
About

Do not allow arbitrary staff to edit official scoring weights without clearly marking them as policy configuration.

---

# 122. ABOUT SCREEN

Display:

**Il An Noor Foundation**

**Beneficiary Evaluation & Priority System**

**INBPI v0.1**

Explain:

> This application helps the Foundation apply a structured and transparent approach when resources are limited. The system supports human decision-making and does not replace the Foundation's committee, medical professionals or Shariah advisors.

---

# 123. ACCEPTANCE CRITERIA

The build is not complete until all of the following work.

### Functional

- new case can be created
- conditional forms work
- autosave works
- local persistence works
- score calculates correctly
- score breakdown is explainable
- priority band works
- Zakat assessment works independently
- case queue works
- filters work
- search works
- comparisons work
- budget planner works
- final decision works
- reassessment works
- export/import works
- PDF works
- criteria page works
- transparency report works

### Quality

- TypeScript has no avoidable errors
- lint passes
- production build passes
- unit tests pass
- end-to-end tests pass
- no hydration problems
- no major accessibility violations
- mobile layout works
- desktop layout works

### Fairness

- no undocumented score contributions
- no arbitrary category stacking
- no automatic age discrimination
- no score reduction for missing documents
- no hidden AI scoring
- human overrides recorded
- policy version stored
- historical scores reproducible

---

# 124. BUILD PROCESS

Do the implementation yourself.

Do not stop after creating a prototype.

Build the complete application.

Work in logical phases internally:

1. project setup
2. data model
3. scoring engine
4. local persistence
5. assessment wizard
6. case management
7. dashboard
8. allocation planner
9. Zakat module
10. criteria/transparency
11. PDF reports
12. audit/fairness tools
13. testing
14. final polish

Do not leave major screens as placeholders.

Do not use mock buttons that do nothing.

If a feature cannot be fully implemented because the application intentionally has no backend, implement the strongest local-only version and clearly document the limitation.

---

# 125. FINAL REQUIRED SCREENS

At minimum implement:

`/`

Dashboard

`/cases`

All Cases

`/cases/new`

New Case

`/cases/[id]`

Case Detail

`/queue`

Priority Queue

`/compare`

Compare Cases

`/funds`

Fund Allocation

`/criteria`

Evaluation Criteria

`/policy`

Policy & Methodology

`/audit`

Fairness / Audit

`/settings`

Settings

`/help`

Help / FAQ

---

# 126. FINAL PRODUCT QUALITY BAR

Before finishing, inspect the entire application as though you were:

1. A Foundation volunteer entering a beneficiary case for the first time.
2. A committee member deciding where scarce funds should go.
3. A beneficiary asking, “Why did my case receive this score?”
4. A donor asking, “How does Il An Noor decide whom to prioritize?”
5. An auditor asking, “Why was this case prioritized over that case?”
6. A Mufti reviewing the Zakat logic.
7. A doctor reviewing a medical case.
8. A person using a low-end Android phone.
9. A user with accessibility requirements.
10. A future developer migrating the local storage system to a database.

Fix anything that feels confusing, unfair, opaque or incomplete.

The final product must feel like a serious internal system for a responsible charitable organization, not a generic AI-generated CRUD dashboard.

Most importantly:

**Make the criteria visible.**

**Make the calculations explainable.**

**Make the decision reviewable.**

**Make the data private.**

**Make the human decision-maker accountable.**

**Never let a single number replace judgment, evidence and compassion.**