import type { Metadata } from 'next';
import MyLocalPage from '@/components/MyLocalPageV2';

export const metadata: Metadata = {
  title: 'Nội dung đã lưu | Bình Mỹ Du Ký Website',
  description: 'Quản lý các hành trình, điểm đến yêu thích và nhật ký trải nghiệm cá nhân tại Bình Mỹ.',
};

export default function MyPage() {
  return <MyLocalPage />;
}
