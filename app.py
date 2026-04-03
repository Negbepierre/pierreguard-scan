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


def get_llm():
    return ChatBedrock(
        client=bedrock_runtime,
        model_id=CLAUDE_MODEL,
        model_kwargs={
            'max_tokens': 4096,
            'temperature': 0
        }
    )


def query_knowledge_base(query):
    try:
        response = bedrock_agent.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={'text': query},
            retrievalConfiguration={
                'vectorSearchConfiguration': {
                    'numberOfResults': 5
                }
            }
        )
        results = []
        for result in response.get('retrievalResults', []):
            results.append(result['content']['text'])
        return '\n\n'.join(results)
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
        try:
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
        except Exception as e:
            print(f'Error fetching policy {policy["PolicyName"]}: {str(e)}')
    return policies


def analyse_iam_with_langchain(users, roles, policies, kb_context):
    llm = get_llm()

    template_str = (
        "You are an expert AWS IAM security auditor for PierreGuard AI.\n\n"
        "You must assess the IAM configuration against the PierreGuard Security Standards below.\n"
        "Every finding must reference the specific standard it violates.\n\n"
        "PIERREGUARD SECURITY STANDARDS:\n{security_standards}\n\n"
        "IAM CONFIGURATION TO AUDIT:\n{iam_data}\n\n"
        "Produce a structured security audit report with these exact sections:\n\n"
        "1. EXECUTIVE SUMMARY\n"
        "   - Overall risk score from 1 to 10 based on the PierreGuard risk scoring framework\n"
        "   - One paragraph summary of the security posture\n\n"
        "2. CRITICAL FINDINGS\n"
        "   - Each finding must include:\n"
        "     * Which user or role is affected\n"
        "     * Which PierreGuard standard is violated\n"
        "     * Why this is dangerous\n"
        "     * Specific remediation step with AWS CLI command\n\n"
        "3. HIGH FINDINGS\n"
        "   - Same format as critical findings\n\n"
        "4. MEDIUM FINDINGS\n"
        "   - Same format as critical findings\n\n"
        "5. LOW FINDINGS\n"
        "   - Brief list of minor improvements\n\n"
        "6. USER RISK SUMMARY\n"
        "   - For each user provide a one line risk assessment in this exact format:\n"
        "     USERNAME | RISK_LEVEL | ONE_LINE_REASON\n"
        "   - RISK_LEVEL must be exactly one of: CRITICAL, HIGH, MEDIUM, LOW, CLEAN\n\n"
        "7. REMEDIATION PLAN\n"
        "   - Prioritised list of actions, most critical first\n"
        "   - Include specific AWS CLI commands for each action\n\n"
        "8. COMPLIANCE STATUS\n"
        "   - Rate compliance with: CIS AWS Benchmark, SOC2, ISO27001\n"
        "   - Use PASS, PARTIAL, or FAIL for each\n\n"
        "Be specific. Name exact users, policies, and standards violated."
    )

    prompt_template = PromptTemplate(
        input_variables=['iam_data', 'security_standards'],
        template=template_str
    )

    chain = LLMChain(llm=llm, prompt=prompt_template)

    iam_summary = {
        'users': users,
        'roles_count': len(roles),
        'roles_sample': roles[:5],
        'custom_policies': policies
    }

    result = chain.invoke({
        'iam_data': json.dumps(iam_summary, indent=2, default=str),
        'security_standards': kb_context
    })

    return result['text']


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
        print('Querying PierreGuard Security Standards knowledge base...')
        kb_context = query_knowledge_base(
            'IAM security standards access key MFA least privilege user lifecycle'
        )
        print(f'Retrieved {len(kb_context)} chars from knowledge base')

        print('Fetching IAM data...')
        users = fetch_iam_users()
        print(f'Fetched {len(users)} users')
        roles = fetch_iam_roles()
        print(f'Fetched {len(roles)} roles')
        policies = fetch_iam_policies()
        print(f'Fetched {len(policies)} custom policies')

        print('Running LangChain analysis with PierreGuard standards...')
        report = analyse_iam_with_langchain(users, roles, policies, kb_context)

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