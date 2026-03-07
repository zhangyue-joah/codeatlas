import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeNav } from '@/components/home/HomeNav';
import { HomeShowcase } from '@/components/home/HomeShowcase';
import { QuickEntry } from '@/components/home/QuickEntry';
import { TrustStatement } from '@/components/home/TrustStatement';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HomeNav />
      <HomeShowcase />
      <QuickEntry />
      <TrustStatement />
    </div>
  );
}
