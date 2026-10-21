import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { siteData } from '@/lib/data/repository';

export const metadata: Metadata = {
  title: `${siteData.name} | Khám phá Bình Mỹ`,
  description: siteData.introduction,
  keywords: ['Bình Mỹ', 'khám phá Bình Mỹ', 'vườn trái cây', 'trải nghiệm làm nghề', 'sông nước'],
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#F8FAF9] font-sans text-zinc-900 antialiased selection:bg-emerald-200 selection:text-emerald-950">
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}