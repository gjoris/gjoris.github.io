---
title: "Building a DevSecOps Pipeline: Security from Code to Cloud"
date: 2025-10-10T11:00:00+02:00
draft: false
description: "How to integrate security into your CI/CD pipeline and shift left effectively"
images: ["/images/post-hero.png"]
categories:
  - DevSecOps
  - CI/CD
tags:
  - DevSecOps
  - Security
  - CI/CD
  - Automation
author: "Geroen Joris"
---

## Introduction

"Shift left" has become a buzzword in security, but what does it actually mean in practice? In this post, I'll share how to build a DevSecOps pipeline that integrates security at every stage of the development lifecycle.

## The DevSecOps Pipeline Stages

### 1. Code Stage: Static Analysis

**Tools to integrate:**
- **SAST (Static Application Security Testing)**: SonarQube, Checkmarx, Semgrep
- **Secret Scanning**: GitGuardian, TruffleHog, git-secrets
- **Dependency Scanning**: Snyk, Dependabot, OWASP Dependency-Check

```yaml
# GitHub Actions example
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        
      - name: Run TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          
      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 2. Build Stage: Container Security

**Container scanning essentials:**
- Scan base images for vulnerabilities
- Use minimal base images (Alpine, Distroless)
- Implement image signing
- Scan for misconfigurations

```dockerfile
# Secure Dockerfile example
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs18-debian11
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER nonroot
EXPOSE 3000
CMD ["index.js"]
```

**Scanning with Trivy:**

```bash
# Scan Docker image
trivy image --severity HIGH,CRITICAL myapp:latest

# Scan IaC
trivy config ./terraform/
```

### 3. Test Stage: Dynamic Analysis

**DAST (Dynamic Application Security Testing):**
- OWASP ZAP
- Burp Suite
- Nuclei

```yaml
# ZAP baseline scan
- name: ZAP Baseline Scan
  uses: zaproxy/action-baseline@v0.7.0
  with:
    target: 'https://staging.example.com'
    rules_file_name: '.zap/rules.tsv'
    cmd_options: '-a'
```

### 4. Deploy Stage: Infrastructure Security

**Infrastructure as Code (IaC) scanning:**

```yaml
# Checkov for Terraform
- name: Run Checkov
  uses: bridgecrewio/checkov-action@master
  with:
    directory: terraform/
    framework: terraform
    output_format: sarif
    soft_fail: false
```

**Example secure Terraform:**

```hcl
resource "aws_s3_bucket" "secure_bucket" {
  bucket = "my-secure-bucket"

  # Enable versioning
  versioning {
    enabled = true
  }

  # Enable encryption
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  # Block public access
  public_access_block {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }

  # Enable logging
  logging {
    target_bucket = aws_s3_bucket.logs.id
    target_prefix = "access-logs/"
  }
}
```

### 5. Runtime Stage: Monitoring and Response

**Runtime security tools:**
- AWS GuardDuty
- Falco (for Kubernetes)
- CloudWatch Logs Insights
- Security Hub

```python
# Lambda function for automated response
import boto3
import json

def lambda_handler(event, context):
    """
    Respond to GuardDuty findings automatically
    """
    finding = event['detail']
    severity = finding['severity']
    
    if severity >= 7:  # High or Critical
        # Isolate compromised instance
        ec2 = boto3.client('ec2')
        instance_id = finding['resource']['instanceDetails']['instanceId']
        
        # Apply isolation security group
        ec2.modify_instance_attribute(
            InstanceId=instance_id,
            Groups=['sg-isolation']
        )
        
        # Send alert
        sns = boto3.client('sns')
        sns.publish(
            TopicArn='arn:aws:sns:region:account:security-alerts',
            Subject='CRITICAL: Security Incident Detected',
            Message=json.dumps(finding, indent=2)
        )
    
    return {'statusCode': 200}
```

## Security Gates and Policy Enforcement

### Implement Quality Gates

```yaml
# Example: Fail build on critical vulnerabilities
- name: Check Snyk Results
  run: |
    if [ $(jq '.vulnerabilities | map(select(.severity=="critical")) | length' snyk-report.json) -gt 0 ]; then
      echo "Critical vulnerabilities found!"
      exit 1
    fi
```

### Policy as Code with OPA

```rego
# Open Policy Agent example
package kubernetes.admission

deny[msg] {
  input.request.kind.kind == "Pod"
  not input.request.object.spec.securityContext.runAsNonRoot
  msg := "Containers must not run as root"
}

deny[msg] {
  input.request.kind.kind == "Pod"
  container := input.request.object.spec.containers[_]
  not container.securityContext.readOnlyRootFilesystem
  msg := sprintf("Container %v must have readOnlyRootFilesystem", [container.name])
}
```

## Metrics and KPIs

Track these security metrics:

1. **Mean Time to Detect (MTTD)**: How quickly vulnerabilities are found
2. **Mean Time to Remediate (MTTR)**: How quickly issues are fixed
3. **Vulnerability Density**: Vulnerabilities per 1000 lines of code
4. **Security Debt**: Backlog of known security issues
5. **False Positive Rate**: Accuracy of security tools

## Best Practices

### 1. Start Small, Iterate

Don't try to implement everything at once:
- Week 1: Add secret scanning
- Week 2: Add SAST
- Week 3: Add dependency scanning
- Week 4: Add container scanning

### 2. Reduce False Positives

- Tune your tools
- Create suppression rules for known false positives
- Provide context to developers

### 3. Make Security Visible

- Dashboard with security metrics
- Integrate findings into developer tools (IDE, PR comments)
- Regular security reports

### 4. Automate Remediation

```yaml
# Auto-create PRs for dependency updates
- name: Dependabot
  uses: dependabot/dependabot-core@v2
  with:
    package-manager: npm
    directory: /
    schedule: weekly
```

### 5. Foster Security Culture

- Security champions program
- Regular security training
- Blameless post-mortems
- Celebrate security wins

## Key Takeaways

- Security should be integrated at every stage, not bolted on at the end
- Automate security checks to make them consistent and repeatable
- Balance security with developer productivity
- Measure and improve continuously
- Make security everyone's responsibility

## Conclusion

Building a DevSecOps pipeline is a journey, not a destination. Start with the basics, measure your progress, and continuously improve. The goal is to make security so seamless that it becomes invisible to developers while still being effective.

---

*How have you integrated security into your pipelines? Share your experiences on [LinkedIn](https://linkedin.com/in/geroenjoris).*
