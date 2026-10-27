import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: 'BÌNH MỸ DU KÝ — Khám phá Bình Mỹ, lên chuyến đi vừa ý',
  description: 'Khám phá sông nước, miệt vườn, nghề thủ công và trang trại. Tự chọn hành trình phù hợp thời gian và túi tiền.',
  keywords: ['Bình Mỹ Du Ký', 'Bình Mỹ', 'du lịch sinh thái', 'vườn trái cây', 'làng nghề thủ công', 'sông nước', 'Củ Chi', 'lập hành trình'],
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="min-h-screen bg-[#F7F4EA] font-sans text-[#26352E] antialiased selection:bg-[#E7EFE4] selection:text-[#174C3C] flex flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}