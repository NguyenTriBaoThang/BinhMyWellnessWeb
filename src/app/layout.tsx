import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RoleSwitcherBar from '@/components/RoleSwitcherBar';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Bình Mỹ Wellness Web | Khám Phá Nông Nghiệp & Miệt Vườn Củ Chi 365',
  description:
    'Nền tảng kết nối du lịch nông nghiệp, sinh thái miệt vườn, chèo SUP hoàng hôn ven sông Sài Gòn và ẩm thực đồng quê tại Xã Bình Mỹ, Huyện Củ Chi, TP.HCM.',
  keywords: [
    'Bình Mỹ',
    'Củ Chi',
    'Du lịch sinh thái',
    'Nhà vườn',
    'Chèo SUP',
    'Rạch Dứa',
    'Vườn xanh',
    'Đầm sen',
    'Sông Sài Gòn',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-950 font-sans">
        <RoleSwitcherBar
          currentRole={currentUser?.role}
          currentEmail={currentUser?.email}
        />
        <Header currentUser={currentUser} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
