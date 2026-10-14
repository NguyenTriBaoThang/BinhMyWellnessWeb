import { randomUUID } from 'node:crypto';
import {
  AuditLog,
  Booking,
  BookingStatus,
  FilterState,
  ProviderProfile,
  Review,
  Role,
  Service,
  ServiceStatus,
  User,
} from '@/types';
import { hashPassword } from './auth';
import { prisma } from './prisma';
import { getTodayInVietnam, isBookableSlotInVietnam } from './utils';
import { db as memoryDb } from './memory-db';

const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

export function isPersistentDatabaseConfigured() {
  return isDatabaseConfigured;
}

export function isTestBookingModeEnabled() {
  return process.env.BM_ENABLE_TEST_BOOKINGS === 'true';
}

function publicUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone ?? undefined,
    role: row.role,
    avatar: row.avatar ?? undefined,
    providerProfileId: row.providerProfile?.id,
  };
}

function mapProvider(row: any): ProviderProfile {
  return {
    id: row.id,
    code: row.code,
    userId: row.userId,
    name: row.name,
    story: row.story,
    contact: row.contact,
    address: row.address,
    active: row.active,
  };
}

function mapService(row: any): Service {
  return {
    id: row.id,
    code: row.code,
    providerId: row.providerId,
    providerName: row.provider?.name,
    providerAddress: row.provider?.address,
    name: row.name,
    category: row.category,
    price: row.price,
    duration: row.duration,
    capacity: row.capacity,
    image: row.image,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    groups: row.groups,
    indoor: row.indoor,
    description: row.description,
    status: row.status,
    slots: row.slots,
    amenities: row.amenities,
    included: row.included ?? undefined,
    excluded: row.excluded ?? undefined,
    conditions: row.conditions ?? undefined,
    moderationNote: row.moderationNote ?? undefined,
    bookingUnit: row.bookingUnit ?? undefined,
    testOnly: row.testOnly,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapReview(row: any): Review {
  return {
    id: row.id,
    bookingId: row.bookingId,
    serviceId: row.serviceId,
    serviceName: row.service?.name,
    providerId: row.service?.providerId,
    userId: row.userId,
    userName: row.user?.name ?? '',
    rating: row.rating,
    text: row.text,
    reply: row.reply ?? undefined,
    replyAt: row.replyAt?.toISOString(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapBooking(row: any): Booking {
  return {
    id: row.id,
    code: row.code,
    serviceId: row.serviceId,
    serviceName: row.service?.name ?? '',
    serviceImage: row.service?.image ?? '',
    providerId: row.providerId,
    providerName: row.provider?.name ?? '',
    customerId: row.customerId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    notes: row.notes ?? undefined,
    date: row.date,
    slot: row.slot,
    people: row.people,
    price: row.price,
    total: row.total,
    duration: row.duration,
    status: row.status,
    proposal: row.proposalDate && row.proposalSlot
      ? { date: row.proposalDate, slot: row.proposalSlot, reason: row.proposalReason ?? '' }
      : undefined,
    cancelReason: row.cancelReason ?? undefined,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    history: (row.history ?? []).map((item: any) => ({
      id: item.id,
      status: item.status,
      actor: item.actor,
      message: item.message,
      createdAt: item.createdAt.toISOString(),
    })),
    review: row.review ? mapReview(row.review) : undefined,
  };
}

const bookingIncludes = {
  service: true,
  provider: true,
  history: { orderBy: { createdAt: 'asc' as const } },
  review: { include: { service: true, user: true } },
};

function matchesServiceFilters(service: Service, filters?: Partial<FilterState>) {
  if (!filters) return true;
  if (filters.category && filters.category !== 'Tất cả' && service.category !== filters.category) return false;
  if (filters.budget && filters.budget > 0 && service.price > filters.budget) return false;
  if (filters.duration && filters.duration > 0 && service.duration > filters.duration) return false;
  if (filters.group && !service.groups.includes(filters.group)) return false;
  if (filters.indoor && !service.indoor) return false;
  return true;
}

function logId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

async function capacityWithin(tx: any, serviceId: string, date: string, slot: string, excludeBookingId?: string) {
  const service = await tx.service.findFirst({ where: { OR: [{ id: serviceId }, { code: serviceId }] }, select: { id: true, capacity: true } });
  if (!service) return 0;
  const bookings = await tx.booking.findMany({
    where: {
      serviceId: service.id,
      ...(excludeBookingId ? { NOT: { OR: [{ id: excludeBookingId }, { code: excludeBookingId }] } } : {}),
      OR: [
        { status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }, date, slot },
        { status: 'PROPOSED', proposalDate: date, proposalSlot: slot },
      ],
    },
    select: { people: true },
  });
  const used = bookings.reduce((sum: number, booking: { people: number }) => sum + booking.people, 0);
  return Math.max(0, service.capacity - used);
}

async function lockCapacity(tx: any, serviceId: string, date: string, slot: string) {
  const lockKey = `${serviceId}|${date}|${slot}`;
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
}

const persistentDb = {
  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const row = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, include: { providerProfile: true } });
    return row ? { ...publicUser(row), passwordHash: row.password } : null;
  },

  async createUser(data: { email: string; password: string; name: string; phone?: string; role: Role }): Promise<User> {
    const user = await prisma.user.create({ data: {
      email: data.email.trim().toLowerCase(),
      password: hashPassword(data.password),
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      role: data.role,
    }, include: { providerProfile: true } });
    await this.addLog(data.name, 'Đăng ký tài khoản', user.email, `Vai trò: ${data.role}`);
    return publicUser(user);
  },

  async getAllUsers(): Promise<User[]> {
    const rows = await prisma.user.findMany({ include: { providerProfile: true }, orderBy: { createdAt: 'desc' } });
    return rows.map(publicUser);
  },

  async getAllProviders(): Promise<ProviderProfile[]> {
    return (await prisma.providerProfile.findMany({ orderBy: { name: 'asc' } })).map(mapProvider);
  },

  async getProviderById(id: string): Promise<ProviderProfile | null> {
    const row = await prisma.providerProfile.findFirst({ where: { OR: [{ id }, { code: id }] } });
    return row ? mapProvider(row) : null;
  },

  async getProviderByUserId(userId: string): Promise<ProviderProfile | null> {
    const row = await prisma.providerProfile.findUnique({ where: { userId } });
    return row ? mapProvider(row) : null;
  },

  async updateProvider(id: string, data: Partial<ProviderProfile>, actorName = 'Chủ nhà vườn'): Promise<ProviderProfile> {
    const current = await this.getProviderById(id);
    if (!current) throw new Error('Không tìm thấy cơ sở nhà vườn.');
    const row = await prisma.providerProfile.update({ where: { id: current.id }, data: {
      name: data.name,
      story: data.story,
      contact: data.contact,
      address: data.address,
      active: data.active,
    } });
    await this.addLog(actorName, 'Cập nhật cơ sở', row.name, JSON.stringify(data));
    return mapProvider(row);
  },

  async toggleProvider(id: string, actorName = 'Ban quản trị'): Promise<ProviderProfile> {
    const current = await this.getProviderById(id);
    if (!current) throw new Error('Không tìm thấy cơ sở nhà vườn.');
    const row = await prisma.providerProfile.update({ where: { id: current.id }, data: { active: !current.active } });
    await this.addLog(actorName, row.active ? 'Mở cửa hoạt động' : 'Tạm dừng cơ sở', row.name, `Trạng thái: ${row.active ? 'Hoạt động' : 'Tạm ngưng'}`);
    return mapProvider(row);
  },

  async getAllServices(filters?: Partial<FilterState>): Promise<Service[]> {
    const rows = await prisma.service.findMany({ include: { provider: true }, orderBy: { name: 'asc' } });
    return rows.map(mapService).filter((service) => (process.env.NODE_ENV !== 'production' || !service.testOnly || isTestBookingModeEnabled()) && matchesServiceFilters(service, filters));
  },

  async getPublicServices(filters?: Partial<FilterState>): Promise<Service[]> {
    const rows = await prisma.service.findMany({ where: { status: 'PUBLISHED', provider: { active: true } }, include: { provider: true }, orderBy: { name: 'asc' } });
    return rows.map(mapService).filter((service) => (process.env.NODE_ENV !== 'production' || !service.testOnly || isTestBookingModeEnabled()) && matchesServiceFilters(service, filters));
  },

  async getServiceById(id: string): Promise<Service | null> {
    const row = await prisma.service.findFirst({ where: { OR: [{ id }, { code: id }] }, include: { provider: true } });
    if (!row || (process.env.NODE_ENV === 'production' && row.testOnly && !isTestBookingModeEnabled())) return null;
    return mapService(row);
  },

  async createService(data: Omit<Service, 'id' | 'code' | 'updatedAt'>, actorName = 'Chủ nhà vườn'): Promise<Service> {
    const row = await prisma.service.create({ data: {
      code: `s-${randomUUID()}`,
      providerId: data.providerId,
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      capacity: data.capacity,
      image: data.image,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      groups: data.groups,
      indoor: data.indoor,
      description: data.description,
      status: 'REVIEW',
      slots: data.slots,
      amenities: data.amenities,
      included: data.included ?? null,
      excluded: data.excluded ?? null,
      conditions: data.conditions ?? null,
      moderationNote: data.moderationNote ?? null,
      testOnly: data.testOnly ?? false,
      bookingUnit: data.bookingUnit ?? null,
    }, include: { provider: true } });
    await this.addLog(actorName, 'Thêm dịch vụ mới', row.name, `Giá: ${row.price.toLocaleString('vi-VN')}đ, gửi chờ kiểm duyệt.`);
    return mapService(row);
  },

  async updateService(id: string, data: Partial<Service>, actorName = 'Chủ nhà vườn'): Promise<Service> {
    const current = await this.getServiceById(id);
    if (!current) throw new Error('Không tìm thấy dịch vụ.');
    const row = await prisma.service.update({ where: { id: current.id }, data: {
      name: data.name,
      category: data.category,
      price: data.price,
      duration: data.duration,
      capacity: data.capacity,
      image: data.image,
      latitude: data.latitude,
      longitude: data.longitude,
      groups: data.groups,
      indoor: data.indoor,
      description: data.description,
      slots: data.slots,
      amenities: data.amenities,
      included: data.included,
      excluded: data.excluded,
      conditions: data.conditions,
      bookingUnit: data.bookingUnit,
    }, include: { provider: true } });
    await this.addLog(actorName, 'Cập nhật dịch vụ', row.name, 'Chỉnh sửa thông tin trải nghiệm.');
    return mapService(row);
  },

  async moderateService(id: string, status: ServiceStatus, note?: string, actorName = 'Ban quản trị'): Promise<Service> {
    const current = await this.getServiceById(id);
    if (!current) throw new Error('Không tìm thấy dịch vụ.');
    const row = await prisma.service.update({ where: { id: current.id }, data: { status, moderationNote: note || '' }, include: { provider: true } });
    const labels: Record<ServiceStatus, string> = { DRAFT: 'Bản nháp', REVIEW: 'Chờ duyệt', PUBLISHED: 'Công bố', REVISION: 'Yêu cầu sửa đổi', PAUSED: 'Tạm ngưng' };
    await this.addLog(actorName, `Kiểm duyệt: ${labels[status]}`, row.name, note || `Đã chuyển sang ${labels[status]}`);
    return mapService(row);
  },

  async getRemainingCapacity(serviceId: string, date: string, slot: string, excludeBookingId?: string): Promise<number> {
    return capacityWithin(prisma, serviceId, date, slot, excludeBookingId);
  },

  async getCapacitySummary(date: string) {
    const services = await this.getPublicServices();
    const slots = await Promise.all(services.flatMap((service) =>
      service.slots.filter((slot) => isBookableSlotInVietnam(date, slot)).map(async (slot) => ({
        serviceId: service.id,
        slot,
        capacity: service.capacity,
        remaining: await this.getRemainingCapacity(service.id, date, slot),
      }))
    ));
    const totalCapacity = slots.reduce((sum, item) => sum + item.capacity, 0);
    const availablePlaces = slots.reduce((sum, item) => sum + item.remaining, 0);
    return {
      serviceCount: new Set(slots.map((item) => item.serviceId)).size,
      slotCount: slots.length,
      openSlots: slots.filter((item) => item.remaining > 0).length,
      totalCapacity,
      availablePlaces,
      bookedPlaces: totalCapacity - availablePlaces,
    };
  },

  async getBookings(filters?: { customerId?: string; providerId?: string; status?: BookingStatus }): Promise<Booking[]> {
    const rows = await prisma.booking.findMany({
      where: {
        ...(filters?.customerId ? { customerId: filters.customerId } : {}),
        ...(filters?.providerId ? { providerId: filters.providerId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: bookingIncludes,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapBooking);
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const row = await prisma.booking.findFirst({ where: { OR: [{ id }, { code: id }] }, include: bookingIncludes });
    return row ? mapBooking(row) : null;
  },

  async createBooking(data: { serviceId: string; customerId: string; customerName: string; customerPhone: string; notes?: string; date: string; slot: string; people: number; source?: string }): Promise<Booking> {
    const service = await this.getServiceById(data.serviceId);
    if (!service) throw new Error('Dịch vụ không tồn tại.');
    if (service.status !== 'PUBLISHED') throw new Error('Dịch vụ chưa được công bố hoặc đang bảo trì.');
    const provider = await this.getProviderById(service.providerId);
    if (!provider?.active) throw new Error('Cơ sở nhà vườn đang tạm ngưng đón khách.');
    if (!service.slots.includes(data.slot)) throw new Error('Khung giờ này không nằm trong lịch đón khách của dịch vụ.');
    if (!Number.isInteger(data.people) || data.people < 1 || data.people > service.capacity) throw new Error(`Số khách phải từ 1 đến ${service.capacity}.`);
    if (!isBookableSlotInVietnam(data.date, data.slot)) throw new Error('Khung giờ này đã qua hoặc cần đặt trước ít nhất 30 phút.');

    const code = `BM-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 5).toUpperCase()}`;
    const now = new Date();
    const row = await prisma.$transaction(async (tx) => {
      await lockCapacity(tx, service.id, data.date, data.slot);
      const available = await capacityWithin(tx, service.id, data.date, data.slot);
      if (data.people > available) throw new Error(`Khung giờ này chỉ còn ${available} chỗ trống.`);
      return tx.booking.create({ data: {
        code,
        serviceId: service.id,
        providerId: provider.id,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        notes: data.notes?.trim() || null,
        date: data.date,
        slot: data.slot,
        people: data.people,
        price: service.price,
        total: service.price * data.people,
        duration: service.duration,
        status: 'PENDING',
        source: data.source || 'Trực tiếp',
        history: { create: { status: 'PENDING', actor: data.customerName, message: 'Khách gửi yêu cầu đặt lịch trải nghiệm', createdAt: now } },
      }, include: bookingIncludes });
    }, { isolationLevel: 'Serializable' });
    await this.addLog('Khách hàng', 'Đặt chỗ mới', code, `${service.name} (${data.people} khách)`);
    await this.trackEvent('request', service.id, data.source || 'Trực tiếp');
    return mapBooking(row);
  },

  async transitionBooking(bookingId: string, action: 'confirm' | 'propose' | 'accept' | 'reject' | 'cancel' | 'complete', actorRole: Role, actorName: string, extra?: { date?: string; slot?: string; reason?: string }): Promise<Booking> {
    const current = await this.getBookingById(bookingId);
    if (!current) throw new Error('Không tìm thấy yêu cầu đặt chỗ.');
    let status = current.status;
    let date = current.date;
    let slot = current.slot;
    let proposalDate: string | null = current.proposal?.date ?? null;
    let proposalSlot: string | null = current.proposal?.slot ?? null;
    let proposalReason: string | null = current.proposal?.reason ?? null;
    let cancelReason: string | null = current.cancelReason ?? null;
    let message = '';
    let capacityTarget: { date: string; slot: string } | undefined;

    switch (action) {
      case 'confirm':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') throw new Error('Chỉ nhà vườn hoặc quản trị mới có quyền xác nhận yêu cầu.');
        if (status !== 'PENDING') throw new Error('Chỉ có thể xác nhận yêu cầu đang chờ xử lý.');
        if (!isBookableSlotInVietnam(date, slot)) throw new Error('Khung giờ này đã qua. Hãy đề xuất lịch khác.');
        status = 'CONFIRMED'; message = 'Nhà vườn đã xác nhận lịch hẹn và chuẩn bị đón tiếp.';
        break;
      case 'propose': {
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') throw new Error('Chỉ nhà vườn mới có thể đề xuất đổi lịch.');
        if (!extra?.date || !extra.slot || !extra.reason) throw new Error('Vui lòng cung cấp ngày, giờ mới và lý do đề xuất.');
        if (!['PENDING', 'CONFIRMED'].includes(status)) throw new Error('Chỉ có thể đề xuất lịch mới cho yêu cầu đang chờ hoặc đã xác nhận.');
        validateProposedDate(extra.date);
        const service = await this.getServiceById(current.serviceId);
        if (!service?.slots.includes(extra.slot) || !isBookableSlotInVietnam(extra.date, extra.slot)) throw new Error('Khung giờ đề xuất không khả dụng.');
        if (extra.reason.trim().length < 2 || extra.reason.trim().length > 500) throw new Error('Lý do đề xuất phải từ 2 đến 500 ký tự.');
        capacityTarget = { date: extra.date, slot: extra.slot };
        proposalDate = extra.date; proposalSlot = extra.slot; proposalReason = extra.reason.trim();
        status = 'PROPOSED'; message = `Nhà vườn đề xuất chuyển sang ${extra.date} (${extra.slot}). Lý do: ${proposalReason}`;
        break;
      }
      case 'accept':
        if (actorRole !== 'CUSTOMER') throw new Error('Chỉ khách hàng mới có quyền đồng ý lịch đề xuất.');
        if (status !== 'PROPOSED' || !proposalDate || !proposalSlot) throw new Error('Không có lịch đề xuất nào cần chấp thuận.');
        if (!isBookableSlotInVietnam(proposalDate, proposalSlot)) throw new Error('Thời hạn nhận khách cho lịch đề xuất đã qua.');
        capacityTarget = { date: proposalDate, slot: proposalSlot };
        date = proposalDate; slot = proposalSlot;
        proposalDate = null; proposalSlot = null; proposalReason = null;
        status = 'CONFIRMED'; message = 'Khách hàng đã đồng ý lịch hẹn đề xuất mới.';
        break;
      case 'reject':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') throw new Error('Chỉ nhà vườn mới có thể từ chối yêu cầu.');
        if (!['PENDING', 'PROPOSED'].includes(status)) throw new Error('Yêu cầu này không còn chờ phản hồi.');
        status = 'REJECTED'; cancelReason = extra?.reason || 'Nhà vườn không thể phục vụ vào khung giờ này.';
        message = `Nhà vườn từ chối yêu cầu. Lý do: ${cancelReason}`;
        break;
      case 'cancel':
        if (actorRole !== 'CUSTOMER' && actorRole !== 'ADMIN') throw new Error('Chỉ khách hàng hoặc quản trị mới có thể hủy yêu cầu.');
        if (!['PENDING', 'PROPOSED', 'CONFIRMED'].includes(status)) throw new Error('Không thể hủy yêu cầu ở trạng thái hiện tại.');
        status = 'CANCELLED'; cancelReason = extra?.reason || 'Khách hủy yêu cầu.'; message = `Yêu cầu bị hủy. Lý do: ${cancelReason}`;
        break;
      case 'complete':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') throw new Error('Chỉ nhà vườn hoặc quản trị mới có thể đánh dấu hoàn thành.');
        if (status !== 'CONFIRMED') throw new Error('Chỉ có thể hoàn thành lịch đã xác nhận.');
        status = 'COMPLETED'; message = 'Trải nghiệm đã hoàn thành thành công. Mời khách hàng để lại đánh giá!';
        break;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (capacityTarget) {
        await lockCapacity(tx, current.serviceId, capacityTarget.date, capacityTarget.slot);
        if (current.people > await capacityWithin(tx, current.serviceId, capacityTarget.date, capacityTarget.slot, current.id)) {
          throw new Error('Khung giờ này không còn đủ chỗ cho đoàn khách.');
        }
      }
      return tx.booking.update({
        where: { id: current.id },
        data: {
          status,
          date,
          slot,
          proposalDate,
          proposalSlot,
          proposalReason,
          cancelReason,
          history: { create: { status, actor: actorName, message } },
        },
        include: bookingIncludes,
      });
    }, { isolationLevel: 'Serializable' });
    await this.addLog(actorName, `Cập nhật đơn: ${status}`, current.code, message);
    return mapBooking(updated);
  },

  async getReviews(serviceId?: string): Promise<Review[]> {
    const rows = await prisma.review.findMany({ where: { status: 'visible', ...(serviceId ? { serviceId } : {}) }, include: { service: true, user: true }, orderBy: { createdAt: 'desc' } });
    return rows.map(mapReview);
  },

  async createReview(data: { bookingId: string; userId: string; userName: string; rating: number; text: string }): Promise<Review> {
    const booking = await this.getBookingById(data.bookingId);
    if (!booking) throw new Error('Không tìm thấy đơn đặt chỗ.');
    if (booking.customerId !== data.userId) throw new Error('Bạn không có quyền đánh giá yêu cầu này.');
    if (booking.status !== 'COMPLETED') throw new Error('Chỉ có thể đánh giá dịch vụ đã hoàn thành.');
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) throw new Error('Số sao đánh giá phải từ 1 đến 5.');
    const text = data.text.trim();
    if (text.length < 3 || text.length > 2000) throw new Error('Nội dung đánh giá phải từ 3 đến 2.000 ký tự.');
    const row = await prisma.review.create({ data: { bookingId: booking.id, serviceId: booking.serviceId, userId: data.userId, rating: data.rating, text }, include: { service: true, user: true } });
    await this.addLog(data.userName, 'Đánh giá dịch vụ', booking.serviceName, `${data.rating} sao: ${text}`);
    return mapReview(row);
  },

  async replyReview(reviewId: string, replyText: string, providerName = 'Nhà vườn'): Promise<Review> {
    const row = await prisma.review.update({ where: { id: reviewId }, data: { reply: replyText, replyAt: new Date() }, include: { service: true, user: true } });
    await this.addLog(providerName, 'Phản hồi đánh giá', row.id, replyText);
    return mapReview(row);
  },

  async getFavorites(userId: string): Promise<string[]> {
    const rows = await prisma.favorite.findMany({ where: { userId }, select: { serviceId: true } });
    return rows.map((row) => row.serviceId);
  },

  async toggleFavorite(userId: string, serviceId: string): Promise<boolean> {
    const existing = await prisma.favorite.findUnique({ where: { userId_serviceId: { userId, serviceId } } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return false;
    }
    await prisma.favorite.create({ data: { userId, serviceId } });
    await this.trackEvent('favorite', serviceId, 'Người dùng');
    return true;
  },

  async setFavorite(userId: string, serviceId: string, isFavorite: boolean): Promise<boolean> {
    if (isFavorite) {
      await prisma.favorite.upsert({ where: { userId_serviceId: { userId, serviceId } }, create: { userId, serviceId }, update: {} });
      await this.trackEvent('favorite', serviceId, 'Website');
    } else {
      await prisma.favorite.deleteMany({ where: { userId, serviceId } });
    }
    return isFavorite;
  },

  async addLog(actor: string, action: string, target: string, detail?: string): Promise<void> {
    await prisma.auditLog.create({ data: { actor, action, target, detail: detail ?? null } });
  },

  async getLogs(): Promise<AuditLog[]> {
    const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    return rows.map((row) => ({ id: row.id, actor: row.actor, action: row.action, target: row.target, detail: row.detail ?? undefined, createdAt: row.createdAt.toISOString() }));
  },

  async trackEvent(type: string, target?: string, source = 'Trực tiếp'): Promise<void> {
    await prisma.analyticsEvent.create({ data: { type, target: target ?? null, source } });
  },

  async getAnalyticsSummary() {
    const [views, requests, confirmed, completed, providersCount, activeProvidersCount, servicesCount, publishedServicesCount, pendingModerationCount, viewEvents] = await Promise.all([
      prisma.analyticsEvent.count({ where: { type: 'view' } }),
      prisma.analyticsEvent.count({ where: { type: 'request' } }),
      prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.providerProfile.count(),
      prisma.providerProfile.count({ where: { active: true } }),
      prisma.service.count(),
      prisma.service.count({ where: { status: 'PUBLISHED' } }),
      prisma.service.count({ where: { status: 'REVIEW' } }),
      prisma.analyticsEvent.findMany({ where: { type: 'view' }, select: { source: true } }),
    ]);
    const sourceBreakdown: Record<string, number> = {};
    for (const event of viewEvents) sourceBreakdown[event.source] = (sourceBreakdown[event.source] || 0) + 1;
    return {
      views, requests, confirmed, completed,
      conversion: views > 0 ? ((requests / views) * 100).toFixed(1) : '0',
      sourceBreakdown, providersCount, activeProvidersCount, servicesCount, publishedServicesCount, pendingModerationCount,
    };
  },
};

function validateProposedDate(date: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date < getTodayInVietnam()) {
    throw new Error('Ngày đề xuất không hợp lệ hoặc đã qua.');
  }
}

// Local development can still run the in-memory demo before Supabase is configured.
// Production actions must check isPersistentDatabaseConfigured() before writing.
export const db = isDatabaseConfigured ? persistentDb : memoryDb;
