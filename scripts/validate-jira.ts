import fetch from 'node-fetch';
import { execSync } from 'child_process';

const JIRA_AUTH = process.env['JIRA_AUTH'];
const JIRA_DOMAIN = process.env['JIRA_DOMAIN'];
const CI_COMMIT_BEFORE_SHA = process.env['CI_COMMIT_BEFORE_SHA'] || 'HEAD~1';
const CI_COMMIT_SHA = process.env['CI_COMMIT_SHA'] || 'HEAD';

function extractTicketId(message: string): string | null {
  const match = message.match(/[A-Z]{2,10}-\d+/);
  return match ? match[0] : null;
}

async function isTicketOpen(ticketId: string): Promise<boolean> {
  const url = `https://${JIRA_DOMAIN}/rest/api/3/issue/${ticketId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${JIRA_AUTH}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Failed to fetch ticket ${ticketId}. Status: ${response.status}`);
    return false;
  }

  const data = await response.json();
  const status = data.fields.status.name.toLowerCase();
  return !['done', 'closed', 'resolved'].includes(status);
}

function getCommitMessages(): string[] {
  const range = `${CI_COMMIT_BEFORE_SHA}..${CI_COMMIT_SHA}`;
  const log = execSync(`git log --pretty=%B ${range}`).toString();
  return log.split('\n').map(l => l.trim()).filter(Boolean);
}

(async () => {
  const messages = getCommitMessages();
  for (const msg of messages) {
    const ticketId = extractTicketId(msg);
    if (!ticketId) {
      console.error(`Missing Jira ticket in commit: "${msg}"`);
      process.exit(1);
    }

    const open = await isTicketOpen(ticketId);
    if (!open) {
      console.error(`Ticket ${ticketId} is closed. Failing pipeline.`);
      process.exit(1);
    }

    console.log(`✅ Ticket ${ticketId} is open and valid.`);
  }
})();
