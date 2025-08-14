# Domain Management (Phase 1)

This project supports multiple domains per client (tenant). In Phase 1, users can add domains, set one as primary, and choose which domain to encode in their QR exports.

## Concepts
- Client: One tenant per user (initial design).
- Domain: Hostname attached to a client. Types: `platform`, `subdomain`, `custom`.
- Primary: The default domain used in URLs when none is explicitly selected.

## DNS Setup (Manual)
- Subdomain (e.g., `links.yourbrand.com`): Create a CNAME record pointing to your platform host (e.g., `app.yourplatform.com`).
- Apex/root domain (e.g., `yourbrand.com`): Use ALIAS/ANAME if supported; otherwise A/AAAA records to your hosting provider. Follow your host’s guidance.

Note: SSL and domain verification are planned for Phase 2. Until verified, custom domains should not be used publicly.

## Verification (Phase 2 Preview)
- TXT verification: Provide a TXT record value to prove ownership.
- HTTP challenge: Serve a token at `http://<domain>/.well-known/<token>`.
- Provider Integration: Vercel Domains API (or similar) to automate DNS checks and SSL provisioning.

## Backfill
After applying migrations, run the backfill script to:
- Create a Client for each existing User.
- Ensure a primary platform domain per client (from `NEXT_PUBLIC_APP_URL`).
- Set `QRCode.clientId` and default `domainId` to the primary domain when missing.

Script: `scripts/backfill-default-client.ts`

