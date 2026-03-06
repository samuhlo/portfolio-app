/**
 * ========================================================================
 * [WEBHOOK] :: GITHUB PUSH WEBHOOK
 * ========================================================================
 * DESC:   Receptor de webhooks de GitHub para actualización automática.
 *         Flujo:
 *         1. Verificar método POST
 *         2. Verificar firma HMAC
 *         3. Parsear y validar payload con Zod
 *         4. Detectar cambios en README
 *         5. Trigger ingestión
 * ========================================================================
 */
import { createHmac } from 'crypto';
import { Octokit } from 'octokit';
import { z } from 'zod';
import { ingestProject } from '../../utils/ingest';
import { logger } from '../../utils/logger';

const GitHubPushPayloadSchema = z.object({
  ref: z.string(),
  repository: z.object({
    name: z.string(),
    owner: z.object({ login: z.string() }),
  }),
  commits: z.array(
    z.object({
      added: z.array(z.string()),
      modified: z.array(z.string()),
      removed: z.array(z.string()),
    }),
  ),
});

type GitHubPushPayload = z.infer<typeof GitHubPushPayloadSchema>;

function verifySignature(body: string, signature: string | undefined, secret: string): boolean {
  if (!signature) {
    logger.webhook.skipped('no signature provided, skipping verification');
    return true;
  }

  const hmac = createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(body).digest('hex');

  return signature === digest;
}

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed',
    });
  }

  const signature = getHeader(event, 'x-hub-signature-256');
  const githubEvent = getHeader(event, 'x-github-event');

  logger.webhook.received(githubEvent || 'unknown', 'github');

  if (githubEvent !== 'push') {
    logger.webhook.skipped(`event not supported: ${githubEvent}`);
    return { status: 'ignored', reason: `Event ${githubEvent} not supported` };
  }

  const webhookSecret = process.env.NUXT_GITHUB_WEBHOOK_SECRET || process.env.GITHUB_WEBHOOK_SECRET;

  const body = await readRawBody(event);
  if (!body) {
    throw createError({
      statusCode: 400,
      message: 'Request body is required',
    });
  }

  if (webhookSecret) {
    const isValid = verifySignature(body, signature, webhookSecret);
    logger.webhook.verified(isValid);
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid signature',
      });
    }
  } else {
    logger.webhook.skipped('no webhook secret configured, skipping verification');
  }

  let payload: GitHubPushPayload;
  try {
    const parsed = JSON.parse(body);
    payload = GitHubPushPayloadSchema.parse(parsed);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'unknown';
    logger.validation.error('PAYLOAD', errMsg);
    throw createError({
      statusCode: 400,
      message: `Invalid payload: ${errMsg}`,
    });
  }

  const { repository, commits } = payload;

  if (!commits || commits.length === 0) {
    logger.webhook.skipped('no commits in payload');
    return { status: 'skipped', reason: 'No commits in payload' };
  }

  const readmeChanges = commits.some((commit) => {
    const allFiles = [...commit.added, ...commit.modified];
    return allFiles.some((file) => file.toLowerCase() === 'readme.md');
  });

  if (!readmeChanges) {
    logger.webhook.skipped('no README changes detected');
    return { status: 'skipped', reason: 'No README changes' };
  }

  logger.webhook.received('PUSH', `${repository.owner.login}/${repository.name}`);

  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  const octokit = token ? new Octokit({ auth: token }) : undefined;

  try {
    const result = await ingestProject(repository.owner.login, repository.name, octokit);

    logger.webhook.received(
      'INGEST',
      `action: ${result.action} | id: ${result.projectId || 'N/A'}`,
    );

    return {
      status: result.action,
      projectId: result.projectId,
      reason: result.reason,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'unknown';
    logger.webhook.error(`ingestion failed: ${errMsg}`);
    throw createError({
      statusCode: 500,
      message: `Ingestion failed: ${errMsg}`,
    });
  }
});
