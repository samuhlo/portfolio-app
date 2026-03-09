import type { BlogPost } from '~/types/blog';

/**
 * █ [DATA] :: BLOG POSTS
 * =====================================================================
 * DESC:   Posts de ejemplo para el blog.
 *         En producción, esto vendría de una API o CMS.
 * =====================================================================
 */

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'week-06-2026-creative-chaos',
    title: 'Week 06: Finding Balance in Creative Chaos',
    excerpt:
      'This week explored the delicate dance between structure and spontaneity in design systems. Plus: new experiments with physics-based animations.',
    content: `
# Finding Balance in Creative Chaos

This week has been a fascinating exploration of how much structure is too much—or not enough—when building design systems that need to feel alive.

## The Problem with Perfect Systems

We've all seen them: design systems that are so rigid, so perfectly documented, that they feel cold. Every component has its place, every color has a purpose, but something is missing. The human element.

## Embracing the Chaos

What if we approached design systems more like gardens? You plant seeds (base components), you provide water and sunlight (tokens and utilities), but you also allow for organic growth. Some plants will surprise you. Some combinations will emerge that you never planned.

### This Week's Experiments

1. **Physics-based micro-interactions**: Using Matter.js for playful interactions that respond to user input in unexpected ways
2. **Generative doodles**: SVG paths that draw themselves, adding personality without adding weight
3. **Adaptive spacing**: Systems that breathe based on content hierarchy

## The Takeaway

The best design systems aren't the ones that constrain—they're the ones that guide while leaving room for serendipity.

---

*Next week: diving deeper into the intersection of code and design.*
    `,
    category: 'weekly-log',
    publishedAt: '2026-02-07',
    readTime: 5,
    featured: true,
  },
  {
    slug: 'typography-hierarchy-movement',
    title: 'Typography in Motion: Creating Meaning Through Hierarchy',
    excerpt:
      'Exploring how animated typography can guide user attention and create emotional connections without sacrificing readability.',
    content: `
# Typography in Motion

Typography is already powerful. Add motion, and it becomes unforgettable.

## The Principles

### 1. Entrance Matters

A letter that slides into place feels different than one that fades in. The entrance sets expectations.

### 2. Hierarchy Through Timing

By varying when elements appear, we create visual hierarchy without changing size or weight. The eye follows the motion.

### 3. Rest States Are Active

Even when typography isn't animating, it should feel ready to move. This is the "implied motion" principle.

## Practical Application

In my recent work, I've been using GSAP to create what I call "staggered reveals"—where text doesn't appear all at once, but flows into existence, leading the user's eye through the content naturally.

### Code Example

\`\`\`typescript
// Staggered text reveal
gsap.from('.hero-text', {
  y: 50,
  opacity: 0,
  duration: 0.8,
  stagger: 0.1,
  ease: 'power3.out'
});
\`\`\`

## The Balance

With great power comes great responsibility. Motion should enhance, not distract. Ask yourself: does this movement serve the content, or does it show off the developer's skills?

---

*Motion is meaning. Use it wisely.*
    `,
    category: 'find',
    publishedAt: '2026-01-28',
    readTime: 8,
    featured: true,
  },
  {
    slug: 'week-05-2026-revisiting-basics',
    title: 'Week 05: Revisiting the Basics',
    excerpt:
      'Sometimes the best way to move forward is to take a step back. This week: fundamentals, first principles, and why HTML matters.',
    content: `
# Week 05: Revisiting the Basics

It's easy to get lost in frameworks, libraries, and shiny new tools. This week, I went back to fundamentals.

## The Exercise

I built a website using only HTML and CSS. No Vue, no React, no GSAP. Just semantic markup and CSS variables.

### What I Learned

1. **HTML is more powerful than we think**: Modern CSS can do things we used to need JavaScript for
2. **Semantics matter**: Accessible HTML is better HTML
3. **Constraints breed creativity**: Limited tools force creative solutions

## Returning to Vue

Coming back to Vue felt different after this exercise. I appreciated the reactivity system more. I understood why we use composables (they're just organized logic). I saw the framework as what it is: a tool, not a lifestyle.

---

*Next week: applying these lessons to a new project.*
    `,
    category: 'weekly-log',
    publishedAt: '2026-01-31',
    readTime: 4,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.category === category);
}
