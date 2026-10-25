# Demo and submission checklist

## What this project is
Lancer is a milestone escrow workflow for businesses and freelancers. The interface uses **Client**, **Freelancer**, and **Escrow Support** rather than ambiguous Buyer/Seller labels. The parties agree to a brief, milestone deliverables, amounts, and review window. Escrow Support reviews disputes and can only request a contract-authorized outcome; it has no general withdrawal method.

## What is implemented in source
- Role-based UI, shared scope/acceptance criteria, agreement-scoped local chat, and visible PII warning/blocking checks.
- NEAR testnet Wallet Selector wiring and contract-call handlers when `NEXT_PUBLIC_NEAR_ESCROW_CONTRACT_ID` is configured.
- Rust contract source for native-NEAR escrow funding, per-milestone delivery, release, dispute, support resolution, and timeout escalation to review.
- Clear distinction between local sample agreements and records created through the testnet transaction path.

## Required before claiming an on-chain demo is working
1. Build and deploy the Rust contract to a fresh NEAR testnet account.
2. Initialize it with a dedicated support account as `owner`; this account can resolve disputes but has no arbitrary withdrawal method.
3. Set `NEXT_PUBLIC_NEAR_ESCROW_CONTRACT_ID` in `apps/web/.env.local` and restart Next.js.
4. Use two testnet accounts: client and freelancer. Create an agreement, fund it with the exact native-NEAR amount, submit evidence, and verify the release transaction.
5. Open a dispute, then use the configured owner account to authorize a refund or release. Verify the transfer and the contract state in NEAR Explorer.
6. Record the actual transaction hashes and show the testnet explorer. Do not describe local buttons or unfinalized transactions as successful transfers.

## NEAR Intents constraint
Official FAQ: https://docs.near.org/chain-abstraction/intents/faq. It states there is no testnet deployment. Therefore, Intents is not shown as live in this prototype. It can be integrated only after choosing a supported mainnet route and designing a safe real-asset test; do not fake cross-chain movement or conflate Intents routing with escrow/dispute logic.

## Chat safety
The chat is browser-local and applies only client-side heuristic checks. This is a demonstration, not robust protection. A production implementation needs server-side enforcement, authenticated project membership, moderation logs, reporting/appeals, secure retention and deletion, and careful handling of legitimate business contact details. The chat should not be described as fully secure until these exist.