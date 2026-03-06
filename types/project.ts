import type { Component } from 'vue';

export interface Project {
  id: string;
  title: string;
  tagline: { en: string; es: string };
  description: { en: string; es: string };
  vNote?: { en: string; es: string } | null;
  projectColor?: string | null;
  hoverTextCard?: string | null;
  techStack: string[];
  primaryTech: string;
  mainImgUrl: string | null;
  imagesUrl: string[] | null;
  repoUrl: string;
  liveUrl: string | null;
  postUrl?: string | null;
  blogUrl?: string | null;
  year: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProjectCardProps {
  name: string;
  image: string;
  avatar?: Component;
  hoverLabel?: string;
  color?: string;
  minWidth?: string;
  maxWidth?: string;
  avatarSize?: string;
  avatarStroke?: string;
  gridClass?: string;
  slug?: string;
}
