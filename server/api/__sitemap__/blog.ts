type BlogLocale = 'es' | 'en' | 'gl';

type SitemapBlogPost = {
  slug: string;
  lang: BlogLocale;
  date: string;
  translationKey: string;
};

const BLOG_LOCALE_PREFIX: Record<BlogLocale, string> = {
  es: '',
  en: '/en',
  gl: '/gl',
};

const BLOG_LOCALE_SITEMAP: Record<BlogLocale, string> = {
  es: 'es-ES',
  en: 'en-US',
  gl: 'gl-ES',
};

const BLOG_LOCALE_HREFLANG: Record<BlogLocale, string> = {
  es: 'es-ES',
  en: 'en-US',
  gl: 'gl-ES',
};

function toBlogRoute(lang: BlogLocale, slug: string): string {
  return `${BLOG_LOCALE_PREFIX[lang]}/blog/${slug}`;
}

function toLastmod(date: string): string | undefined {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString();
}

export default defineSitemapEventHandler(async (event) => {
  const rawPosts = (await queryCollection(event, 'blog')
    .where('published', '=', true)
    .where('slug', '<>', '')
    .select('slug', 'lang', 'date', 'translationKey')
    .all()) as SitemapBlogPost[];

  const posts = rawPosts.filter(
    (post): post is SitemapBlogPost =>
      Boolean(post.slug) &&
      Boolean(post.date) &&
      (post.lang === 'es' || post.lang === 'en' || post.lang === 'gl'),
  );

  const groupedByTranslation = posts.reduce<Map<string, SitemapBlogPost[]>>((acc, post) => {
    const key = post.translationKey || `${post.lang}:${post.slug}`;
    const current = acc.get(key) ?? [];
    current.push(post);
    acc.set(key, current);
    return acc;
  }, new Map());

  return posts.map((post) => {
    const key = post.translationKey || `${post.lang}:${post.slug}`;
    const siblings = groupedByTranslation.get(key) ?? [post];

    return {
      loc: toBlogRoute(post.lang, post.slug),
      _sitemap: BLOG_LOCALE_SITEMAP[post.lang],
      lastmod: toLastmod(post.date),
      changefreq: 'weekly',
      priority: 0.7,
      alternatives: siblings.map((sibling) => ({
        hreflang: BLOG_LOCALE_HREFLANG[sibling.lang],
        href: toBlogRoute(sibling.lang, sibling.slug),
      })),
    };
  });
});
