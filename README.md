# SecureAuth Demo

> **DISCLAIMER:** This is an **intentionally vulnerable** application created exclusively for security training and Snyk product demonstrations. It is **not production software** and must **never** be deployed to or exposed on the public internet. All credentials, keys, and secrets in this repository are synthetic and non-functional.

SecureAuth Demo is a small Node.js + TypeScript sign-in service with deliberately planted vulnerabilities across application code (SAST), infrastructure-as-code (IaC), and committed secrets — designed to produce realistic findings when scanned by Snyk Code, Snyk IaC, and Snyk Secrets.

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+

### Install & Run

```bash
npm install
npm run build
npm start
```

The app starts at [http://localhost:3000](http://localhost:3000).

### Development Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Docker

```bash
npm run build
docker build -t secureauth-demo .
docker run -p 3000:3000 secureauth-demo
```

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| `admin@secureauth.demo` | `admin123` | admin |

Register additional accounts via the UI or `POST /register`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Authenticate and receive JWT |
| `POST` | `/logout` | Destroy session |
| `POST` | `/password-reset/request` | Request a password reset token |
| `POST` | `/password-reset/confirm` | Confirm reset with token |
| `POST` | `/password-change` | Change password (no CSRF protection) |
| `GET` | `/profile` | View user profile (IDOR vulnerable) |
| `GET` | `/profile/view` | HTML profile view (XSS vulnerable) |
| `POST` | `/profile/avatar` | Set avatar from URL (SSRF vulnerable) |
| `GET` | `/files/:filename` | Download file (path traversal vulnerable) |
| `GET` | `/search?q=` | Search (XSS vulnerable) |
| `GET` | `/admin` | Admin panel (broken access control) |
| `POST` | `/preferences` | Save preferences (insecure deserialization) |
| `GET` | `/health` | Health check |

## Repository Structure

```
secureauth-demo/
├── src/                  Application source code
├── terraform/            AWS Terraform with IaC misconfigurations
├── k8s/                  Kubernetes manifests with misconfigurations
├── keys/                 Committed demo private key
├── .env                  Committed planted secrets
├── DEMO_GUIDE.md         Full vulnerability map for live demos
└── .github/workflows/    CI pipeline with Snyk scan step
```

## Snyk Integration

1. Push this repository to GitHub.
2. In Snyk, go to **Integrations → GitHub** and import the repo.
3. Run an initial scan — Snyk Code, IaC, and Secrets should surface findings across all three categories.
4. Use `DEMO_GUIDE.md` as your live demo script.

For CI/PR-check integration, add a `SNYK_TOKEN` secret to your GitHub repository and uncomment the Snyk scan step in `.github/workflows/ci.yml`.

## Assumptions

- SQLite is used as the datastore so the app runs with zero external dependencies.
- The seeded admin password is `admin123` (MD5-hashed intentionally with a weak algorithm).
- All AWS keys follow the well-known `AKIAIOSFODNN7EXAMPLE` pattern and are non-functional.
- The private key in `keys/demo-private-key.pem` was generated locally for this demo and has no real-world association.

## License

MIT — for demo and training purposes only.
