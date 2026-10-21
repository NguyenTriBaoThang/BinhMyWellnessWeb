import type { Metadata } from 'next';
import MyLocalPage from '@/components/MyLocalPageV2';

export const metadata: Metadata = { title: 'Hành trình của tôi | Bình Mỹ Du Ký Website' };
export default function MyPage() { return <MyLocalPage />; }
