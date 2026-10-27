import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PlaceDetailClient from '@/components/PlaceDetailClientV2';
import {
  findPlaceBySlug,
  placesData,
  experiencesData,
  sourcesFor,
  getCategory,
} from '@/lib/data/repository';

export function generateStaticParams() {
  return placesData.map((place) => ({ id: place.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const place =
    findPlaceBySlug(params.id) ?? placesData.find((item) => item.id === params.id);
  return {
    title: place
      ? `${place.name} | Bình Mỹ Du Ký Website`
      : 'Không tìm thấy địa điểm',
    description: place?.shortDescription,
  };
}

export default function ExperienceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const place =
    findPlaceBySlug(params.id) ?? placesData.find((item) => item.id === params.id);
  if (!place) notFound();

  const category = getCategory(place.primaryCategory)!;
  const activities = experiencesData.filter((item) => item.placeId === place.id);
  const sourceIds = Array.from(
    new Set([
      ...place.sourceIds,
      ...activities.flatMap((item) => [
        ...item.evidence.sourceIds,
        ...(item.priceRules?.flatMap((rule) => rule.sourceId ? [rule.sourceId] : []) ?? []),
        ...(item.seasonAvailability?.sourceIds ?? []),
      ]),
    ])
  );
  const sources = sourcesFor(sourceIds);

  return (
    <PlaceDetailClient
      place={place}
      category={category}
      activities={activities}
      sources={sources}
    />
  );
}
