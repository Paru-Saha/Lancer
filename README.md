# Lancer — Built on NEAR

> A milestone-based freelance marketplace concept designed around clearer agreements and programmable payment settlement.

Lancer helps clients and freelancers define work, agree on milestones, and follow a transparent path from listing to delivery and payment. This is a **hackathon prototype**. The implementation status below separates source/UI from verified on-chain functionality.

## Contents

1. [The gap we are solving](#1-the-gap-we-are-solving)
2. [The promise](#2-the-promise)
3. [Architecture and workflow](#3-architecture-and-workflow)
4. [The life of Lancer: sustainability](#4-the-life-of-lancer-sustainability)
5. [NEAR Intents application](#5-near-intents-application)
6. [Getting out](#6-getting-out-portability-and-exit)
7. [Risks](#7-risks)
8. [Engineering decisions](#8-engineering-decisions)
9. [Repository map](#9-repository-map)
10. [Run locally](#10-run-locally)
11. [What works today](#11-what-works-today)
12. [Hackathon and open-source notes](#12-hackathon-and-open-source-notes)

## 1. The gap we are solving

Freelance work has a trust gap. Clients need confidence that agreed work will be delivered; freelancers need confidence that completed work will be paid for. Requirements can drift, milestones can be vague, and disputes can become slow and costly.

Lancer explores a workflow where:
- scope and milestones are agreed before work begins;
- both parties can refer to the same agreement;
- submissions, acceptance, revisions, and disputes have explicit states;
- payment rules can ultimately be enforced by a smart contract rather than relying only on a platform operator.

This is a product hypothesis, not a claim that software can eliminate every dispute. Subjective work still needs human judgment.

## 2. The promise

**For clients:** clearer deliverables, milestone-based funding, and a visible record of agreed scope.

**For freelancers:** documented expectations, a transparent acceptance process, and a path to payment that does not rely solely on an informal promise.

**For both:** one workflow from listing and application through agreement, milestone delivery, acceptance, and settlement.

### Proposed fee

The proposed platform fee is **2.5% of completed work value**: 1.25% charged to the client and 1.25% deducted from the freelancer payout. This is a proposed business rule, not a claim about fees currently charged by a deployed contract. It must be enforced and tested in the contract before real-money use.

## 3. Architecture and workflow

### Client-to-freelancer workflow

~~~mermaid
flowchart TD
    A[Client connects NEAR wallet] --> B[Creates client profile]
    B --> C[Publishes work listing]
    C --> D[Freelancer connects a separate wallet]
    D --> E[Reviews listing and applies]
    E --> F[Client reviews application]
    F --> G[Both agree scope and milestones]
    G --> H[Client funds escrow contract]
    H --> I[Freelancer submits milestone evidence]
    I --> J{Client accepts?}
    J -- Yes --> K[Contract releases milestone payout]
    J -- Revision --> L[Freelancer revises work]
    L --> I
    J -- Dispute --> M[Evidence review and defined resolution]
    M --> N[Authorized release or refund]
~~~

### Intended system architecture

~~~mermaid
flowchart LR
    U[Client / Freelancer] --> UI[Next.js App Router]
    UI --> W[NEAR Wallet Selector]
    W --> N[NEAR account and transaction signing]
    UI --> P[Marketplace and profile data]
    UI --> E[Escrow contract interface]
    E --> C[Rust escrow contract on NEAR]
    C --> S[Contract state and settlement]
    UI -. future supported routes .-> I[NEAR Intents]
~~~

### Escrow state model

~~~mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Funded: valid funding transaction
    Funded --> Submitted: evidence submitted
    Submitted --> Accepted: client accepts
    Accepted --> Released: payout succeeds
    Submitted --> RevisionRequested: changes requested
    RevisionRequested --> Submitted: revised evidence
    Funded --> Disputed: dispute raised
    Disputed --> Released: authorized release
    Disputed --> Refunded: authorized refund
    Released --> [*]
    Refunded --> [*]
~~~

These diagrams describe the intended workflow, not proof that every transition is deployed or wired into the UI.

### Component responsibilities

- **Web UI:** Next.js App Router and React provide the landing page, marketplace, onboarding, client profile, freelancer profile, and escrow/support surfaces.
- **Wallet connection:** NEAR Wallet Selector connects a wallet and exposes the selected account. A connected wallet is not proof that a contract transaction succeeded.
- **Marketplace demo data:** browser localStorage supports a two-tab demo within the same browser origin/profile. It is not a multi-device database or production source of truth.
- **Escrow contract:** Rust contract source is included. Production use requires tests, testnet deployment, verified UI integration, and an independent security review.
- **NEAR Intents:** a possible future route for supported asset conversion or cross-chain execution; it does not replace agreement or escrow state.

### Trust boundaries

The browser is untrusted. Client-side role flags, local storage, and hidden pages must never authorize money movement. Production authorization belongs in contract checks and, where appropriate, a secured backend. Admin dispute tools must have strict role checks, auditable actions, and only explicitly defined release/refund outcomes.

## 4. The life of Lancer: sustainability

Lancer proposes a fee on completed work, not on browsing or applying. Sustainability depends on enough completed transaction volume and keeping support, security, and infrastructure costs under control.

Let:
- V = total value of completed work in a period;
- f = proposed fee rate, 0.025;
- R = gross platform fee revenue;
- C = operating costs in the same period.

**Gross revenue:** R = V × 0.025

**Operating result:** R − C − variable transaction, support, refund, and dispute costs.

The headline fee is not profit. Actual economics must account for transaction/network costs, support, audits, development, taxes, refunds, disputes, and any asset-conversion costs.

### Illustrative monthly revenue scenarios

| Completed work volume | Gross revenue at 2.5% |
| ---: | ---: |
| $10,000 | $250 |
| $50,000 | $1,250 |
| $100,000 | $2,500 |
| $250,000 | $6,250 |
| $500,000 | $12,500 |
| $1,000,000 | $25,000 |

These are arithmetic scenarios, **not traction, forecasts, or guaranteed earnings**.

### Break-even volume scenarios

At a 2.5% gross fee rate, required volume = monthly operating cost ÷ 0.025.

| Hypothetical monthly cost base | Required monthly completed volume |
| ---: | ---: |
| $1,000 | $40,000 |
| $2,500 | $100,000 |
| $5,000 | $200,000 |
| $10,000 | $400,000 |
| $20,000 | $800,000 |

This is gross break-even before variable costs. If variable costs average c of completed volume, use contribution rate (0.025 − c), provided it remains positive.

### Why the model could work

- Revenue scales with completed work value.
- The proposed fee is split between client and freelancer.
- Contract automation may reduce manual payment handling, although disputes still require human time.
- NEAR settlement and future supported cross-chain routes could widen payment access.

### Metrics to measure before claiming sustainability

Track completed GMV, effective fee rate, funded-to-completed conversion, repeat-client rate, freelancer retention, dispute and refund rates, resolution time, support hours per completed job, acquisition cost, and net contribution per transaction. Never present modeled numbers as observed metrics.

## 5. NEAR Intents application

NEAR is the intended settlement foundation for escrow. NEAR Intents may later help users access supported assets and cross-chain execution paths without Lancer implementing every route independently.

Intended separation of responsibilities:

1. Lancer's agreement defines scope, milestones, and approval rules.
2. The escrow contract holds and releases funds according to verified rules.
3. If integrated, NEAR Intents can route a supported asset conversion or cross-chain settlement step.
4. Lancer records the transaction reference and verifies the outcome before displaying completion.

Intents are **not the escrow contract itself**. Supported routes, SDK/API requirements, fees, finality, refund behavior, and token availability must be verified against current official documentation before integration. This repository does not claim a live Intents integration unless it is implemented, configured, and tested.

- [NEAR documentation](https://docs.near.org/)
- [NEAR Intents documentation](https://docs.near-intents.org/)
- [NEAR Intents website](https://intents.near.org/)

## 6. Getting out: portability and exit

Users should be able to stop using Lancer without losing control of their NEAR account. Lancer must never ask users for seed phrases or private keys.

A safe exit design should include:
- disconnecting a wallet without deleting a saved profile;
- access to agreement records and transaction references;
- explicit completion/refund/dispute rules for active agreements;
- export of user-owned profile and work data where feasible;
- contract-level exit paths that prevent an operator from arbitrarily seizing funds.

Contracts may be immutable or difficult to upgrade. Upgradeability, emergency pause behavior, and migration procedures must be explicitly designed and disclosed, not promised by the UI.

## 7. Risks

| Risk | Why it matters | Mitigation / open work |
| --- | --- | --- |
| Contract bug | Funds could be lost or stuck | Unit/property tests, independent audit, conservative scope, testnet trials |
| Subjective deliverables | Code cannot judge all work quality | Acceptance criteria, evidence, defined dispute process |
| Admin abuse | Support tools could become a custody risk | On-chain role checks, limited release/refund actions, event logs, multisig |
| Browser data loss | Local storage is not durable or cross-device | Add authenticated backend and backups |
| Wallet compatibility | Wallets can behave differently | Test supported wallets and clear failure states |
| Fake identities / Sybil activity | Listings and reviews may be manipulated | Rate limits, reputation signals, reporting, moderation |
| Fee / cost mismatch | Gross fees may not cover operations | Measure contribution margin and revisit pricing |
| Cross-chain failure | Routes can fail or be delayed | Integrate only documented routes; handle pending/failed states |
| Legal and tax obligations | Payments/escrow may create obligations | Jurisdiction-specific legal advice before launch |
| Misleading status claims | Demo UI can look production-ready | Publish implementation status and transaction evidence |

## 8. Engineering decisions

- **NEAR-first:** wallet identity and intended escrow settlement are designed around NEAR.
- **Next.js App Router:** organizes product surfaces by route.
- **Rust contract:** keeps intended money-moving rules explicit and independently testable.
- **Browser storage for demo:** minimizes setup for a two-tab walkthrough, but is not production persistence.
- **Separate roles:** client and freelancer are distinct product roles; production enforcement must not depend only on browser state.
- **Milestone settlement:** ties partial payouts to defined deliverables rather than one all-or-nothing payment.
- **No fake Intents claims:** cross-chain routing remains separate until implemented and verified.
- **Incremental deployment:** local UI, contract tests, testnet funding/release/refund, then security review before mainnet use.

## 9. Repository map

~~~text
lancer/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── page.tsx             # Landing page
│       │   ├── marketplace/         # Listings and applications
│       │   ├── join/                # Role selection and onboarding
│       │   ├── hirer/               # Client profile
│       │   ├── freelancer/          # Freelancer profile
│       │   ├── escrow/              # Escrow/support surface
│       │   ├── shared.tsx           # Shared UI and wallet helpers
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── lib/
│       ├── package.json
│       ├── next.config.ts
│       └── .env.example
├── contracts/
│   └── escrow/
│       ├── src/lib.rs               # Rust escrow contract
│       └── Cargo.toml
├── HACKATHON.md
└── README.md
~~~

## 10. Run locally

### Requirements

- Node.js and npm compatible with the versions in apps/web/package.json
- Rust and Cargo for contract work
- A NEAR testnet account and compatible wallet for wallet/contract testing

### Start the web app

From the repository root:

~~~bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
~~~

Open [http://localhost:3000](http://localhost:3000).

Check apps/web/package.json for exact scripts and required environment variables. Do not put private keys, seed phrases, or production secrets in source control or frontend-exposed variables.

### Contract checks

~~~bash
cd contracts/escrow
cargo test
~~~

If the contract target or toolchain is not installed, install the Rust toolchain and target required by the contract manifest. A successful local build is not a testnet deployment or security audit.

### Two-account demo

1. Open the app in two tabs using the same browser profile and origin.
2. Connect a separate testnet wallet/account in each tab.
3. Use one account as the client to create a listing.
4. Use the other account as the freelancer to discover and apply.
5. Verify the application appears in the client view.
6. Walk through milestone and escrow UI, distinguishing simulated demo states from confirmed on-chain transactions.

Because marketplace demo data uses browser storage, this does not imply synchronization across devices or different browser profiles.

## 11. What works today

This is a hackathon prototype, not a production escrow service. Verify each item locally before relying on it.

| Capability | Status / qualification |
| --- | --- |
| Lancer-branded landing page | Included in source |
| Separate marketplace, join, client, freelancer, escrow/support pages | Included in source |
| Wallet Selector integration | Included; test compatibility in your environment |
| Same-origin two-tab marketplace demo | Uses browser storage, not a backend |
| Rust escrow contract source | Included; requires tests and review |
| Production-grade escrow security | Not claimed |
| Verified testnet deposit/release/refund end-to-end | Not claimed without transaction evidence |
| NEAR Intents routing | Not claimed as integrated |
| Multi-device persistence | Requires backend; localStorage is insufficient |
| Production-grade admin support security | Requires stronger authorization and contract checks |

Mark a feature **live** only when the code path, tests, and relevant on-chain transactions can be independently verified. For judging, include a demo video or screenshots and link to any public testnet transaction evidence that exists.

## 12. Hackathon and open-source notes

Lancer is being prepared for NEAR HACKATHON. Ensure the public repository and demo post meet the official requirements before the deadline. See [HACKATHON.md](./HACKATHON.md) and the [official hackathon site](https://nearhackathon.com).

### Contributing

1. Open an issue describing the bug, feature, or documentation change.
2. Keep changes scoped and add tests for contract/payment-state logic.
3. Never commit wallet keys, seed phrases, access tokens, or personal submission payloads.
4. State whether a change is prototype-only, testnet-verified, or production-ready.
5. Submit a pull request with reproduction steps and test results.

### Disclaimer

Lancer is experimental software. Do not use it to custody or transfer mainnet funds until the contract, wallet flow, authorization model, dispute process, and deployment have been independently reviewed. Financial examples are illustrative, not forecasts.