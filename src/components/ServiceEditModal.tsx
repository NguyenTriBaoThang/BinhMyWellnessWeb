'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Service } from '@/types';
import { CATEGORIES } from '@/lib/constants';

interface ServiceEditModalProps {
  service?: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceEditModal({
  service,
  onClose,
  onSuccess,
}: ServiceEditModalProps) {
  const [name, setName] = useState(service?.name || '');
  const [category, setCategory] = useState(service?.category || 'Nông nghiệp');
  const [price, setPrice] = useState(service?.price || 120000);
  const [duration, setDuration] = useState(service?.duration || 90);
  const [capacity, setCapacity] = useState(service?.capacity || 16);
  const [slotsStr, setSlotsStr] = useState(service?.slots?.join(', ') || '08:30, 10:30, 14:00, 16:00');
  const [description, setDescription] = useState(service?.description || '');
  const [indoor, setIndoor] = useState(service?.indoor || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('Tên dịch vụ cần ít nhất 3 ký tự.');
      return;
    }
    if (description.trim().length < 20) {
      setError('Mô tả dịch vụ cần ít nhất 20 ký tự để khách hàng nắm rõ.');
      return;
    }

    const slots = slotsStr.split(',').map((s) => s.trim()).filter(Boolean);
    if (!slots.length) {
      setError('Vui lòng nhập ít nhất một khung giờ đón khách.');
      return;
    }

    try {
      setLoading(true);
      const url = service ? `/api/services/${service.id}` : '/api/services';
      const method = service ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          duration: Number(duration),
          capacity: Number(capacity),
          slots,
          description,
          indoor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu dịch vụ');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        <div className="p-5 bg-gradient-to-r from-amber-700 to-forest-800 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">
              {service ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
            </h3>
            <p className="text-xs text-amber-200">
              Dịch vụ sẽ được gửi ban quản trị kiểm duyệt trước khi công bố
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Tên trải nghiệm / hoạt động
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ví dụ: Thu hoạch dưa lưới trong nhà màng"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Giá vé (VNĐ / người)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={5000}
                required
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={30}
                max={480}
                required
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Sức chứa tối đa / ca
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                required
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Các khung giờ đón khách (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={slotsStr}
              onChange={(e) => setSlotsStr(e.target.value)}
              placeholder="08:30, 10:30, 14:00, 16:00"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Mô tả chi tiết trải nghiệm
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              placeholder="Mô tả các hoạt động, điểm nhấn, điều thú vị du khách sẽ được trải nghiệm..."
              className="w-full p-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="indoor-check"
              checked={indoor}
              onChange={(e) => setIndoor(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="indoor-check" className="text-xs text-zinc-700 font-medium">
              Có khu vực mái che, không lo mưa nắng
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-60 transition-all"
            >
              {loading ? 'Đang lưu...' : 'Gửi kiểm duyệt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
