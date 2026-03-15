import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.enum(['weekly_log', 'find', 'breakdown', 'roots']),
        topics: z.array(z.string()),
        time_to_read: z.number(),
        published: z.boolean(),
        slug: z.string(),
        image: z.string().optional(),
      }),
    }),
  },
});
