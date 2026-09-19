# SecureAuth Demo — Vulnerability Map

Use this guide as your live demo script. Each entry maps a planted issue to its location, scanner category, severity, and a one-line talking point.

**Legend:** 🟢 = Obvious (easy to spot in a quick code read) · 🔵 = Subtle (buried in plausible business logic)

---

## Snyk Code (SAST) — 10 findings

| # | Severity | Obvious/Subtle | File | Issue | Talking Point |
|---|---|---|---|---|---|
| 1 | CRITICAL | 🟢 Obvious | `src/routes/auth.ts` | **SQL Injection** — login query built via string concatenation | "An attacker can bypass authentication with a crafted email like `' OR '1'='1` — Snyk flags this at the source, before it ever reaches production." |
| 2 | HIGH | 🔵 Subtle | `src/routes/profile.ts` | **IDOR / Broken Access Control** — `/profile` accepts any `userId` query param | "The endpoint looks secure because it requires a JWT, but Snyk catches that there's no ownership check — any logged-in user can read any profile." |
| 3 | HIGH | 🔵 Subtle | `src/routes/admin.ts` | **Broken Access Control** — admin route trusts client-supplied `x-user-role` header | "The admin check reads a header the client controls — Snyk identifies this trust-boundary violation even though the code has an explicit role check." |
| 4 | HIGH | 🟢 Obvious | `src/middleware/auth.ts` | **Insecure JWT** — accepts `alg: none` tokens and uses a hardcoded weak secret | "JWT 'none' algorithm attacks are a classic — Snyk detects both the algorithm bypass and the hardcoded signing secret." |
| 5 | HIGH | 🟢 Obvious | `src/db/hash.ts` | **Weak Cryptography** — MD5 password hashing with no salt | "MD5 for passwords hasn't been acceptable for 20 years — Snyk flags this instantly and shows the exact line where hashing happens." |
| 6 | HIGH | 🔵 Subtle | `src/routes/profile.ts` | **SSRF** — `/profile/avatar` fetches a user-supplied URL server-side | "This looks like a normal avatar feature, but Snyk identifies that the server makes outbound requests to attacker-controlled URLs." |
| 7 | MEDIUM | 🟢 Obvious | `src/routes/profile.ts` | **Path Traversal** — `/files/:filename` joins user input into a file path | "No sanitization on the filename parameter means `../../etc/passwd` could expose host files — Snyk catches the unsanitized path join." |
| 8 | MEDIUM | 🟢 Obvious | `src/routes/profile.ts` | **XSS** — display name and search query rendered unescaped in HTML | "User input goes straight into the HTML response — Snyk flags both reflected XSS sinks in the profile view and search endpoint." |
| 9 | MEDIUM | 🔵 Subtle | `src/routes/password-reset.ts` | **CSRF** — `/password-change` is a state-changing POST with no anti-CSRF token | "The password change form has no CSRF token — Snyk identifies state-changing endpoints that lack cross-site request protections." |
| 10 | LOW | 🟢 Obvious | `src/routes/auth.ts` | **Open Redirect** — post-login `redirect` query param used without validation | "After login, the app redirects wherever the `redirect` param points — Snyk flags open redirect sinks used in authentication flows." |
| 11 | LOW | 🔵 Subtle | `src/routes/preferences.ts` | **Insecure Deserialization** — untrusted JSON drives dynamic property access | "Preferences parsing uses `JSON.parse` on user input and accesses global scope dynamically — Snyk catches unsafe deserialization patterns." |

---

## Snyk IaC — 10 findings

### Terraform (AWS)

| # | Severity | Obvious/Subtle | File | Issue | Talking Point |
|---|---|---|---|---|---|
| 12 | CRITICAL | 🟢 Obvious | `terraform/s3.tf` | **Public S3 bucket** with read/write ACL and no encryption | "This bucket allows anyone on the internet to read and write objects — Snyk IaC catches public access misconfigurations before they reach AWS." |
| 13 | CRITICAL | 🟢 Obvious | `terraform/sg.tf` | **Security group** open to `0.0.0.0/0` on SSH (22) and PostgreSQL (5432) | "SSH and database ports exposed to the entire internet — Snyk IaC maps these rules to CIS benchmarks automatically." |
| 14 | HIGH | 🟢 Obvious | `terraform/iam.tf` | **Overly broad IAM policy** — `Action: "*"` on `Resource: "*"` | "Full admin access for the app user — Snyk IaC identifies wildcard IAM policies that violate least-privilege." |
| 15 | HIGH | 🔵 Subtle | `terraform/rds.tf` | **RDS publicly accessible** with `storage_encrypted = false` | "The database is reachable from the internet and stores data unencrypted — Snyk IaC flags both the network exposure and missing encryption at rest." |
| 16 | LOW | 🔵 Subtle | `terraform/s3.tf` | **Missing logging** — no S3 access logging or CloudTrail | "No audit trail for bucket access — Snyk IaC recommends logging configurations that are commonly overlooked." |

### Kubernetes

| # | Severity | Obvious/Subtle | File | Issue | Talking Point |
|---|---|---|---|---|---|
| 17 | CRITICAL | 🟢 Obvious | `k8s/deployment.yaml` | **Privileged container** running as root (`runAsUser: 0`, `privileged: true`) | "The pod runs as root with full host privileges — Snyk IaC flags missing securityContext hardening." |
| 18 | HIGH | 🟢 Obvious | `k8s/deployment.yaml` | **hostNetwork: true** and **hostPath** volume mounts | "The pod shares the host network and mounts `/var/run/docker.sock` — Snyk IaC catches container escape vectors." |
| 19 | MEDIUM | 🟢 Obvious | `k8s/configmap.yaml` | **Secrets in ConfigMap** — JWT, DB password, AWS keys as plain env vars | "Sensitive values are in a ConfigMap instead of a Kubernetes Secret — Snyk IaC identifies improper secret storage." |
| 20 | MEDIUM | 🔵 Subtle | `k8s/service.yaml` | **LoadBalancer/NodePort** with no NetworkPolicy | "Services are exposed externally with no network segmentation — Snyk IaC recommends NetworkPolicies that are missing here." |
| 21 | LOW | 🔵 Subtle | `k8s/deployment.yaml` | **No resource limits** and image tagged `:latest` | "Missing CPU/memory limits and a floating `:latest` tag — Snyk IaC catches operational misconfigurations that lead to instability." |

---

## Snyk Secrets — 8 findings

| # | Severity | Obvious/Subtle | File | Secret Type | Talking Point |
|---|---|---|---|---|---|
| 22 | CRITICAL | 🟢 Obvious | `terraform/terraform.tfvars` | AWS Access Key + Secret Key pair | "Real-looking AWS credentials committed in Terraform variables — Snyk Secrets catches these before they ever get deployed." |
| 23 | CRITICAL | 🟢 Obvious | `keys/demo-private-key.pem` | RSA Private Key file | "A private key committed to the repo — Snyk Secrets detects key files regardless of filename or location." |
| 24 | HIGH | 🟢 Obvious | `.env` | Bundled secrets (AWS keys, JWT, session, DB password, API keys) | "Developers often commit `.env` files by mistake — Snyk Secrets scans for hardcoded credentials across the entire repo." |
| 25 | HIGH | 🔵 Subtle | `src/config/secrets.ts` | Hardcoded JWT secret, session secret, DB connection string | "Fallback hardcoded secrets in source code — Snyk catches these even when environment variables are also used." |
| 26 | HIGH | 🔵 Subtle | `k8s/configmap.yaml` | Database connection string with embedded password | "Database credentials in Kubernetes manifests — Snyk Secrets finds passwords embedded in connection strings across IaC files." |
| 27 | HIGH | 🟢 Obvious | `src/config/secrets.ts` | Stripe `sk_live_...` and SendGrid API keys | "Third-party API keys with recognizable vendor patterns — Snyk Secrets uses pattern matching to identify keys by format." |
| 28 | MEDIUM | 🔵 Subtle | `src/config/secrets.ts` | AWS keys duplicated in application config | "The same AWS credentials appear in multiple files — Snyk shows you every location a secret is exposed, not just the first one." |
| 29 | MEDIUM | 🔵 Subtle | `k8s/configmap.yaml` | Stripe and SendGrid keys in ConfigMap data | "API keys stored alongside non-sensitive config — Snyk Secrets distinguishes secret types and shows severity by exposure context." |

---

## Demo Flow Suggestion

1. **Import & Scan** — Connect the GitHub repo to Snyk and run a full scan. Show the unified findings dashboard with SAST + IaC + Secrets results.
2. **Prioritize** — Filter by Critical/High severity. Point out the mix across categories (11 SAST + 10 IaC + 8 Secrets = 29 total).
3. **Deep Dive SAST** — Open the SQL injection in `auth.ts` (obvious) then the IDOR in `profile.ts` (subtle). Show how Snyk traces data flow.
4. **Deep Dive IaC** — Show the public S3 bucket and open security group in Terraform. Switch to the privileged K8s deployment.
5. **Deep Dive Secrets** — Show the `.env` file and the private key. Highlight that Snyk finds secrets in code, config, and IaC.
6. **CI Integration** — Show the GitHub Actions workflow with the Snyk scan step for PR-check demos.
7. **Fix & Rescan** — Pick one finding, show the remediation advice, apply the fix, and rescan to show the finding clears.

---

## Total Findings Summary

| Category | Count | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Snyk Code (SAST) | 11 | 1 | 5 | 3 | 2 |
| Snyk IaC | 10 | 2 | 3 | 2 | 3 |
| Snyk Secrets | 8 | 2 | 4 | 2 | 0 |
| **Total** | **29** | **5** | **12** | **7** | **5** |
