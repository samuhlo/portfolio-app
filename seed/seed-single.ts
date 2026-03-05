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
  await db
    .insert(projects)
    .values({
      id: project.id,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
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

  console.log(
    `[SEED] Project ${project.id} saved successfully (cache will be invalidated on next webhook)`,
  );
}

async function main() {
  const repoUrl = process.argv[2];

  if (!repoUrl) {
    console.error('Usage: bun run seed/seed-single.ts <repo-url>');
    console.error('Example: bun run seed/seed-single.ts https://github.com/username/my-project');
    process.exit(1);
  }

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    console.error('Invalid GitHub URL format');
    process.exit(1);
  }

  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, '');

  console.log(`[SEED] Starting seed for ${owner}/${repoName}`);

  const token = process.env.GITHUB_SEED_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('[SEED] GITHUB_SEED_TOKEN is required');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: token });
  const fullRepoUrl = `https://github.com/${owner}/${repoName}`;

  const readmeContent = await fetchReadme(octokit, owner, repoName);
  if (!readmeContent) {
    console.error('[SEED] README not found');
    process.exit(1);
  }

  if (readmeContent.includes(HIDDEN_MARKER)) {
    console.log('[SEED] Hidden marker detected, skipping');
    process.exit(0);
  }

  if (readmeContent.length < MIN_README_LENGTH) {
    console.error(`[SEED] README too short (${readmeContent.length} chars)`);
    process.exit(1);
  }

  const hiddenData = parseHiddenData(readmeContent);
  const strictMode = process.env.NUXT_STRICT_MODE !== 'false';

  console.log(`[SEED] Extracting with IA (strictMode: ${strictMode})`);

  let project: Project;
  try {
    project = await extractProjectData({
      repoUrl: fullRepoUrl,
      readmeContent,
      hiddenData,
    });
  } catch (error) {
    console.error('[SEED] Extraction failed:', error);
    process.exit(1);
  }

  if (strictMode) {
    const missing: string[] = [];
    if (!project.mainImgUrl) missing.push('mainImgUrl');
    if (!project.imagesUrl?.length) missing.push('imagesUrl');
    if (!project.liveUrl) missing.push('liveUrl');

    if (missing.length > 0) {
      console.error(`[SEED] Strict mode: missing ${missing.join(', ')}`);
      process.exit(1);
    }
  }

  await saveProject(project);
  console.log(`[SEED] Project ${project.id} saved successfully`);
}

main();
