# Staging runbook (Path B)

See **`infra/PATH_B.md`** for architecture, URL rules, deploy, and rollback.

## Cloud Run / SQL identifiers (proposed — not created)

- Region: `asia-south1`
- Cloud Run staging: `nesthub-api-staging`
- Cloud Run production: `nesthub-api`
- Firebase Hosting targets: `main` (frontend), `tenant` (tenant-portal)

## Local commands

```bash
node infra/scripts/test-api-base-url.mjs
cd frontend && npm ci && npm run build
cd tenant-portal && npm ci && npm run build
export JAVA_HOME=~/tools/jdk-17.0.21+9
export PATH="$JAVA_HOME/bin:$HOME/tools/apache-maven-3.9.16/bin:$PATH"
cd backend && mvn -B -DskipTests package
```

## Stop conditions

No project create, API enablement, Cloud SQL/Run/Hosting deploy, or DNS changes without explicit approval.
