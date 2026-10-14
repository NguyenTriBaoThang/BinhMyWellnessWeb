import {
  User,
  ProviderProfile,
  Service,
  Booking,
  BookingStatus,
  ServiceStatus,
  Review,
  AuditLog,
  AnalyticsEvent,
  FilterState,
  Role,
} from '@/types';
import {
  DEFAULT_ACCOUNTS,
  SEED_PROVIDERS,
  SEED_SERVICES,
  DEFAULT_PASSWORD,
} from './constants';
import { hashPassword } from './auth';
import { getTodayInVietnam, isBookableSlotInVietnam } from './utils';

// In-Memory Data Store (Initialized with seeds, persists across hot reloads in globalThis)
interface Store {
  users: (User & { passwordHash: string })[];
  providers: ProviderProfile[];
  services: Service[];
  bookings: Booking[];
  reviews: Review[];
  favorites: { userId: string; serviceId: string }[];
  logs: AuditLog[];
  events: AnalyticsEvent[];
}

const globalForStore = globalThis as unknown as { __bm_store?: Store };

function initializeStore(): Store {
  const users = DEFAULT_ACCOUNTS.map((acc) => ({
    ...acc,
    passwordHash: hashPassword(DEFAULT_PASSWORD),
  }));

  const providers = [...SEED_PROVIDERS];
  const services = [...SEED_SERVICES];

  // Add initial demo bookings and reviews to showcase realistic operations
  const initialBookings: Booking[] = [
    {
      id: 'BM-2026-001',
      code: 'BM-2026-001',
      serviceId: 's1',
      serviceName: 'Thu hoạch rau & khám phá nhà vườn hữu cơ',
      serviceImage: '/assets/nong_trai_binh_my.jpg',
      providerId: 'p1',
      providerName: 'Vườn xanh Bình Mỹ',
      customerId: 'user-customer-1',
      customerName: 'Bảo Thắng',
      customerPhone: '0901234567',
      notes: 'Gia đình có 2 bé nhỏ, nhờ nhà vườn chuẩn bị nón lá cho bé.',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      slot: '08:30',
      people: 3,
      price: 120000,
      total: 360000,
      duration: 90,
      status: 'CONFIRMED',
      source: 'Trực tiếp',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      history: [
        {
          id: 'h1',
          status: 'PENDING',
          actor: 'Khách hàng',
          message: 'Khách gửi yêu cầu trải nghiệm',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'h2',
          status: 'CONFIRMED',
          actor: 'Vườn xanh Bình Mỹ',
          message: 'Nhà vườn xác nhận lịch hẹn',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    },
    {
      id: 'BM-2026-002',
      code: 'BM-2026-002',
      serviceId: 's7',
      serviceName: 'Chèo SUP hoàng hôn & trải nghiệm sinh thái ven sông Sài Gòn',
      serviceImage: '/assets/sup_riverside_binh_my.jpg',
      providerId: 'p7',
      providerName: 'Bình Mỹ Riverside',
      customerId: 'user-customer-1',
      customerName: 'Bảo Thắng',
      customerPhone: '0901234567',
      notes: 'Đặt ca chiều hoàng hôn',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      slot: '16:00',
      people: 2,
      price: 250000,
      total: 500000,
      duration: 120,
      status: 'COMPLETED',
      source: 'Trực tiếp',
      createdAt: new Date(Date.now() - 180000000).toISOString(),
      history: [
        {
          id: 'h3',
          status: 'CONFIRMED',
          actor: 'Bình Mỹ Riverside',
          message: 'Đã đón khách',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'h4',
          status: 'COMPLETED',
          actor: 'Bình Mỹ Riverside',
          message: 'Hoàn thành dịch vụ trải nghiệm',
          createdAt: new Date(Date.now() - 170000000).toISOString(),
        },
      ],
    },
  ];

  const initialReviews: Review[] = [
    {
      id: 'rev-1',
      bookingId: 'BM-2026-002',
      serviceId: 's7',
      serviceName: 'Chèo SUP hoàng hôn & trải nghiệm sinh thái ven sông Sài Gòn',
      providerId: 'p7',
      userId: 'user-customer-1',
      userName: 'Bảo Thắng',
      rating: 5,
      text: 'Khung cảnh hoàng hôn trên sông Sài Gòn tuyệt đẹp! Anh huấn luyện viên rất chu đáo, trang thiết bị an toàn và chuyên nghiệp. Chắc chắn sẽ quay lại!',
      reply: 'Cảm ơn anh Thắng và gia đình đã dành thời gian trải nghiệm cùng Bình Mỹ Riverside. Hẹn gặp lại anh trong chuyến đi tới!',
      replyAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'visible',
      createdAt: new Date(Date.now() - 100000000).toISOString(),
    },
  ];

  const initialLogs: AuditLog[] = [
    {
      id: 'log-1',
      actor: 'Hệ thống',
      action: 'Khởi tạo',
      target: 'Bình Mỹ Wellness Web',
      detail: 'Khởi tạo hệ sinh thái du lịch nhà vườn Bình Mỹ với 8 cơ sở đối tác và tài khoản mẫu.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-2',
      actor: 'Vườn xanh Bình Mỹ',
      action: 'Cập nhật',
      target: 'Dịch vụ thu hoạch rau',
      detail: 'Mở thêm các ca đón khách cuối tuần.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const initialEvents: AnalyticsEvent[] = [
    { id: 'ev-1', type: 'view', target: 's1', source: 'Trực tiếp', createdAt: new Date().toISOString() },
    { id: 'ev-2', type: 'view', target: 's7', source: 'QR Code', createdAt: new Date().toISOString() },
    { id: 'ev-3', type: 'request', target: 's1', source: 'Trực tiếp', createdAt: new Date().toISOString() },
  ];

  return {
    users,
    providers,
    services,
    bookings: initialBookings,
    reviews: initialReviews,
    favorites: [{ userId: 'user-customer-1', serviceId: 's1' }],
    logs: initialLogs,
    events: initialEvents,
  };
}

const store: Store = globalForStore.__bm_store ?? initializeStore();
if (process.env.NODE_ENV !== 'production') {
  globalForStore.__bm_store = store;
}

// Data Access Layer
export const db = {
  // --- USERS ---
  async findUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const user = store.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    return user || null;
  },

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: Role;
  }): Promise<User> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) throw new Error('Email đã được đăng ký trong hệ thống.');

    const newUser = {
      id: 'user-' + Date.now().toString(36),
      email: data.email,
      name: data.name,
      phone: data.phone || '',
      role: data.role,
      passwordHash: hashPassword(data.password),
    };
    store.users.push(newUser);

    this.addLog(
      data.name,
      'Đăng ký tài khoản',
      data.email,
      `Vai trò: ${data.role}`
    );

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
    };
  },

  async getAllUsers(): Promise<User[]> {
    return store.users.map(({ passwordHash, ...u }) => u);
  },

  // --- PROVIDERS ---
  async getAllProviders(): Promise<ProviderProfile[]> {
    return store.providers;
  },

  async getProviderById(id: string): Promise<ProviderProfile | null> {
    return store.providers.find((p) => p.id === id || p.code === id) || null;
  },

  async getProviderByUserId(userId: string): Promise<ProviderProfile | null> {
    return store.providers.find((p) => p.userId === userId) || null;
  },

  async updateProvider(
    id: string,
    data: Partial<ProviderProfile>,
    actorName: string = 'Chủ nhà vườn'
  ): Promise<ProviderProfile> {
    const p = await this.getProviderById(id);
    if (!p) throw new Error('Không tìm thấy cơ sở nhà vườn.');

    Object.assign(p, data);
    this.addLog(actorName, 'Cập nhật cơ sở', p.name, JSON.stringify(data));
    return p;
  },

  async toggleProvider(id: string, actorName: string = 'Ban quản trị'): Promise<ProviderProfile> {
    const p = await this.getProviderById(id);
    if (!p) throw new Error('Không tìm thấy cơ sở nhà vườn.');

    p.active = !p.active;
    this.addLog(
      actorName,
      p.active ? 'Mở cửa hoạt động' : 'Tạm dừng cơ sở',
      p.name,
      `Trạng thái: ${p.active ? 'Hoạt động' : 'Tạm ngưng'}`
    );
    return p;
  },

  // --- SERVICES ---
  async getAllServices(filters?: Partial<FilterState>): Promise<Service[]> {
    let list = store.services;

    if (process.env.NODE_ENV === 'production') {
      list = list.filter((service) => !service.testOnly);
    }

    if (filters) {
      if (filters.category && filters.category !== 'Tất cả') {
        list = list.filter((s) => s.category === filters.category);
      }
      if (filters.budget && filters.budget > 0) {
        list = list.filter((s) => s.price <= (filters.budget ?? Infinity));
      }
      if (filters.duration && filters.duration > 0) {
        list = list.filter((s) => s.duration <= (filters.duration ?? Infinity));
      }
      if (filters.group) {
        list = list.filter((s) => s.groups.includes(filters.group as string));
      }
      if (filters.indoor) {
        list = list.filter((s) => s.indoor);
      }
    }

    return list;
  },

  async getPublicServices(filters?: Partial<FilterState>): Promise<Service[]> {
    const all = await this.getAllServices(filters);
    const activeProviders = store.providers
      .filter((p) => p.active)
      .map((p) => p.id);
    return all.filter(
      (s) => s.status === 'PUBLISHED' && activeProviders.includes(s.providerId) &&
        (!s.testOnly || process.env.NODE_ENV !== 'production')
    );
  },

  async getServiceById(id: string): Promise<Service | null> {
    const service = store.services.find((s) => s.id === id || s.code === id) || null;
    if (process.env.NODE_ENV === 'production' && service?.testOnly) return null;
    return service;
  },

  async createService(
    data: Omit<Service, 'id' | 'code' | 'updatedAt'>,
    actorName: string = 'Chủ nhà vườn'
  ): Promise<Service> {
    const id = 's' + (store.services.length + 1);
    const service: Service = {
      ...data,
      id,
      code: id,
      status: 'REVIEW', // Needs admin moderation
      updatedAt: new Date().toISOString(),
    };
    store.services.push(service);

    this.addLog(
      actorName,
      'Thêm dịch vụ mới',
      service.name,
      `Giá: ${service.price.toLocaleString('vi-VN')}đ, gửi chờ kiểm duyệt.`
    );
    return service;
  },

  async updateService(
    id: string,
    data: Partial<Service>,
    actorName: string = 'Chủ nhà vườn'
  ): Promise<Service> {
    const s = await this.getServiceById(id);
    if (!s) throw new Error('Không tìm thấy dịch vụ.');

    Object.assign(s, data, { updatedAt: new Date().toISOString() });
    this.addLog(actorName, 'Cập nhật dịch vụ', s.name, 'Chỉnh sửa thông tin trải nghiệm.');
    return s;
  },

  async moderateService(
    id: string,
    status: ServiceStatus,
    note?: string,
    actorName: string = 'Ban quản trị'
  ): Promise<Service> {
    const s = await this.getServiceById(id);
    if (!s) throw new Error('Không tìm thấy dịch vụ.');

    s.status = status;
    s.moderationNote = note || '';
    s.updatedAt = new Date().toISOString();

    const statusLabels: Record<ServiceStatus, string> = {
      DRAFT: 'Bản nháp',
      REVIEW: 'Chờ duyệt',
      PUBLISHED: 'Công bố',
      REVISION: 'Yêu cầu sửa đổi',
      PAUSED: 'Tạm ngưng',
    };

    this.addLog(
      actorName,
      `Kiểm duyệt: ${statusLabels[status]}`,
      s.name,
      note || `Đã chuyển sang ${statusLabels[status]}`
    );
    return s;
  },

  // --- BOOKINGS & CAPACITY ---
  getRemainingCapacity(serviceId: string, date: string, slot: string, excludeBookingId?: string): number {
    const service = store.services.find((s) => s.id === serviceId);
    if (!service) return 0;

    const used = store.bookings
      .filter(
        (b) =>
          b.serviceId === serviceId &&
          b.id !== excludeBookingId &&
          ((['PENDING', 'CONFIRMED', 'COMPLETED'].includes(b.status) &&
            b.date === date &&
            b.slot === slot) ||
            (b.status === 'PROPOSED' &&
              !!b.proposal &&
              b.proposal.date === date &&
              b.proposal.slot === slot))
      )
      .reduce((sum, b) => sum + b.people, 0);

    return Math.max(0, service.capacity - used);
  },

  async getCapacitySummary(date: string) {
    const services = await this.getPublicServices();
    const slots = services.flatMap((service) =>
      service.slots.filter((slot) => isBookableSlotInVietnam(date, slot)).map((slot) => ({
        serviceId: service.id,
        slot,
        capacity: service.capacity,
        remaining: this.getRemainingCapacity(service.id, date, slot),
      }))
    );
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

  async getBookings(filters?: {
    customerId?: string;
    providerId?: string;
    status?: BookingStatus;
  }): Promise<Booking[]> {
    let list = store.bookings;

    if (filters?.customerId) {
      list = list.filter((b) => b.customerId === filters.customerId);
    }
    if (filters?.providerId) {
      list = list.filter((b) => b.providerId === filters.providerId);
    }
    if (filters?.status) {
      list = list.filter((b) => b.status === filters.status);
    }

    // Attach reviews if existing
    return list.map((b) => ({
      ...b,
      review: store.reviews.find((r) => r.bookingId === b.id),
    }));
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const b = store.bookings.find((b) => b.id === id || b.code === id);
    if (!b) return null;
    return {
      ...b,
      review: store.reviews.find((r) => r.bookingId === b.id),
    };
  },

  async createBooking(data: {
    serviceId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    notes?: string;
    date: string;
    slot: string;
    people: number;
    source?: string;
  }): Promise<Booking> {
    const service = await this.getServiceById(data.serviceId);
    if (!service) throw new Error('Dịch vụ không tồn tại.');
    if (service.status !== 'PUBLISHED') throw new Error('Dịch vụ chưa được công bố hoặc đang bảo trì.');

    const provider = await this.getProviderById(service.providerId);
    if (!provider || !provider.active) throw new Error('Cơ sở nhà vườn đang tạm ngưng đón khách.');
    if (!service.slots.includes(data.slot)) throw new Error('Khung giờ này không nằm trong lịch đón khách của dịch vụ.');
    if (!Number.isInteger(data.people) || data.people < 1 || data.people > service.capacity) {
      throw new Error(`Số khách phải từ 1 đến ${service.capacity}.`);
    }

    const remaining = this.getRemainingCapacity(service.id, data.date, data.slot);
    if (data.people > remaining) {
      throw new Error(`Khung giờ này chỉ còn ${remaining} chỗ trống.`);
    }

    const code = `BM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
    const newBooking: Booking = {
      id: code,
      code,
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      providerId: provider.id,
      providerName: provider.name,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      notes: data.notes,
      date: data.date,
      slot: data.slot,
      people: data.people,
      price: service.price,
      total: service.price * data.people,
      duration: service.duration,
      status: 'PENDING',
      source: data.source || 'Trực tiếp',
      createdAt: new Date().toISOString(),
      history: [
        {
          id: 'h-' + Date.now(),
          status: 'PENDING',
          actor: data.customerName,
          message: 'Khách gửi yêu cầu đặt lịch trải nghiệm',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    store.bookings.unshift(newBooking);
    this.addLog('Khách hàng', 'Đặt chỗ mới', code, `${service.name} (${data.people} khách)`);
    this.trackEvent('request', service.id, data.source || 'Trực tiếp');

    return newBooking;
  },

  async transitionBooking(
    bookingId: string,
    action: 'confirm' | 'propose' | 'accept' | 'reject' | 'cancel' | 'complete',
    actorRole: Role,
    actorName: string,
    extra?: { date?: string; slot?: string; reason?: string }
  ): Promise<Booking> {
    const booking = store.bookings.find((b) => b.id === bookingId || b.code === bookingId);
    if (!booking) throw new Error('Không tìm thấy yêu cầu đặt chỗ.');

    let nextStatus: BookingStatus = booking.status;
    let historyMsg = '';

    switch (action) {
      case 'confirm':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') {
          throw new Error('Chỉ nhà vườn hoặc quản trị mới có quyền xác nhận yêu cầu.');
        }
        if (booking.status !== 'PENDING') throw new Error('Chỉ có thể xác nhận yêu cầu đang chờ xử lý.');
        if (!isBookableSlotInVietnam(booking.date, booking.slot)) {
          throw new Error('Khung giờ này đã qua thời hạn nhận khách. Hãy đề xuất lịch khác.');
        }
        nextStatus = 'CONFIRMED';
        historyMsg = 'Nhà vườn đã xác nhận lịch hẹn và chuẩn bị đón tiếp.';
        break;

      case 'propose':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') {
          throw new Error('Chỉ nhà vườn mới có thể đề xuất đổi lịch.');
        }
        if (!extra?.date || !extra?.slot || !extra?.reason) {
          throw new Error('Vui lòng cung cấp ngày, giờ mới và lý do đề xuất.');
        }
        if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
          throw new Error('Chỉ có thể đề xuất lịch mới cho yêu cầu đang chờ hoặc đã xác nhận.');
        }
        const proposedDate = new Date(`${extra.date}T00:00:00.000Z`);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(extra.date) ||
          Number.isNaN(proposedDate.getTime()) ||
          proposedDate.toISOString().slice(0, 10) !== extra.date ||
          extra.date < getTodayInVietnam()
        ) throw new Error('Ngày đề xuất không hợp lệ hoặc đã qua.');
        const service = await this.getServiceById(booking.serviceId);
        if (!service || !service.slots.includes(extra.slot)) {
          throw new Error('Khung giờ đề xuất không có trong lịch đón khách của dịch vụ.');
        }
        if (!isBookableSlotInVietnam(extra.date, extra.slot)) {
          throw new Error('Lịch đề xuất phải bắt đầu ít nhất 30 phút sau thời điểm hiện tại.');
        }
        if (booking.people > this.getRemainingCapacity(booking.serviceId, extra.date, extra.slot, booking.id)) {
          throw new Error('Khung giờ đề xuất không còn đủ chỗ cho đoàn khách này.');
        }
        if (extra.reason.trim().length < 2 || extra.reason.trim().length > 500) {
          throw new Error('Lý do đề xuất phải từ 2 đến 500 ký tự.');
        }
        booking.proposal = {
          date: extra.date,
          slot: extra.slot,
          reason: extra.reason.trim(),
        };
        nextStatus = 'PROPOSED';
        historyMsg = `Nhà vườn đề xuất chuyển sang ${extra.date} (${extra.slot}). Lý do: ${extra.reason}`;
        break;

      case 'accept':
        if (actorRole !== 'CUSTOMER') {
          throw new Error('Chỉ khách hàng mới có quyền đồng ý lịch đề xuất.');
        }
        if (!booking.proposal) {
          throw new Error('Không có lịch đề xuất nào cần chấp thuận.');
        }
        if (booking.status !== 'PROPOSED') throw new Error('Yêu cầu hiện không chờ xác nhận lịch mới.');
        if (!isBookableSlotInVietnam(booking.proposal.date, booking.proposal.slot)) {
          throw new Error('Thời hạn nhận khách cho lịch đề xuất đã qua. Vui lòng yêu cầu nhà vườn đề xuất ca khác.');
        }
        if (booking.people > this.getRemainingCapacity(booking.serviceId, booking.proposal.date, booking.proposal.slot, booking.id)) {
          throw new Error('Khung giờ đề xuất vừa hết chỗ. Vui lòng liên hệ nhà vườn.');
        }
        booking.date = booking.proposal.date;
        booking.slot = booking.proposal.slot;
        booking.proposal = undefined;
        nextStatus = 'CONFIRMED';
        historyMsg = 'Khách hàng đã đồng ý lịch hẹn đề xuất mới.';
        break;

      case 'reject':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') {
          throw new Error('Chỉ nhà vườn mới có thể từ chối yêu cầu.');
        }
        if (!['PENDING', 'PROPOSED'].includes(booking.status)) throw new Error('Yêu cầu này không còn chờ phản hồi.');
        nextStatus = 'REJECTED';
        booking.cancelReason = extra?.reason || 'Nhà vườn không thể phục vụ vào khung giờ này.';
        historyMsg = `Nhà vườn từ chối yêu cầu. Lý do: ${booking.cancelReason}`;
        break;

      case 'cancel':
        if (actorRole !== 'CUSTOMER' && actorRole !== 'ADMIN') {
          throw new Error('Chỉ khách hàng hoặc quản trị mới có thể hủy yêu cầu.');
        }
        if (!['PENDING', 'PROPOSED', 'CONFIRMED'].includes(booking.status)) {
          throw new Error('Không thể hủy yêu cầu ở trạng thái hiện tại.');
        }
        nextStatus = 'CANCELLED';
        booking.cancelReason = extra?.reason || 'Khách hủy yêu cầu.';
        historyMsg = `Yêu cầu bị hủy. Lý do: ${booking.cancelReason}`;
        break;

      case 'complete':
        if (actorRole !== 'PROVIDER' && actorRole !== 'ADMIN') {
          throw new Error('Chỉ nhà vườn hoặc quản trị mới có quyền đánh dấu hoàn thành.');
        }
        if (booking.status !== 'CONFIRMED') throw new Error('Chỉ có thể hoàn thành lịch đã xác nhận.');
        nextStatus = 'COMPLETED';
        historyMsg = 'Trải nghiệm đã hoàn thành thành công. Mời khách hàng để lại đánh giá!';
        break;
    }

    booking.status = nextStatus;
    booking.history.push({
      id: 'h-' + Date.now(),
      status: nextStatus,
      actor: actorName,
      message: historyMsg,
      createdAt: new Date().toISOString(),
    });

    this.addLog(actorName, `Cập nhật đơn: ${nextStatus}`, booking.code, historyMsg);
    return booking;
  },

  // --- REVIEWS ---
  async getReviews(serviceId?: string): Promise<Review[]> {
    if (serviceId) {
      return store.reviews.filter((r) => r.serviceId === serviceId && r.status === 'visible');
    }
    return store.reviews.filter((r) => r.status === 'visible');
  },

  async createReview(data: {
    bookingId: string;
    userId: string;
    userName: string;
    rating: number;
    text: string;
  }): Promise<Review> {
    const booking = await this.getBookingById(data.bookingId);
    if (!booking) throw new Error('Không tìm thấy đơn đặt chỗ.');
    if (booking.customerId !== data.userId) throw new Error('Bạn không có quyền đánh giá yêu cầu này.');
    if (booking.status !== 'COMPLETED') throw new Error('Chỉ có thể đánh giá dịch vụ đã hoàn thành.');
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new Error('Số sao đánh giá phải từ 1 đến 5.');
    }
    const reviewText = data.text.trim();
    if (reviewText.length < 3 || reviewText.length > 2000) {
      throw new Error('Nội dung đánh giá phải từ 3 đến 2.000 ký tự.');
    }

    const existing = store.reviews.find((r) => r.bookingId === data.bookingId);
    if (existing) throw new Error('Đơn đặt chỗ này đã được đánh giá.');

    const newReview: Review = {
      id: 'rev-' + Date.now().toString(36),
      bookingId: data.bookingId,
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      providerId: booking.providerId,
      userId: data.userId,
      userName: data.userName,
      rating: data.rating,
      text: reviewText,
      status: 'visible',
      createdAt: new Date().toISOString(),
    };

    store.reviews.unshift(newReview);
    this.addLog(data.userName, 'Đánh giá dịch vụ', booking.serviceName, `${data.rating} sao: ${data.text}`);
    return newReview;
  },

  async replyReview(reviewId: string, replyText: string, providerName: string = 'Nhà vườn'): Promise<Review> {
    const rev = store.reviews.find((r) => r.id === reviewId);
    if (!rev) throw new Error('Không tìm thấy đánh giá.');

    rev.reply = replyText;
    rev.replyAt = new Date().toISOString();
    this.addLog(providerName, 'Phản hồi đánh giá', rev.id, replyText);
    return rev;
  },

  // --- FAVORITES ---
  async getFavorites(userId: string): Promise<string[]> {
    return store.favorites
      .filter((f) => f.userId === userId)
      .map((f) => f.serviceId);
  },

  async toggleFavorite(userId: string, serviceId: string): Promise<boolean> {
    const idx = store.favorites.findIndex(
      (f) => f.userId === userId && f.serviceId === serviceId
    );
    if (idx >= 0) {
      store.favorites.splice(idx, 1);
      return false;
    } else {
      store.favorites.push({ userId, serviceId });
      this.trackEvent('favorite', serviceId, 'Người dùng');
      return true;
    }
  },

  async setFavorite(userId: string, serviceId: string, isFavorite: boolean): Promise<boolean> {
    const idx = store.favorites.findIndex(
      (f) => f.userId === userId && f.serviceId === serviceId
    );
    if (isFavorite && idx < 0) {
      store.favorites.push({ userId, serviceId });
      this.trackEvent('favorite', serviceId, 'Website');
    } else if (!isFavorite && idx >= 0) {
      store.favorites.splice(idx, 1);
    }
    return isFavorite;
  },

  // --- LOGS & ANALYTICS ---
  addLog(actor: string, action: string, target: string, detail?: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      actor,
      action,
      target,
      detail,
      createdAt: new Date().toISOString(),
    };
    store.logs.unshift(log);
    if (store.logs.length > 200) store.logs.pop();
  },

  async getLogs(): Promise<AuditLog[]> {
    return store.logs;
  },

  trackEvent(type: string, target?: string, source: string = 'Trực tiếp') {
    const ev: AnalyticsEvent = {
      id: 'ev-' + Date.now().toString(36),
      type,
      target,
      source,
      createdAt: new Date().toISOString(),
    };
    store.events.unshift(ev);
    if (store.events.length > 500) store.events.pop();
  },

  async getAnalyticsSummary() {
    const views = store.events.filter((e) => e.type === 'view').length;
    const requests = store.events.filter((e) => e.type === 'request').length;
    const confirmed = store.bookings.filter((b) =>
      ['CONFIRMED', 'COMPLETED'].includes(b.status)
    ).length;
    const completed = store.bookings.filter((b) => b.status === 'COMPLETED').length;
    const conversion = views > 0 ? ((requests / views) * 100).toFixed(1) : '0';

    const sourceBreakdown: Record<string, number> = {};
    for (const ev of store.events.filter((event) => event.type === 'view')) {
      sourceBreakdown[ev.source] = (sourceBreakdown[ev.source] || 0) + 1;
    }

    return {
      views,
      requests,
      confirmed,
      completed,
      conversion,
      sourceBreakdown,
      providersCount: store.providers.length,
      activeProvidersCount: store.providers.filter((p) => p.active).length,
      servicesCount: store.services.length,
      publishedServicesCount: store.services.filter((s) => s.status === 'PUBLISHED').length,
      pendingModerationCount: store.services.filter((s) => s.status === 'REVIEW').length,
    };
  },
};
