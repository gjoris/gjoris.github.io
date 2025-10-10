---
title: "AWS Security Best Practices: Lessons from the Field"
date: 2025-10-10T10:00:00+02:00
draft: false
description: "Essential AWS security practices every cloud architect should implement, based on real-world experience"
images: ["/images/post-hero.png"]
categories:
  - AWS
  - Security
tags:
  - AWS
  - Security
  - Best Practices
  - IAM
  - CloudTrail
author: "Geroen Joris"
---

## Introduction

After years of working with AWS infrastructure, I've learned that security isn't just a checkbox—it's a continuous practice. Here are the essential security practices that should be implemented in every AWS environment.

## 1. Identity and Access Management (IAM)

### Principle of Least Privilege

Always grant the minimum permissions necessary. Start with nothing and add permissions as needed, rather than starting with full access and removing permissions.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    }
  ]
}
```

### Use IAM Roles, Not Access Keys

Whenever possible, use IAM roles instead of long-term access keys. For EC2 instances, Lambda functions, and ECS tasks, always attach IAM roles.

### Enable MFA Everywhere

Multi-factor authentication should be mandatory for:
- Root account (always!)
- All IAM users with console access
- Privileged operations (using MFA conditions in policies)

## 2. Network Security

### VPC Design

- Use private subnets for application and database tiers
- Implement proper security groups (stateful firewall)
- Use NACLs for additional subnet-level protection
- Enable VPC Flow Logs for traffic analysis

### Security Groups Best Practices

```hcl
# Terraform example
resource "aws_security_group" "app" {
  name        = "app-sg"
  description = "Security group for application tier"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTPS from ALB"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## 3. Data Protection

### Encryption at Rest

Enable encryption for:
- S3 buckets (SSE-S3, SSE-KMS, or SSE-C)
- EBS volumes
- RDS databases
- DynamoDB tables

### Encryption in Transit

- Use TLS 1.2 or higher for all communications
- Implement AWS Certificate Manager for SSL/TLS certificates
- Enable HTTPS-only access for S3 buckets

## 4. Logging and Monitoring

### Essential Logging Services

1. **CloudTrail**: Enable in all regions, log to S3 with encryption
2. **CloudWatch Logs**: Centralize application and system logs
3. **VPC Flow Logs**: Monitor network traffic
4. **S3 Access Logs**: Track bucket access
5. **Config**: Track resource configuration changes

### Set Up Alerts

```yaml
# CloudWatch Alarm example
Resources:
  RootAccountUsageAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: RootAccountUsage
      AlarmDescription: Alert when root account is used
      MetricName: RootAccountUsage
      Namespace: CloudTrailMetrics
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: GreaterThanOrEqualToThreshold
```

## 5. Compliance and Governance

### AWS Organizations

- Use Service Control Policies (SCPs) to enforce security boundaries
- Implement account structure (dev, staging, prod)
- Centralize billing and cost management

### AWS Config Rules

Implement automated compliance checks:
- Ensure S3 buckets are not publicly accessible
- Verify encryption is enabled
- Check for unused IAM credentials
- Validate security group rules

## 6. Incident Response

### Prepare Before Incidents Happen

1. Document incident response procedures
2. Set up AWS Security Hub for centralized findings
3. Enable GuardDuty for threat detection
4. Create runbooks for common scenarios
5. Practice with game days

### Automate Response

Use Lambda functions and EventBridge to automatically respond to security events:

```python
# Example: Auto-remediate public S3 bucket
import boto3

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    bucket_name = event['detail']['requestParameters']['bucketName']
    
    # Remove public access
    s3.put_public_access_block(
        Bucket=bucket_name,
        PublicAccessBlockConfiguration={
            'BlockPublicAcls': True,
            'IgnorePublicAcls': True,
            'BlockPublicPolicy': True,
            'RestrictPublicBuckets': True
        }
    )
    
    return {'statusCode': 200, 'body': 'Remediated'}
```

## Key Takeaways

- Security is a shared responsibility—know what AWS handles and what you handle
- Implement defense in depth with multiple layers of security
- Automate security checks and responses where possible
- Continuously monitor and audit your environment
- Stay updated with AWS security best practices and new services

## Conclusion

AWS security is not a one-time setup but an ongoing process. Start with these fundamentals, continuously assess your security posture, and adapt as your infrastructure evolves. Remember: it's easier to build security in from the start than to retrofit it later.

---

*What security practices have you found most valuable in your AWS environments? Let's discuss on [LinkedIn](https://linkedin.com/in/geroenjoris).*
