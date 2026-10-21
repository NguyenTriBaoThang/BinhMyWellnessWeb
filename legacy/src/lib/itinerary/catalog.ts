import 'server-only';
import { prisma } from '@/lib/prisma';
import type { ItineraryCandidate } from './engine';

function dateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function getVerifiedCandidates(date: string): Promise<ItineraryCandidate[]> {
  const services = await prisma.service.findMany({
    where: {
      status: 'PUBLISHED',
      testOnly: false,
      areaCode: 'BINH_MY',
      serviceVerifiedAt: { not: null },
      locationVerifiedAt: { not: null },
      provider: { active: true },
      latitude: { not: null },
      longitude: { not: null },
      availabilities: {
        some: {
          date: dateOnly(date),
          status: 'AVAILABLE',
          verifiedAt: { not: null },
        },
      },
    },
    include: {
      provider: true,
      availabilities: {
        where: {
          date: dateOnly(date),
          status: 'AVAILABLE',
          verifiedAt: { not: null },
        },
        orderBy: { slot: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  if (!services.length) return [];
  const serviceIds = services.map((service) => service.id);
  const bookings = await prisma.booking.findMany({
    where: {
      serviceId: { in: serviceIds },
      OR: [
        { status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }, date },
        { status: 'PROPOSED', proposalDate: date },
      ],
    },
    select: {
      serviceId: true,
      date: true,
      slot: true,
      proposalDate: true,
      proposalSlot: true,
      people: true,
      status: true,
    },
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    price: service.price,
    priceBasis: service.priceBasis,
    childPrice: service.childPrice,
    duration: service.duration,
    capacity: service.capacity,
    bookingUnit: service.bookingUnit ?? undefined,
    latitude: service.latitude,
    longitude: service.longitude,
    status: service.status,
    testOnly: service.testOnly,
    areaCode: service.areaCode,
    serviceVerifiedAt: service.serviceVerifiedAt?.toISOString() ?? null,
    locationVerifiedAt: service.locationVerifiedAt?.toISOString() ?? null,
    provider: {
      id: service.provider.id,
      name: service.provider.name,
      address: service.provider.address,
      active: service.provider.active,
    },
    slots: service.availabilities
      .filter((slot) => service.slots.includes(slot.slot))
      .map((slot) => {
        const reserved = bookings
          .filter((booking) => booking.serviceId === service.id && (
            (booking.status === 'PROPOSED' && booking.proposalDate === date && booking.proposalSlot === slot.slot)
            || (booking.status !== 'PROPOSED' && booking.date === date && booking.slot === slot.slot)
          ))
          .reduce((sum, booking) => sum + booking.people, 0);
        const slotCapacity = Math.min(service.capacity, slot.capacity ?? service.capacity);
        return {
          date,
          slot: slot.slot,
          verifiedAt: slot.verifiedAt?.toISOString() ?? null,
          availablePlaces: Math.max(0, slotCapacity - reserved),
        };
      }),
  }));
}
