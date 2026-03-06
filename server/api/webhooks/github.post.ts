/**
 * ========================================================================
 * [WEBHOOK] :: GITHUB PUSH WEBHOOK
 * ========================================================================
 * DESC:   Receptor de webhooks de GitHub para actualización automática.
 *         Flujo:
 *         1. Verificar método POST
 *         2. Parsear y validar payload con Zod
 *         3. Detectar cambios en README
 *         4. Trigger ingestión
 * ========================================================================
 */
import { Octokit } from 'octokit';
import { z } from 'zod';
import { ingestProject } from '../../utils/ingest';
import { invalidateAllProjectCaches } from '../../utils/cache';
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

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method not allowed',
    });
  }

  const githubEvent = getHeader(event, 'x-github-event');

  logger.webhook.received(githubEvent || 'unknown', 'github');

  if (githubEvent !== 'push') {
    logger.webhook.skipped(`event not supported: ${githubEvent}`);
    return { status: 'ignored', reason: `Event ${githubEvent} not supported` };
  }

  const body = await readRawBody(event);
  if (!body) {
    logger.webhook.error('no body provided');
    throw createError({
      statusCode: 400,
      message: 'Request body is required',
    });
  }

  logger.webhook.received('PUSH', 'body received, parsing...');

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
  logger.webhook.received('PUSH', `octokit: ${!!octokit}`);

  try {
    const result = await ingestProject(repository.owner.login, repository.name, octokit);

    logger.webhook.received(
      'INGEST',
      `action: ${result.action} | id: ${result.projectId || 'N/A'}`,
    );

    if (result.action === 'save') {
      await invalidateAllProjectCaches();
      logger.cache.invalidated('all projects');
    }

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
