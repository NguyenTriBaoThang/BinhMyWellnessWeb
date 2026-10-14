'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Eye,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trees,
  Users,
  FileText,
  Activity,
  Layers,
  Check,
  X,
  Pause,
  Play,
} from 'lucide-react';
import { Service, ProviderProfile, User, AuditLog } from '@/types';
import { formatVND } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'overview' | 'moderation' | 'providers' | 'users' | 'logs'
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'providers' | 'users' | 'logs'>('overview');

  const [revisionNote, setRevisionNote] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, servRes] = await Promise.all([
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/services?all=true').then((r) => r.json()),
      ]);

      if (analyticsRes.summary) setSummary(analyticsRes.summary);
      if (analyticsRes.logs) setLogs(analyticsRes.logs);
      if (analyticsRes.users) setUsers(analyticsRes.users);
      if (analyticsRes.providers) setProviders(analyticsRes.providers);
      if (servRes.services) setServices(servRes.services);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleModerateService = async (serviceId: string, status: string, note?: string) => {
    try {
      setActionLoading(serviceId);
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'service', id: serviceId, status, note }),
      });

      if (res.ok) {
        await loadData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleProvider = async (providerId: string) => {
    try {
      setActionLoading(providerId);
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'provider', id: providerId }),
      });

      if (res.ok) {
        await loadData();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const pendingModeration = services.filter((s) => s.status === 'REVIEW' || s.status === 'REVISION');
  const sourceEntries = Object.entries(summary?.sourceBreakdown || {}) as [string, number][];
  const totalViews = sourceEntries.reduce((sum, [, count]) => sum + count, 0);
  const sourceColors = ['bg-emerald-500', 'bg-river-500', 'bg-amber-500', 'bg-purple-500'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-forest-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            TRUNG TÂM QUẢN TRỊ & ĐIỀU PHỐI DU LỊCH BÌNH MỸ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Ban Quản Trị Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            Tài khoản: <code className="font-mono text-rose-300">binhmy@admin.com</code> • Giám sát quy hoạch, kiểm duyệt và bảo trợ trải nghiệm miệt vườn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-rose-500/30 border border-rose-400/40 rounded-xl text-rose-200 text-xs font-bold">
            {pendingModeration.length} dịch vụ chờ duyệt
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 text-xs sm:text-sm font-bold no-scrollbar">
        {[
          { id: 'overview', label: 'Tổng Quan & Chỉ Số', icon: Activity },
          { id: 'moderation', label: `Kiểm Duyệt Dịch Vụ (${pendingModeration.length})`, icon: Layers },
          { id: 'providers', label: `Nhà Vườn Đối Tác (${providers.length})`, icon: Trees },
          { id: 'users', label: `Người Dùng (${users.length})`, icon: Users },
          { id: 'logs', label: `Nhật Ký Kiểm Toán (${logs.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs">
                <span>Lượt xem trang</span>
                <Eye className="w-4 h-4 text-river-600" />
              </div>
              <div className="text-3xl font-black text-zinc-900 font-mono">
                {summary.views}
              </div>
              <span className="text-[11px] text-zinc-500 block">
                Lượt xem đã ghi nhận trên website
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs">
                <span>Yêu cầu đặt chỗ</span>
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-zinc-900 font-mono">
                {summary.requests}
              </div>
              <span className="text-[11px] text-zinc-500 block">
                {summary.confirmed} đơn đã được nhà vườn xác nhận
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs">
                <span>Tỷ lệ chuyển đổi</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-forest-800 font-mono">
                {summary.conversion}%
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Tỷ lệ yêu cầu trên lượt xem
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500 text-xs">
                <span>Cơ sở hoạt động</span>
                <Trees className="w-4 h-4 text-forest-600" />
              </div>
              <div className="text-3xl font-black text-zinc-900 font-mono">
                {summary.activeProvidersCount} / {summary.providersCount}
              </div>
              <span className="text-[11px] text-zinc-500 block">
                {summary.publishedServicesCount} trải nghiệm công bố
              </span>
            </div>
          </div>

          {/* Traffic Sources & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-zinc-900">
                Phân Bố Nguồn Khách Truy Cập
              </h3>
              <div className="space-y-3">
                {sourceEntries.length > 0 ? sourceEntries.map(([source, count], index) => {
                  const percent = totalViews > 0 ? Math.round((count / totalViews) * 100) : 0;
                  const color = sourceColors[index % sourceColors.length];
                  return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-700">
                      <span>{source}</span>
                      <span>{percent}% · {count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  );
                }) : <p className="text-xs text-zinc-500">Chưa có lượt truy cập được ghi nhận.</p>}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-zinc-900">
                Nhật Ký Thao Tác Gần Đây
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto text-xs pr-1">
                {logs.slice(0, 5).map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 space-y-0.5">
                    <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                      <span className="font-bold text-zinc-700">{l.actor}</span>
                      <span>{new Date(l.createdAt).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    <p className="font-semibold text-zinc-800">{l.action}: {l.target}</p>
                    {l.detail && <p className="text-zinc-500 text-[11px] truncate">{l.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">
              Kiểm Duyệt Trải Nghiệm Mới Gửi Từ Nhà Vườn
            </h2>
          </div>

          <div className="space-y-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-zinc-100 px-2 py-0.5 rounded text-zinc-800">
                      {s.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        s.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'REVIEW'
                          ? 'bg-amber-100 text-amber-800'
                          : s.status === 'REVISION'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {s.status === 'PUBLISHED'
                        ? 'Đã công bố'
                        : s.status === 'REVIEW'
                        ? 'Chờ duyệt'
                        : s.status === 'REVISION'
                        ? 'Cần bổ sung'
                        : 'Tạm ngưng'}
                    </span>
                    <span className="text-xs text-forest-700 font-semibold">
                      {s.providerName}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900">{s.name}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-1">{s.description}</p>

                  <div className="flex items-center gap-4 text-xs text-zinc-600 pt-1">
                    <span>Giá: {formatVND(s.price)}</span>
                    <span>Thời lượng: {s.duration} phút</span>
                    <span>Sức chứa: {s.capacity} khách/ca</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {s.status !== 'PUBLISHED' && (
                    <button
                      onClick={() => handleModerateService(s.id, 'PUBLISHED')}
                      disabled={actionLoading === s.id}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Phê duyệt công bố
                    </button>
                  )}

                  {s.status === 'PUBLISHED' && (
                    <button
                      onClick={() =>
                        handleModerateService(s.id, 'PAUSED', 'Tạm ngưng phục vụ để nâng cấp vườn')
                      }
                      disabled={actionLoading === s.id}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Tạm ngưng
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleModerateService(
                        s.id,
                        'REVISION',
                        'Cần bổ sung hình ảnh thực tế chất lượng cao và hướng dẫn đường đi'
                      )
                    }
                    disabled={actionLoading === s.id}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200"
                  >
                    Yêu cầu bổ sung
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">
            Danh Sách 8 Cơ Sở Nhà Vườn Đối Tác Bình Mỹ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-zinc-400">{p.code}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        p.active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.active ? 'Đang hoạt động' : 'Đang tạm dừng'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900">{p.name}</h3>
                  <p className="text-xs text-zinc-600 line-clamp-2">{p.story}</p>
                  <p className="text-xs text-zinc-500 font-mono">{p.address}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">{p.contact}</span>
                  <button
                    onClick={() => handleToggleProvider(p.id)}
                    disabled={actionLoading === p.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      p.active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {p.active ? 'Khóa cơ sở' : 'Mở lại cơ sở'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">Danh Sách Tài Khoản Người Dùng</h2>
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-3">Họ và tên</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Số điện thoại</th>
                  <th className="px-5 py-3">Vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 font-semibold">{u.name}</td>
                    <td className="px-5 py-3 font-mono text-zinc-600">{u.email}</td>
                    <td className="px-5 py-3 font-mono text-zinc-600">{u.phone || 'Chưa cập nhật'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-800'
                            : u.role === 'PROVIDER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'Ban quản trị' : u.role === 'PROVIDER' ? 'Chủ nhà vườn' : 'Khách hàng'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)</h2>
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 uppercase font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-zinc-50/60">
                    <td className="px-4 py-3 font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString('vi-VN')} {new Date(l.createdAt).toLocaleTimeString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">{l.actor}</td>
                    <td className="px-4 py-3 font-medium text-forest-800">{l.action}</td>
                    <td className="px-4 py-3 font-mono text-zinc-700">{l.target}</td>
                    <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">{l.detail || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
