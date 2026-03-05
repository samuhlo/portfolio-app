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
    console.log('[WEBHOOK] No signature provided, skipping verification');
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

  console.log(`[WEBHOOK] Received ${githubEvent} event`);

  if (githubEvent !== 'push') {
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
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid signature',
      });
    }
  } else {
    console.log('[WEBHOOK] No webhook secret configured, skipping signature verification');
  }

  let payload: GitHubPushPayload;
  try {
    const parsed = JSON.parse(body);
    payload = GitHubPushPayloadSchema.parse(parsed);
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: `Invalid payload: ${error}`,
    });
  }

  const { repository, commits } = payload;

  if (!commits || commits.length === 0) {
    return { status: 'skipped', reason: 'No commits in payload' };
  }

  const readmeChanges = commits.some((commit) => {
    const allFiles = [...commit.added, ...commit.modified];
    return allFiles.some((file) => file.toLowerCase() === 'readme.md');
  });

  if (!readmeChanges) {
    console.log('[WEBHOOK] No README changes detected, skipping');
    return { status: 'skipped', reason: 'No README changes' };
  }

  console.log(`[WEBHOOK] README changed in ${repository.owner.login}/${repository.name}`);

  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  const octokit = token ? new Octokit({ auth: token }) : undefined;

  try {
    const result = await ingestProject(repository.owner.login, repository.name, octokit);

    console.log(`[WEBHOOK] Ingest result: ${result.action}`, result.reason || '');

    return {
      status: result.action,
      projectId: result.projectId,
      reason: result.reason,
    };
  } catch (error) {
    console.error('[WEBHOOK] Ingestion failed:', error);
    throw createError({
      statusCode: 500,
      message: `Ingestion failed: ${error}`,
    });
  }
});
