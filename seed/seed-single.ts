/**
 * ========================================================================
 * [SEED] :: SEED SINGLE PROJECT
 * ========================================================================
 * DESC:   Script CLI para ingestar un solo repositorio a la BD.
 *         Uso: bun run seed/seed-single.ts <repo-url>
 *         Ejemplo: bun run seed/seed-single.ts https://github.com/username/my-project
 * ========================================================================
 */
import { Octokit } from 'octokit';
import { db } from '../server/db';
import { projects } from '../server/db/schema';
import { extractProjectData } from '../server/utils/ai';
import { logger } from '../server/utils/logger';
import type { Project } from '../shared/types';

const HIDDEN_MARKER = '<!-- portfolio:hidden -->';
const MIN_README_LENGTH = 50;

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
  logger.seed.saving(project.id);

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

  logger.seed.saved(project.id);
}

async function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    logger.seed.error('usage: bun run seed/seed-single.ts <repo-url>');
    process.exit(1);
  }

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    logger.seed.error('invalid GitHub URL format');
    process.exit(1);
  }

  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');

  logger.seed.start(`${owner}/${repoName}`);

  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    logger.seed.error('GITHUB_SEED_TOKEN is required');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });
  const fullRepoUrl = `https://github.com/${owner}/${repoName}`;

  logger.seed.start(`fetching README from ${owner}/${repoName}`);

  const readmeContent = await fetchReadme(octokit, owner, repoName);
  if (!readmeContent) {
    logger.seed.error('README not found');
    process.exit(1);
  }

  if (readmeContent.includes(HIDDEN_MARKER)) {
    logger.seed.skipped('hidden marker detected');
    process.exit(0);
  }

  if (readmeContent.length < MIN_README_LENGTH) {
    logger.seed.error(`README too short (${readmeContent.length} chars)`);
    process.exit(1);
  }

  const hiddenData = parseHiddenData(readmeContent);
  const strictMode = process.env.NUXT_STRICT_MODE !== 'false';

  logger.seed.start(`extracting with IA (strictMode: ${strictMode})`);

  let project: Project;
  try {
    project = await extractProjectData({
      repoUrl: fullRepoUrl,
      readmeContent,
      hiddenData,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'unknown';
    logger.seed.error(`extraction failed: ${errMsg}`);
    process.exit(1);
  }

  if (strictMode) {
    const missing: string[] = [];
    if (!project.mainImgUrl) missing.push('mainImgUrl');
    if (!project.imagesUrl?.length) missing.push('imagesUrl');
    if (!project.liveUrl) missing.push('liveUrl');

    if (missing.length > 0) {
      logger.seed.error(`strict mode: missing ${missing.join(', ')}`);
      process.exit(1);
    }
  }

  await saveProject(project);
}

main();
