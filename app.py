import os
import json
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
KNOWLEDGE_BASE_ID = os.environ.get('KNOWLEDGE_BASE_ID', '58SGJUBGOB')
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

bedrock_agent = boto3.client(
    'bedrock-agent-runtime',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY
)


def call_claude(prompt):
    body = json.dumps({
        'anthropic_version': 'bedrock-2023-05-31',
        'max_tokens': 2500,
        'temperature': 0,
        'messages': [
            {'role': 'user', 'content': prompt}
        ]
    })
    response = bedrock_runtime.invoke_model(
        modelId=CLAUDE_MODEL,
        body=body,
        contentType='application/json',
        accept='application/json'
    )
    result = json.loads(response['body'].read())
    return result['content'][0]['text']


def query_knowledge_base(query):
    try:
        response = bedrock_agent.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': query},
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 3
                }
            }
        )
        results = []
        for result in response.get('retrievalResults', []):
            results.append(result['content']['text'])
        return '\n\n'.join(results)[:2000]
    except Exception as e:
        print(f'Knowledge base query error: {str(e)}')
        return ''


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
            'access_keys': [],
            'inline_policies': []
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
    for role in response['Roles'][:10]:
        role_data = {
            'name': role['RoleName'],
            'created': str(role['CreateDate']),
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
    for policy in response['Policies'][:8]:
        try:
            policies.append({'name': policy['PolicyName']})
        except Exception as e:
            print(f'Error fetching policy: {str(e)}')
    return policies


def build_compact_summary(users, roles, policies):
    user_summaries = []
    for u in users:
        user_summaries.append({
            'username': u['username'],
            'policies': u['policies'],
            'groups': u['groups'],
            'key_count': len(u['access_keys']),
            'inline_policies': u['inline_policies']
        })
    return {
        'total_users': len(users),
        'users': user_summaries,
        'roles_count': len(roles),
        'roles': [{'name': r['name'], 'policies': r['policies']} for r in roles[:5]],
        'custom_policies': [p['name'] for p in policies]
    }


def analyse_iam(users, roles, policies, kb_context):
    compact = build_compact_summary(users, roles, policies)

    prompt = (
        "You are an expert AWS IAM security auditor for PierreGuard AI.\n\n"
        "PIERREGUARD SECURITY STANDARDS:\n"
        + kb_context +
        "\n\nIAM CONFIGURATION:\n"
        + json.dumps(compact, indent=2, default=str) +
        "\n\nProduce a security audit with these sections:\n\n"
        "1. EXECUTIVE SUMMARY\n"
        "   - Risk score 1-10\n"
        "   - Brief summary\n\n"
        "2. CRITICAL FINDINGS\n"
        "   - User affected, standard violated, why dangerous, AWS CLI fix\n\n"
        "3. HIGH FINDINGS\n"
        "   - Same format\n\n"
        "4. MEDIUM FINDINGS\n"
        "   - Same format\n\n"
        "5. LOW FINDINGS\n"
        "   - Brief list\n\n"
        "6. USER RISK SUMMARY\n"
        "   - Format: USERNAME | RISK_LEVEL | REASON\n"
        "   - RISK_LEVEL must be: CRITICAL, HIGH, MEDIUM, LOW, or CLEAN\n\n"
        "7. REMEDIATION PLAN\n"
        "   - Top 5 priority actions with AWS CLI commands\n\n"
        "8. COMPLIANCE STATUS\n"
        "   - CIS AWS Benchmark, SOC2, ISO27001: PASS, PARTIAL, or FAIL\n\n"
        "Be specific. Name exact users and policies."
    )

    return call_claude(prompt)


def parse_user_risk_summary(report):
    lines = report.split('\n')
    users = []
    in_section = False
    for line in lines:
        if 'USER RISK SUMMARY' in line.upper():
            in_section = True
            continue
        if in_section and line.strip().startswith('7.'):
            break
        if in_section and '|' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 3:
                username = parts[0].replace('-', '').replace('*', '').strip()
                risk = parts[1].strip().upper()
                reason = parts[2].strip()
                if risk in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAN']:
                    users.append({
                        'username': username,
                        'risk': risk,
                        'reason': reason
                    })
    return users


@app.route('/api/scan', methods=['POST'])
def scan_iam():
    try:
        print('Querying knowledge base...')
        kb_context = query_knowledge_base(
            'IAM security standards access key MFA least privilege'
        )
        print(f'KB: {len(kb_context)} chars')

        print('Fetching IAM data...')
        users = fetch_iam_users()
        roles = fetch_iam_roles()
        policies = fetch_iam_policies()
        print(f'Users: {len(users)}, Roles: {len(roles)}, Policies: {len(policies)}')

        print('Calling Claude via Bedrock...')
        report = analyse_iam(users, roles, policies, kb_context)
        print('Analysis complete')

        user_risks = parse_user_risk_summary(report)

        return jsonify({
            'status': 'success',
            'users_scanned': len(users),
            'roles_scanned': len(roles),
            'policies_scanned': len(policies),
            'report': report,
            'user_risks': user_risks,
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
        'version': '1.0',
        'knowledge_base': KNOWLEDGE_BASE_ID
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)