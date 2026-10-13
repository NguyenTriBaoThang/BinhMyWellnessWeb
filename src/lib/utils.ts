import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVN(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function getStatusBadge(status: string) {
  const map: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    PENDING: {
      label: 'Chờ xác nhận',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    PROPOSED: {
      label: 'Đề xuất đổi lịch',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
    CONFIRMED: {
      label: 'Đã xác nhận',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    REJECTED: {
      label: 'Bị từ chối',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
    CANCELLED: {
      label: 'Đã hủy',
      bg: 'bg-zinc-100',
      text: 'text-zinc-700',
      border: 'border-zinc-200',
    },
    COMPLETED: {
      label: 'Hoàn thành',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    PUBLISHED: {
      label: 'Đã công bố',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    REVIEW: {
      label: 'Chờ kiểm duyệt',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    REVISION: {
      label: 'Cần bổ sung',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
    PAUSED: {
      label: 'Tạm ngưng',
      bg: 'bg-zinc-100',
      text: 'text-zinc-700',
      border: 'border-zinc-200',
    },
  };

  return (
    map[status] || {
      label: status,
      bg: 'bg-zinc-50',
      text: 'text-zinc-700',
      border: 'border-zinc-200',
    }
  );
}
