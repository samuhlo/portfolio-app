---
title: How I Built My Blog with Nuxt Content
description: I started with a CMS-heavy plan, then switched to Nuxt Content and ended up with a simpler and more robust writing workflow.
date: "2026-03-19"
category: breakdown
topics: ["nuxt", "nuxt content", "vue", "markdown", "components"]
time_to_read: 8
published: true
lang: en
translationKey: blog-with-nuxt-content
slug: building-my-blog-with-nuxt-content
---

## I was going to over-engineer it

My original plan involved an external CMS, webhooks, and a processing pipeline. It was familiar, but too heavy for a personal blog where I wanted to publish quickly.

Nuxt Content changed that decision. Markdown files, typed frontmatter, direct rendering, and component support gave me everything I needed with less infrastructure.

## What made the difference

The schema in `content.config.ts` gave me strong guarantees at build time. If metadata is missing or invalid, I catch it before publishing.

Using Vue components directly inside Markdown was the second big win. It let me include visual blocks and interactive elements without leaving the content workflow.

## Why I kept this approach

- Fewer moving parts than a CMS + webhook setup.
- Content and code evolve together.
- Better control over long-term maintainability.

For this project, Nuxt Content was not just simpler. It was a better fit for how I write and ship.
