'use client';

import { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { Booking } from '@/types';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  booking,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError('Nội dung đánh giá cần ít nhất 10 ký tự.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi gửi nhận xét');

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
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-100">
        <div className="p-5 bg-gradient-to-r from-forest-800 to-river-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">Đánh Giá Trải Nghiệm</h3>
            <p className="text-xs text-zinc-300 truncate max-w-xs">{booking.serviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2 text-center">
              Mức độ hài lòng của bạn
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-amber-700 font-semibold mt-1">
              {rating === 5 && 'Tuyệt vời, rất hài lòng!'}
              {rating === 4 && 'Rất tốt, dịch vụ chu đáo.'}
              {rating === 3 && 'Bình thường, tạm ổn.'}
              {rating === 2 && 'Cần cải thiện thêm.'}
              {rating === 1 && 'Chưa hài lòng.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Cảm nhận và nhận xét của bạn
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
              placeholder="Chia sẻ về không gian, thái độ đón tiếp, chất lượng nông sản hoặc trải nghiệm thực tế tại nhà vườn..."
              className="w-full p-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
            <span className="text-[11px] text-zinc-400">Tối thiểu 10 ký tự</span>
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
              className="px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-md shadow-forest-700/20 disabled:opacity-60 transition-all"
            >
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
