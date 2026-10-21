import site from '../../../data/site.json';
import categories from '../../../data/categories.json';
import places from '../../../data/places.json';
import experiences from '../../../data/experiences.json';
import sources from '../../../data/sources.json';
import images from '../../../data/images.json';
import matrix from '../../../data/routing/matrix.json';
import routes from '../../../data/routing/routes.geojson';
import { validateCatalog } from './validate';
import type { Category, Experience, ImageRecord, Place, RouteGeometryCollection, RouteMatrix, SiteData, Source } from './types';

export const siteData = site as SiteData;
export const categoriesData = categories as Category[];
export const placesData = places as Place[];
export const experiencesData = experiences as Experience[];
export const sourcesData = sources as Source[];
export const imagesData = images as ImageRecord[];
export const routeMatrix = matrix as RouteMatrix;
export const routeGeometries = routes as RouteGeometryCollection;

validateCatalog({
  categories: categoriesData,
  places: placesData,
  experiences: experiencesData,
  sources: sourcesData,
  images: imagesData,
  matrix: routeMatrix,
  routes: routeGeometries,
});

export function findPlaceBySlug(slug: string): Place | undefined {
  return placesData.find((place) => place.slug === slug);
}

export function getCategory(id: string): Category | undefined {
  return categoriesData.find((category) => category.id === id);
}

export function sourcesFor(ids: string[]): Source[] {
  return ids.map((id) => sourcesData.find((source) => source.id === id)).filter((source): source is Source => Boolean(source));
}
