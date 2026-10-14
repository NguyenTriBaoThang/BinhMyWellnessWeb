export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'PROPOSED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type ServiceStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'REVISION'
  | 'PAUSED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  avatar?: string;
  providerProfileId?: string;
}

export interface ProviderProfile {
  id: string;
  code: string;
  userId: string;
  name: string;
  story: string;
  contact: string;
  address: string;
  active: boolean;
}

export interface Service {
  id: string;
  code: string;
  providerId: string;
  providerName?: string;
  providerAddress?: string;
  name: string;
  category: 'Nông nghiệp' | 'Ẩm thực' | 'Thiên nhiên' | 'Văn hóa' | 'Nghỉ ngơi' | string;
  price: number;
  duration: number; // in minutes
  capacity: number;
  image: string;
  latitude?: number;
  longitude?: number;
  groups: string[];
  indoor: boolean;
  description: string;
  status: ServiceStatus;
  slots: string[];
  amenities: string[];
  included?: string;
  excluded?: string;
  conditions?: string;
  moderationNote?: string;
  bookingUnit?: string;
  testOnly?: boolean;
  updatedAt: string;
}

export interface BookingHistory {
  id: string;
  status: BookingStatus;
  actor: string;
  message: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  code: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  date: string;
  slot: string;
  people: number;
  price: number;
  total: number;
  duration: number;
  status: BookingStatus;
  proposal?: {
    date: string;
    slot: string;
    reason: string;
  };
  cancelReason?: string;
  source: string;
  createdAt: string;
  history: BookingHistory[];
  review?: Review;
}

export interface Review {
  id: string;
  bookingId: string;
  serviceId: string;
  serviceName?: string;
  providerId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  reply?: string;
  replyAt?: string;
  status: 'visible' | 'hidden';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail?: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  target?: string;
  source: string;
  createdAt: string;
}

export interface FilterState {
  category: string;
  budget: number;
  people: number;
  duration: number;
  group: string;
  indoor: boolean;
  date: string;
}
