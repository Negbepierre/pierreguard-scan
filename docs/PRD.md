# Product Requirements Document
## PierreGuard Scan — AI IAM Policy Auditor
**Version:** 1.0
**Author:** Inegbenose Pierre
**Date:** April 2026
**Status:** Live

---

## 1. Problem Statement

AWS IAM misconfigurations are the leading cause of cloud security incidents.
Organisations accumulate IAM risk over time through role changes, promotions,
contractor accounts, and emergency access grants that are never revoked.
Manual IAM audits are time-consuming, inconsistent, and typically only happen
quarterly. By then, a compromised over-privileged account can cause
catastrophic damage.

PierreGuard Scan gives security teams an instant, AI-powered IAM audit that
runs in seconds, assesses every user against the organisation's own security
standards, and produces a prioritised remediation plan with specific AWS CLI
commands.

---

## 2. Goal

Build an AI-powered IAM security auditor that:
- Connects to a live AWS account and pulls all IAM users, roles, and policies
- Assesses every identity against the PierreGuard Security Standards knowledge base
- Produces a risk-scored audit report with Critical, High, Medium, and Low findings
- Generates a per-user risk assessment with one-line explanations
- Provides specific AWS CLI remediation commands for every finding
- Assesses compliance against CIS AWS Benchmark, SOC2, and ISO27001

---

## 3. Target Users

| User | Need |
|------|------|
| Security Engineer | Identify and remediate IAM misconfigurations quickly |
| IAM Auditor | Produce evidence-based audit reports against security standards |
| CISO | Understand overall IAM risk posture at a glance |
| DevOps Lead | Identify which team members have excessive permissions |

---

## 4. Core Features

### 4.1 Authentication
- Staff login with email and password
- Session persists via localStorage
- Every scan tied to an authenticated analyst ID

### 4.2 Connected Account Dashboard
- Shows connected AWS account ID, name, region, and IAM user
- Live connection status indicator
- Scan scope display: users, roles, policies
- Standards applied: PierreGuard v1.0, CIS, SOC2, ISO27001

### 4.3 Live IAM Data Fetching
- Pulls all IAM users with attached policies, group memberships,
  inline policies, and access key details
- Pulls IAM roles with trust policies and attached policies
- Pulls all custom managed policies

### 4.4 RAG-Powered Analysis
- PierreGuard Security Standards document stored in Amazon S3
- Indexed via Amazon Bedrock Knowledge Bases with S3 Vectors
- Relevant standards retrieved semantically before every scan
- Claude analyses IAM configuration against retrieved standards
- Every finding references the specific standard violated

### 4.5 Security Audit Report
- Executive summary with overall risk score from 1 to 10
- Critical findings with user, standard violated, danger explanation,
  and AWS CLI remediation command
- High, Medium, and Low findings in the same format
- Per-user risk summary table with risk level and one-line reason
- Prioritised remediation plan with top 5 actions
- Compliance status for CIS AWS Benchmark, SOC2, and ISO27001

### 4.6 Security Dashboard
- Risk score card with colour coding red, amber, green
- Stats bar showing users scanned, roles scanned, policies scanned
- Findings breakdown by severity
- Compliance status badges
- Full user risk table with group, policy, and access key details
- Tabbed report panel with Executive Summary, Critical, High, Medium,
  Low, Remediation, and Compliance sections

---

## 5. Technical Architecture
```
[React Frontend — Netlify]
        ↓ POST /api/scan
[Python Flask Backend — Render]
        ↓ boto3
[AWS IAM API — pull users, roles, policies]
        ↓ boto3
[AWS Bedrock Knowledge Bases — retrieve PierreGuard standards]
        ↓ boto3
[Claude 3 Haiku via AWS Bedrock — analyse and generate report]
        ↓ JSON response
[React Frontend — render dashboard]
```

---

## 6. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Component-based UI |
| Styling | Tailwind CSS | Rapid UI development |
| Backend | Python + Flask | Lightweight API server |
| IAM Data | boto3 + AWS IAM API | Live account scanning |
| AI Model | Claude 3 Haiku via AWS Bedrock | Fast, cost-efficient analysis |
| Knowledge Base | Amazon Bedrock Knowledge Bases | Managed RAG pipeline |
| Vector Store | Amazon S3 Vectors | Pay-as-you-go vector storage |
| Embeddings | Amazon Titan Text Embeddings V2 | Native Bedrock integration |
| Hosting Frontend | Netlify | Free, Git-connected deployment |
| Hosting Backend | Render | Python support, always-on |
| Version Control | Git + GitHub | Professional commit history |

---

## 7. Demo Organisation

To demonstrate realistic IAM drift scenarios, 17 IAM users were created
across 3 groups simulating a real organisation called PierreGuard Technologies.

| Group | Users | Permissions |
|-------|-------|-------------|
| PG-Developers | dev-alice, dev-bob, dev-charlie, dev-diana, dev-evan | EC2, S3, CloudWatch read |
| PG-Security | sec-pierre, sec-analyst, sec-james | SecurityAudit, ReadOnly |
| PG-Finance | fin-manager, fin-auditor, fin-rachel | Billing read only |

9 users have deliberately misconfigured permissions simulating real-world
IAM drift scenarios including promotions, role changes, contractor accounts,
and emergency access grants never revoked.

---

## 8. PierreGuard Security Standards

The knowledge base contains the PierreGuard AI Security Standards v1.0
covering 10 standards:

- Standard 1: Principle of Least Privilege
- Standard 2: IAM User Lifecycle Management
- Standard 3: Access Key Management
- Standard 4: Multi-Factor Authentication
- Standard 5: Root Account Security
- Standard 6: IAM Role Standards
- Standard 7: IAM Policy Standards
- Standard 8: Separation of Duties
- Standard 9: Logging and Monitoring
- Standard 10: Compliance and Audit Requirements

Each standard defines Critical and High findings with specific SLAs for
remediation: Critical within 24 hours, High within 7 days.

---

## 9. Architecture Decision: Direct boto3 vs LangChain

This project uses direct boto3 calls to AWS Bedrock rather than LangChain.
This decision was made deliberately after testing both approaches in production.

LangChain adds significant middleware overhead that caused Gunicorn worker
timeouts on the Render free tier. Direct boto3 calls are faster, use less
memory, and have no framework dependencies beyond the AWS SDK.

For a production system at scale, LangChain would be appropriate for
multi-step agent workflows, conversation memory, and dynamic retrieval
routing. For a single-prompt analysis like this auditor, direct boto3 is
the cleaner and more reliable choice.

---

## 10. Success Criteria

- [x] User can log in with PierreGuard credentials
- [x] Connected AWS account details displayed before scan
- [x] Scan pulls live IAM data from AWS account
- [x] Analysis references PierreGuard Security Standards from knowledge base
- [x] Report produced with Critical, High, Medium, Low findings
- [x] Per-user risk assessment with colour-coded badges
- [x] AWS CLI remediation commands provided for every finding
- [x] Compliance status shown for CIS, SOC2, ISO27001
- [x] Application live at a public URL
- [x] GitHub repo with clear commit history

---

## 11. Out of Scope (Version 1)

- Automated remediation execution
- Scheduled scans and historical trend tracking
- Multi-account scanning
- Slack or email alerting on new findings
- CloudTrail anomaly detection
- Integration with ticketing systems like Jira

---

## 12. Future Improvements (Version 2)

- Async scan jobs using a queue so scans run as background tasks
- Historical scan comparison showing which findings are new vs persistent
- Multi-account support for enterprise organisations
- Automated remediation with approval workflow
- CloudTrail integration for behavioural analysis
- LangGraph multi-agent pipeline for deeper investigation of suspicious roles
- Slack notifications when Critical findings are detected
- Export to PDF for compliance audit evidence

---

## 13. Key Concepts Demonstrated

**AWS IAM security** — deep understanding of users, roles, policies, groups,
access keys, trust policies, and the principle of least privilege.

**RAG with AWS Bedrock** — firm security standards retrieved from a knowledge
base and injected into every analysis, grounding findings in authoritative
standards rather than general AI knowledge.

**S3 Vectors** — cost-optimised vector storage for knowledge base embeddings.

**Direct boto3 architecture** — production decision to use direct AWS SDK
calls over LangChain middleware, demonstrating understanding of tradeoffs
between framework abstraction and performance.

**IAM drift simulation** — 17 demo users created via AWS CLI with deliberate
misconfiguration scenarios simulating real-world IAM risk patterns.

**Separation of duties** — dedicated IAM user with minimum required
permissions created specifically for this tool, following the principle
of least privilege the tool itself audits for.