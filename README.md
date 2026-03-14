# Cloud Resume — Azure Container Apps Deployment

A full-stack resume site deployed on **Azure Container Apps**, migrated from AKS. Live at [https://resume-backend.icyground-8a4001f2.uaenorth.azurecontainerapps.io/](https://resume-backend.icyground-8a4001f2.uaenorth.azurecontainerapps.io/).

---

## Architecture

```
Internet → Azure Container Apps Ingress (TLS)
                │
        Node.js Backend Container (1-2 replicas)
                │
        PostgreSQL (Supabase managed)
```

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | PostgreSQL (Supabase, managed) |
| Orchestration | Azure Container Apps (ACA) |
| Ingress | ACA External Ingress |
| TLS | Automatic via ACA |
| Container Registry | Docker Hub |

---

## Features

- **Visitor counter** — records each visit in PostgreSQL and displays a live count
- **Rate limiting** — per-IP limit via backend code
- **Auto scaling** — ACA scales between 0–2 replicas
- **Environment variables** — securely configured in ACA
- **External access** — HTTPS endpoint automatically provisioned

---

## ACA Deployment Commands

### 1. Create Resource Group

```bash
az group create --name resumeaca-rg --location UAEnorth
```

### 2. Create Log Analytics Workspace

```bash
az monitor log-analytics workspace create \
    --resource-group resumeaca-rg \
    --workspace-name resume-law \
    --location UAEnorth
```

### 3. Retrieve Workspace Customer ID

```powershell
$workspaceId = az monitor log-analytics workspace show `
    --resource-group resumeaca-rg `
    --workspace-name resume-law `
    --query customerId -o tsv
```

### 4. Create ACA Environment

```bash
az containerapp env create \
    --name resume-env \
    --resource-group resumeaca-rg \
    --location UAEnorth \
    --logs-workspace-id $workspaceId
```

### 5. Deploy Backend Container

```bash
az containerapp create \
    --name resume-backend \
    --resource-group resumeaca-rg \
    --environment resume-env \
    --image ninazu00/resume-backend:v1.0 \
    --ingress external \
    --target-port 3001 \
    --cpu 0.5 --memory 1Gi \
    --min-replicas 0 --max-replicas 2 \
    --registry-server docker.io \
    --registry-username ninazu00 \
    --registry-password <Docker_Hub_PAT> \
    --env-vars "DATABASE_URL=<SUPABASE_POOLER_URL>" "PORT=3001" "APP_NAME=Resume API"
```

> **Note:** Replace `<Docker_Hub_PAT>` with a Docker Hub personal access token. Replace `<SUPABASE_POOLER_URL>` with your Supabase transaction pooler connection string.

---

## Security

- Secrets never hardcoded; passed as ACA environment variables

- Non-root Node.js container recommended (USER node)

- HTTPS enabled via ACA external ingress

- Rate limiting enforced at backend

---

## Environment Variables

| Name          | Description                                |
|---------------|--------------------------------------------|
| DATABASE_URL  | PostgreSQL connection string (Supabase)   |
| PORT          | Port number for the backend API            |
| APP_NAME      | Application name displayed or logged       |

---

## Azure Resources

| Resource Type           | Name / Identifier                  | Notes |
|-------------------------|-----------------------------------|-------|
| Resource Group          | resumeaca-rg                       |       |
| Container Apps Env      | resume-env                          | UAEnorth, linked to Log Analytics |
| Container App           | resume-backend                      | Exposes backend API externally |
| Log Analytics Workspace | resume-law                           | For container logs monitoring |

---

