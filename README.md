# jiraValidationExperiment

✅ Summary: GitLab CI Template for Jira Ticket Validation

jira-validation.yml:	CI job template to validate Jira tickets in commit messages
validate-jira.ts:	TypeScript script to perform ticket validation via Jira API
Shared project repo:	Stores template and script for cross-project use

This provides an experimental layout of a Typescript solution for evaluating JIRA tickets in a GitLab commit to ensure that they are still in an active state (not closed, done or resolved)
   
📦 Usage in Other Projects
In your .gitlab-ci.yml:

yaml

include:
  - project: 'your-group/jira-ci-templates'
    file: '/templates/jira-validation.yml'
    ref: main

validate-jira:
  extends: .validate-jira


🔐 Secure Variables in GitLab
Under Settings > CI/CD > Variables, add:

Variable	Example	Scope
JIRA_AUTH	base64(email:api_token)	Masked, protected
JIRA_DOMAIN	your-domain.atlassian.net	Protected

🧠 Benefits
Centralized validation logic

Securely reused across GitLab projects

Minimal setup—just include and configure secrets
