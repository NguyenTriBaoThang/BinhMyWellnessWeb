import type { Metadata } from 'next';
import ItineraryPlanner from '@/components/itinerary/ItineraryPlanner';
import { categoriesData, experiencesData, placesData, sourcesData } from '@/lib/data/repository';

export const metadata: Metadata = { title: 'Lập hành trình | Bình Mỹ Du Ký Website' };

export default function ItineraryPage() {
  return <ItineraryPlanner places={placesData} experiences={experiencesData} categories={categoriesData} sources={sourcesData} />;
}
