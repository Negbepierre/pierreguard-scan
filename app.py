import os
import json
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_aws import ChatBedrock
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

load_dotenv()

app = Flask(__name__)
CORS(app)

AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

CLAUDE_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0'

iam_client = boto3.client(
    'iam',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)

bedrock_runtime = boto3.client(
    'bedrock-runtime',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)


def get_llm():
    return ChatBedrock(
        client=bedrock_runtime,
        model_id=CLAUDE_MODEL,
        model_kwargs={
            'max_tokens': 4096,
            'temperature': 0
        }
    )


def fetch_iam_users():
    response = iam_client.list_users()
    users = []
    for user in response['Users']:
        username = user['UserName']
        user_data = {
            'username': username,
            'created': str(user['CreateDate']),
            'policies': [],
            'groups': [],
            'access_keys': []
        }
        attached = iam_client.list_attached_user_policies(UserName=username)
        for p in attached['AttachedPolicies']:
            user_data['policies'].append(p['PolicyName'])
        inline = iam_client.list_user_policies(UserName=username)
        user_data['inline_policies'] = inline['PolicyNames']
        groups = iam_client.list_groups_for_user(UserName=username)
        for g in groups['Groups']:
            user_data['groups'].append(g['GroupName'])
        keys = iam_client.list_access_keys(UserName=username)
        for k in keys['AccessKeyMetadata']:
            user_data['access_keys'].append({
                'id': k['AccessKeyId'][:8] + '...',
                'status': k['Status'],
                'created': str(k['CreateDate'])
            })
        users.append(user_data)
    return users


def fetch_iam_roles():
    response = iam_client.list_roles()
    roles = []
    for role in response['Roles'][:20]:
        role_data = {
            'name': role['RoleName'],
            'created': str(role['CreateDate']),
            'trust_policy': json.dumps(
                role['AssumeRolePolicyDocument'], indent=2
            ),
            'policies': []
        }
        attached = iam_client.list_attached_role_policies(
            RoleName=role['RoleName']
        )
        for p in attached['AttachedPolicies']:
            role_data['policies'].append(p['PolicyName'])
        roles.append(role_data)
    return roles


def fetch_iam_policies():
    response = iam_client.list_policies(Scope='Local')
    policies = []
    for policy in response['Policies']:
        version = iam_client.get_policy_version(
            PolicyArn=policy['Arn'],
            VersionId=policy['DefaultVersionId']
        )
        policies.append({
            'name': policy['PolicyName'],
            'arn': policy['Arn'],
            'document': json.dumps(
                version['PolicyVersion']['Document'], indent=2
            )
        })
    return policies


def analyse_iam_with_langchain(users, roles, policies):
    llm = get_llm()

    prompt_template = PromptTemplate(
        input_variables=['iam_data'],
        template="""You are an expert AWS IAM security auditor working for PierreGuard AI.

Analyse the following AWS IAM configuration and produce a comprehensive security audit report.

IAM CONFIGURATION DATA:
{iam_data}

Produce a structured security audit with these exact sections:

1. EXECUTIVE SUMMARY
   - Overall risk score from 1 to 10 where 10 is most critical
   - One paragraph summary of the security posture

2. CRITICAL FINDINGS
   - List every high severity issue found
   - For each issue: what it is, which user or role it affects, why it is dangerous

3. MEDIUM FINDINGS
   - List every medium severity issue found
   - For each: what it is, which resource, recommended fix

4. LOW FINDINGS
   - Minor issues and improvements

5. IAM BEST PRACTICE VIOLATIONS
   - Check against these specific rules:
   * No wildcard permissions in production policies
   * MFA should be enabled for all users with console access
   * Access keys should be rotated every 90 days
   * No inline policies attached directly to users
   * Roles should follow principle of least privilege
   * Root account should not have active access keys
   * No users should have both programmatic and console access unless required

6. REMEDIATION PLAN
   - Prioritised list of actions to take, most critical first
   - Each action should include the specific AWS CLI or console steps

7. COMPLIANCE NOTES
   - Note any potential compliance issues with SOC2, ISO27001, or CIS AWS Benchmark

Be specific. Name the exact users, roles, and policies that have issues.
This is a professional security audit report."""
    )

    chain = LLMChain(llm=llm, prompt=prompt_template)

    iam_summary = {
        'users': users,
        'roles_count': len(roles),
        'roles_sample': roles[:5],
        'custom_policies': policies
    }

    result = chain.invoke({
        'iam_data': json.dumps(iam_summary, indent=2, default=str)
    })

    return result['text']


@app.route('/api/scan', methods=['POST'])
def scan_iam():
    try:
        print('Starting IAM scan...')
        users = fetch_iam_users()
        print(f'Fetched {len(users)} users')
        roles = fetch_iam_roles()
        print(f'Fetched {len(roles)} roles')
        policies = fetch_iam_policies()
        print(f'Fetched {len(policies)} custom policies')

        print('Running LangChain analysis...')
        report = analyse_iam_with_langchain(users, roles, policies)

        return jsonify({
            'status': 'success',
            'users_scanned': len(users),
            'roles_scanned': len(roles),
            'policies_scanned': len(policies),
            'report': report,
            'raw': {
                'users': users,
                'roles': roles[:5],
                'policies': policies
            }
        })

    except Exception as e:
        print(f'Scan error: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'PierreGuard Scan',
        'version': '1.0'
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)