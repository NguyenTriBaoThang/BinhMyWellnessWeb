export type VerificationStatus = 'verified' | 'reported' | 'needs_confirmation' | 'unknown' | 'unverified';
export type TransportMode = 'car' | 'bike' | 'walk' | 'boat';

export interface SiteData {
  name: string;
  tagline: string;
  introduction: string;
  locality: string;
  updatedAt: string;
  contentModel: 'repository-json';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: 'waves' | 'sprout' | 'shapes' | 'wheat';
  accent: string;
}

export interface Source {
  id: string;
  title: string;
  publisher: string;
  author: string | null;
  publishedAt: string | null;
  sourceUrl: string;
  checkedAt: string;
  scopeNote: string;
}

export interface VerifiedFact {
  status: VerificationStatus;
  sourceIds: string[];
  checkedAt: string | null;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  primaryCategory: string;
  secondaryCategories: string[];
  shortDescription: string;
  locality: string;
  areaCode: string | null;
  address: string | null;
  coordinates: { latitude: number; longitude: number } | null;
  coordinateStatus: VerificationStatus;
  contacts: { phone?: string; email?: string; website?: string } | null;
  imageIds: string[];
  sourceIds: string[];
  updatedAt: string;
  verification: {
    identity: VerifiedFact;
    area: VerifiedFact;
    address: VerifiedFact;
    coordinates: VerifiedFact;
    hours: VerifiedFact;
    pricing: VerifiedFact;
    operations: VerifiedFact;
  };
}

export interface PriceRule {
  amountVnd: number;
  basis: 'per_adult' | 'per_child' | 'per_group';
  status: 'verified' | 'user_estimate';
  sourceId: string | null;
  checkedAt: string | null;
  ageMinimum: number | null;
  ageMaximum: number | null;
  minGroup: number | null;
  capacity: number | null;
  included: string[];
  excluded: string[];
}

export interface TimeWindow {
  start: string;
  end: string;
}

export interface Experience {
  id: string;
  placeId: string | null;
  categoryId: string;
  name: string;
  activities: string[];
  durationMinutes: number | null;
  weeklyHours: Partial<Record<'0' | '1' | '2' | '3' | '4' | '5' | '6', TimeWindow[]>> | null;
  dateExceptions: Array<{ date: string; closed?: boolean; windows?: TimeWindow[] }>;
  seasonAvailability: { status: 'verified' | 'needs_confirmation'; dates: string[]; yearRound: boolean; sourceIds: string[]; checkedAt: string | null } | null;
  bookingRequirement: string;
  suitability: { status: 'verified' | 'unknown'; ageMinimum: number | null; ageMaximum: number | null; notes: string | null };
  priceRules: PriceRule[] | null;
  evidence: { status: 'verified' | 'reported' | 'reported_without_provider' | 'needs_confirmation'; sourceIds: string[]; checkedAt: string | null };
  routeEligible: boolean;
  bookingAllowed: boolean;
}

export interface ImageRecord {
  id: string;
  placeId: string | null;
  categoryId: string;
  researchPath: string | null;
  publishedPath: string | null;
  sourceUrl: string;
  credit: string;
  rightsStatus: 'permission_not_verified' | 'licensed' | 'owner_granted' | 'self_owned';
  publishAllowed: boolean;
  alt: string;
}

export interface RouteEdge {
  fromPlaceId: string;
  toPlaceId: string;
  mode: TransportMode;
  distanceMeters: number;
  durationSeconds: number;
  geometryRef: string;
  sourceId: string;
  generatedAt: string;
  status: 'verified' | 'closed' | 'needs_confirmation';
}

export interface RouteMatrix {
  version: number;
  generatedAt: string | null;
  edges: RouteEdge[];
}

export interface RouteGeometryCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    properties: Record<string, unknown>;
    geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
  }>;
}
