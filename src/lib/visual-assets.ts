import type { SeasonId } from '@/lib/seasons';

export const seasonImagePaths: Record<SeasonId, string> = {
  spring: '/images/showcase/hero-river.jpg',
  summer: '/images/showcase/hero-orchard.jpg',
  autumn: '/images/showcase/cat-craft.jpg',
  winter: '/images/showcase/cat-farm.jpg',
};

export const placeImagePaths: Record<string, string[]> = {
  'wetro-moon-river': [
    '/images/showcase/hero-river.jpg',
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/cat-craft.jpg',
  ],
  'vuon-ky-uc': [
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/hero-river.jpg',
    '/images/showcase/cat-farm.jpg',
  ],
  'vuon-lang-nghe-sang-tao': [
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/cat-craft.jpg',
    '/images/showcase/hero-river.jpg',
  ],
  'gom-hai-tu': [
    '/images/showcase/cat-craft.jpg',
    '/images/showcase/hero-river.jpg',
    '/images/showcase/hero-orchard.jpg',
  ],
  'bo-sua-ba-thang': [
    '/images/showcase/cat-farm.jpg',
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/hero-river.jpg',
  ],
};
