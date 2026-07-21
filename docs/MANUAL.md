# User Manual
## PierreGuard Scan — AI IAM Policy Auditor

**Live URL:** https://pierreguard-scan.netlify.app
**GitHub:** https://github.com/Negbepierre/pierreguard-scan
**Built by:** Inegbenose Pierre

---

## What This Tool Does

PierreGuard Scan is an AI-powered IAM security auditor that connects to a
live AWS account, pulls all IAM users, roles, and policies, and produces a
comprehensive security audit report. Every finding is assessed against the
PierreGuard Security Standards knowledge base and includes specific AWS CLI
remediation commands.

---

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| pierre@pierreguard.ai | pierre2026 | Chief Security Officer |
| analyst@pierreguard.ai | analyst2026 | Security Analyst |
| auditor@pierreguard.ai | auditor2026 | IAM Auditor |

---

## How to Use It

### Step 1 — Sign In

Go to the live URL and sign in using one of the demo credentials above.

### Step 2 — Review the Connected Account

The scan configuration screen shows the connected AWS account details:

- Account ID and name
- Environment and region
- IAM user used for scanning
- Scan scope: IAM users, roles, and policies
- Security standards being applied

### Step 3 — Start the Scan

Click **Start IAM Scan**. The tool will:

1. Query the PierreGuard Security Standards knowledge base
2. Pull all IAM users, roles, and policies from the AWS account
3. Send the data to Claude via AWS Bedrock for analysis
4. Return a full security audit report

This takes approximately 30 to 60 seconds.

### Step 4 — Review the Dashboard

The dashboard shows:

**Stats bar**
- Overall risk score from 1 to 10
- Total users, roles, and policies scanned
- Findings count by severity: Critical, High, Medium, Low, Clean

**Compliance status**
- CIS AWS Benchmark
- SOC 2 Type II
- ISO 27001
- PierreGuard Standards

**User Risk Assessment table**
- Every user listed with risk level badge
- Red for Critical, Orange for High, Yellow for Medium,
  Green for Low, Blue for Clean
- Finding reason, group membership, policies, and access keys shown

**Security Audit Report panel**
- Tabbed sections: Executive Summary, Critical, High, Medium,
  Low, Remediation, Compliance
- Each finding includes the user affected, standard violated,
  why it is dangerous, and the AWS CLI command to fix it

### Step 5 — Run a New Scan

Click **New Scan** in the header to return to the scan configuration
screen and run a fresh scan.

---

## Demo Organisation

The tool scans a simulated organisation called PierreGuard Technologies
with 17 IAM users across 3 groups. 9 users have deliberately misconfigured
permissions to simulate real-world IAM drift scenarios.

| Scenario | User | Problem |
|----------|------|---------|
| Founder account never cleaned up | legacy-admin | AdministratorAccess |
| Contractor account still active | contractor-temp | S3, EC2, RDS full access |
| Developer promoted temporarily | dev-bob | AdministratorAccess never revoked |
| Developer moved to finance | dev-charlie | Kept S3 and Lambda full access |
| Finance manager given emergency access | fin-manager | EC2 and IAMFullAccess never removed |
| Ops lead given migration access | ops-lead | AdministratorAccess never scoped back |
| Junior analyst given wrong permissions | sec-james | IAMFullAccess and EC2FullAccess |
| Developer project ended | dev-diana | DynamoDB and RDS full access retained |
| HR manager given broad S3 access | hr-manager | S3FullAccess instead of bucket-specific |

---

## What Happens Behind the Scenes

1. Scan request sent from React frontend to Flask backend
2. Backend queries PierreGuard Security Standards knowledge base
   via Amazon Bedrock Knowledge Bases
3. Relevant security standards retrieved using semantic search
4. Backend calls AWS IAM API via boto3 to pull all users,
   roles, and policies
5. IAM data and knowledge base context sent to Claude 3 Haiku
   via AWS Bedrock
6. Claude analyses the configuration and produces a structured report
7. Report parsed and returned to the React frontend
8. Dashboard renders with risk scores, findings, and remediation plan

---

## Technical Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| AWS IAM | Live account scanning via boto3 IAM API |
| RAG pattern | PierreGuard standards retrieved from Bedrock Knowledge Base |
| AWS Bedrock | Claude 3 Haiku called directly via boto3 |
| S3 Vectors | Cost-optimised vector store for knowledge base |
| Titan Embeddings | Amazon Titan V2 for document vectorisation |
| Python Flask | REST API with scan endpoint |
| React state | Scan results stored in state, dashboard rendered reactively |
| Authentication | Employee login with session persistence |
| Principle of least privilege | Dedicated IAM user with minimum permissions for scanning |
| IAM drift simulation | 17 users created via AWS CLI with realistic misconfiguration scenarios |

---

## Running Locally

### Prerequisites

- Python 3.11 or above
- Node.js v18 or above
- AWS account with IAM ReadOnly and Bedrock access
- Bedrock Knowledge Base created and synced

### Backend Setup
```bash
git clone https://github.com/Negbepierre/pierreguard-scan.git
cd pierreguard-scan
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
KNOWLEDGE_BASE_ID=your_kb_id
```

Start the backend:
```bash
flask run --port 5001
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Security Notes

- AWS credentials are stored as environment variables on Render
- Credentials are never exposed to the frontend
- The scanning IAM user has ReadOnlyAccess and AmazonBedrockFullAccess only
- It cannot modify any AWS resources — read only
- All scans are tied to an authenticated analyst session

---

## Interview Talking Points

**Why direct boto3 instead of LangChain?**
LangChain adds middleware overhead that caused Gunicorn worker timeouts in
production. Direct boto3 calls are faster, lighter, and more reliable for
a single-prompt analysis. LangChain would be appropriate for multi-step
agent workflows where its orchestration capabilities add genuine value.

**How does the RAG work here?**
The PierreGuard Security Standards PDF is stored in S3 and indexed via
Amazon Bedrock Knowledge Bases using Titan Text Embeddings V2 and S3
Vectors. Before every scan, the most relevant sections are retrieved
semantically and injected into the Claude prompt. This means Claude
assesses findings against our specific standards rather than general
knowledge.

**Why a dedicated IAM user for scanning?**
Following the principle of least privilege — the same principle the tool
audits for. The pierreguard-scan-dev user has only ReadOnlyAccess and
AmazonBedrockFullAccess. It cannot create, modify, or delete any AWS
resources. If the credentials were ever compromised, the blast radius
is limited to read operations only.

**What would version 2 look like?**
Async scan jobs using a queue so scans run as background tasks and are
not limited by HTTP timeouts. Historical scan comparison to track which
findings are new versus persistent. Multi-account support. Automated
remediation with an approval workflow. CloudTrail integration for
behavioural analysis on top of the static IAM audit.