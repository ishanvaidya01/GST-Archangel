# Security Policy

## Supported versions

GST Archangel is an early-stage prototype. Security fixes are applied to the
latest commit on the `master` branch only. No released version or long-term
support window is currently offered.

| Version | Supported |
| :--- | :---: |
| `master` (latest commit) | Yes |
| Older commits / forks | No |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Report privately using either channel:

1. **GitHub Security Advisories** — use the repository's *Security* tab and
   choose *Report a vulnerability*.
2. **Email** — [ishan.vaidya01@gmail.com](mailto:ishan.vaidya01@gmail.com).

Include, where possible:

- a description of the issue and its impact;
- steps to reproduce or a minimal proof of concept;
- affected endpoint, component, or file;
- your environment (Docker or local, OS, browser);
- any suggested remediation.

Do not include real customer data, production credentials, or third-party
personal information in the report.

## Scope

In scope:

- authentication and authorization behavior;
- injection, path traversal, and unsafe file handling in upload or extraction;
- exposure of secrets, credentials, or private files;
- cross-site scripting, CORS misconfiguration, and WebSocket abuse;
- dependency vulnerabilities with a practical impact on this project.

Out of scope:

- findings that require a compromised host or already-privileged access;
- denial-of-service reports based only on high-volume traffic;
- reports about the known prototype stubs documented in the README
  (mock authentication, mock LLM responses, placeholder embeddings);
- automated scanner output without a demonstrated impact.

## Response expectations

Reports are handled on a best-effort basis. You can expect an acknowledgement
when the report is reviewed and, where appropriate, a coordinated disclosure
plan. No response SLA or bug-bounty payment is offered.

## Secure-development notes

- Never commit `.env` files, JWT secrets, API keys, or database credentials.
- Use a strong, unique `JWT_SECRET` outside local development.
- Treat uploaded documents as untrusted input.
- The Compose credentials are development defaults and are not suitable for
  production.
- The current `get_current_user` implementation is a mock; do not deploy this
  prototype as an authenticated service.
