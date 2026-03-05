/**
 * ========================================================================
 * [AI] :: PROJECT EXTRACTION
 * ========================================================================
 * DESC:   Extracción de metadatos de proyectos usando DeepSeek API.
 *         Compatible con OpenAI SDK.
 * ========================================================================
 */
import OpenAI from 'openai';
import { ProjectSchema, type Project } from '../../shared/types';

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.NUXT_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('[AI] DeepSeek API key is required (NUXT_DEEPSEEK_API_KEY)');
  }
  return new OpenAI({
    baseURL: DEEPSEEK_BASE_URL,
    apiKey,
  });
}

interface ExtractOptions {
  repoUrl: string;
  readmeContent: string;
  hiddenData?: {
    postUrl?: string;
    blogUrl?: string;
    imagesUrl?: string[];
  };
}

export async function extractProjectData({
  repoUrl,
  readmeContent,
  hiddenData,
}: ExtractOptions): Promise<Project> {
  const client = getOpenAIClient();

  const readmeTruncated = readmeContent.slice(0, 15000);
  const jsonSchema = ProjectSchema.toJSONSchema();

  const systemPrompt = `You are a high-precision technical analyst specialized in extracting structured data from GitHub README files.

## MISSION
Extract technical metadata from the provided README content and convert it to the exact JSON structure specified.

## STRICT RULES

1. **id**: Must be the repository slug (lowercase, dashes for spaces)
   - Example: "my-cool-project" from "https://github.com/username/my-cool-project"

2. **title**: Clean, punchy project name (no "Demo of" or "Project:" prefixes)

3. **tagline**: Maximum 2-3 words that capture the project's essence
   - English (en) and Spanish (es)
   - Example: { "en": "AI Code Review", "es": "Revisión IA" }

4. **description**: 150-200 characters describing what the project does
   - English (en) and Spanish (es)
   - Must be compelling and descriptive

5. **techStack**: Array of specific technologies used
   - No versions (use "Vue" not "Vue 3")
   - Include framework, language, key libraries

6. **primaryTech**: Main technology (framework > language)
   - NO versions
   - Example: "Vue", "React", "Node.js", "Python"

7. **mainImgUrl**: Main screenshot/image URL
   - Convert relative paths to raw GitHub URLs
   - Example: "./screenshot.png" → "https://raw.githubusercontent.com/owner/repo/main/screenshot.png"

8. **imagesUrl**: Additional images array (convert relative paths to raw URLs)

9. **repoUrl**: The GitHub repository URL (provided)

10. **liveUrl**: Live demo URL if available in the README

11. **year**: Current year or year of creation (4 digits)

12. **postUrl**: Blog post or article about the project (from hidden metadata)

13. **blogUrl**: Additional blog or documentation URL (from hidden metadata)

## HIDDEN METADATA
The following data was extracted from hidden comments in the README:
${
  hiddenData
    ? `
- postUrl: ${hiddenData.postUrl || 'not provided'}
- blogUrl: ${hiddenData.blogUrl || 'not provided'}
- additionalImages: ${hiddenData.imagesUrl?.join(', ') || 'not provided'}
`
    : 'None provided'
}

## OUTPUT FORMAT
You MUST return ONLY valid JSON matching this exact schema:
${JSON.stringify(jsonSchema, null, 2)}

## EXAMPLE OUTPUT
{
  "id": "tinyshow",
  "title": "TinyShow",
  "tagline": { "en": "Portfolio Generator", "es": "Generador de Portfolio" },
  "description": { "en": "Automated portfolio generator...", "es": "Generador automático de portfolio..." },
  "techStack": ["Vue", "TypeScript", "Drizzle", "Neon"],
  "primaryTech": "Vue",
  "mainImgUrl": "https://raw.githubusercontent.com/owner/tinyshow/main/screenshot.png",
  "imagesUrl": ["https://raw.githubusercontent.com/owner/tinyshow/main/img1.png"],
  "repoUrl": "https://github.com/owner/tinyshow",
  "liveUrl": "https://tinyshow.vercel.app",
  "year": 2024,
  "postUrl": null,
  "blogUrl": null
}`;

  const userPrompt = `## README CONTENT
\`\`\`markdown
${readmeTruncated}
\`\`\`

## REPOSITORY URL
${repoUrl}

Extract the project data now. Return ONLY valid JSON.`;

  console.log('[AI] Calling DeepSeek API for extraction...');

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('[AI] No content returned from DeepSeek API');
  }

  console.log('[AI] Raw response received, parsing...');

  try {
    const rawData = JSON.parse(content);
    const validated = ProjectSchema.parse(rawData);
    console.log('[AI] Project data validated successfully');
    return validated;
  } catch (error) {
    console.error('[AI] Validation failed:', error);
    throw new Error(`[AI] Failed to validate project data: ${error}`);
  }
}
