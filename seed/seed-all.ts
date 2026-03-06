/**
 * ========================================================================
 * [SEED] :: SEED ALL REPOSITORIES
 * ========================================================================
 * DESC:   Script CLI para ingestar TODOS los repositorios de un usuario.
 *         Uso: bun run seed/seed-all.ts <username>
 *         Ejemplo: bun run seed/seed-all.ts samuhlo
 *
 *         Reporta:
 *         - ✅ Guardados
 *         - ❌ Omitidos (hidden)
 *         - ⚠️ Faltantes (strict mode)
 *         - 💥 Error IA
 * ========================================================================
 */
import { Octokit } from 'octokit';
import { db } from '../server/db';
import { projects } from '../server/db/schema';
import { extractProjectData } from '../server/utils/ai';
import type { Project } from '../shared/types';

const HIDDEN_MARKER = '<!-- portfolio:hidden -->';
const MIN_README_LENGTH = 50;

interface SeedResult {
  saved: string[];
  skipped: string[];
  missing: string[];
  failed: string[];
}

function parseHiddenData(content: string) {
  const data: { postUrl?: string; blogUrl?: string; imagesUrl?: string[] } = {};

  const postUrlMatch = content.match(/<!--\s*post_url:\s*(.*?)\s*-->/i);
  if (postUrlMatch?.[1]) data.postUrl = postUrlMatch[1].trim();

  const blogUrlMatch = content.match(/<!--\s*blog_url:\s*(.*?)\s*-->/i);
  if (blogUrlMatch?.[1]) data.blogUrl = blogUrlMatch[1].trim();

  const imagesMatch = content.match(/<!--\s*images_url:\s*([\s\S]*?)\s*-->/i);
  if (imagesMatch?.[1]) {
    data.imagesUrl = imagesMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  return data;
}

async function fetchReadme(octokit: Octokit, owner: string, repo: string) {
  for (const branch of ['main', 'master']) {
    try {
      const res = await octokit.rest.repos.getReadme({ owner, repo, ref: branch });
      return Buffer.from(res.data.content ?? '', 'base64').toString('utf-8');
    } catch {
      continue;
    }
  }
  return null;
}

async function saveProject(project: Project) {
  await db
    .insert(projects)
    .values({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      vNote: project.vNote,
      projectColor: project.projectColor,
      hoverTextCard: project.hoverTextCard,
      techStack: project.techStack,
      primaryTech: project.primaryTech,
      mainImgUrl: project.mainImgUrl,
      imagesUrl: project.imagesUrl,
      repoUrl: project.repoUrl,
      liveUrl: project.liveUrl,
      year: project.year,
      postUrl: project.postUrl,
      blogUrl: project.blogUrl,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: projects.id,
      set: {
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        vNote: project.vNote,
        projectColor: project.projectColor,
        hoverTextCard: project.hoverTextCard,
        techStack: project.techStack,
        primaryTech: project.primaryTech,
        mainImgUrl: project.mainImgUrl,
        imagesUrl: project.imagesUrl,
        repoUrl: project.repoUrl,
        liveUrl: project.liveUrl,
        year: project.year,
        postUrl: project.postUrl,
        blogUrl: project.blogUrl,
        updatedAt: new Date(),
      },
    });
}

async function ingestSingleRepo(
  octokit: Octokit,
  owner: string,
  repoName: string,
  strictMode: boolean,
): Promise<{ status: 'saved' | 'skipped' | 'missing' | 'failed'; reason?: string }> {
  const fullRepoUrl = `https://github.com/${owner}/${repoName}`;

  const readmeContent = await fetchReadme(octokit, owner, repoName);
  if (!readmeContent) {
    return { status: 'failed', reason: 'README not found' };
  }

  if (readmeContent.includes(HIDDEN_MARKER)) {
    return { status: 'skipped', reason: 'Hidden marker detected' };
  }

  if (readmeContent.length < MIN_README_LENGTH) {
    return { status: 'failed', reason: `README too short (${readmeContent.length} chars)` };
  }

  const hiddenData = parseHiddenData(readmeContent);

  let project: Project;
  try {
    project = await extractProjectData({
      repoUrl: fullRepoUrl,
      readmeContent,
      hiddenData,
    });
  } catch (error) {
    console.error(`[IA ERROR] ${owner}/${repoName}: ${error}`);
    return { status: 'failed', reason: `IA extraction failed: ${error}` };
  }

  if (strictMode) {
    const missing: string[] = [];
    if (!project.mainImgUrl) missing.push('mainImgUrl');
    if (!project.imagesUrl?.length) missing.push('imagesUrl');
    if (!project.liveUrl) missing.push('liveUrl');

    if (missing.length > 0) {
      return { status: 'missing', reason: `Missing required fields: ${missing.join(', ')}` };
    }
  }

  await saveProject(project);
  return { status: 'saved' };
}

async function main() {
  const username = process.argv[2];

  if (!username) {
    console.error('Usage: bun run seed/seed-all.ts <username>');
    console.error('Example: bun run seed/seed-all.ts samuhlo');
    process.exit(1);
  }

  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('[SEED] GITHUB_SEED_TOKEN is required');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });
  const strictMode = process.env.NUXT_STRICT_MODE !== 'false';

  console.log(`[SEED] Fetching repositories for @${username}...`);
  console.log(`[SEED] Strict mode: ${strictMode}`);
  console.log('='.repeat(60));

  let repos: Array<{ name: string }> = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await octokit.rest.repos.listForUser({
      username,
      per_page: 100,
      page,
      sort: 'updated',
    });

    if (response.data.length === 0) {
      hasMore = false;
    } else {
      repos = [...repos, ...response.data];
      page++;
      if (response.data.length < 100) hasMore = false;
    }
  }

  console.log(`[SEED] Found ${repos.length} repositories\n`);

  const result: SeedResult = {
    saved: [],
    skipped: [],
    missing: [],
    failed: [],
  };

  for (const repo of repos) {
    process.stdout.write(
      `[${repos.indexOf(repo) + 1}/${repos.length}] Processing ${username}/${repo.name}... `,
    );

    const ingestResult = await ingestSingleRepo(octokit, username, repo.name, strictMode);

    switch (ingestResult.status) {
      case 'saved':
        console.log('✅');
        result.saved.push(repo.name);
        break;
      case 'skipped':
        console.log('❌ (hidden)');
        result.skipped.push(repo.name);
        break;
      case 'missing':
        console.log(`⚠️  (${ingestResult.reason})`);
        result.missing.push(repo.name);
        break;
      case 'failed':
        console.log(`💥 (${ingestResult.reason})`);
        result.failed.push(repo.name);
        break;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('[SEED] SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Saved:      ${result.saved.length}`);
  console.log(`❌ Skipped:    ${result.skipped.length}`);
  console.log(`⚠️  Missing:   ${result.missing.length}`);
  console.log(`💥 Failed:     ${result.failed.length}`);
  console.log('='.repeat(60));

  if (result.saved.length > 0) {
    console.log('\n✅ SAVED PROJECTS:');
    result.saved.forEach((r) => console.log(`  - ${r}`));
  }

  if (result.skipped.length > 0) {
    console.log('\n❌ SKIPPED (Hidden):');
    result.skipped.forEach((r) => console.log(`  - ${r}`));
  }

  if (result.missing.length > 0) {
    console.log('\n⚠️  MISSING (Strict Mode):');
    result.missing.forEach((r) => console.log(`  - ${r}`));
  }

  if (result.failed.length > 0) {
    console.log('\n💥 FAILED (IA Error):');
    result.failed.forEach((r) => console.log(`  - ${r}`));
  }

  console.log('\n[SEED] Done!');
}

main();
