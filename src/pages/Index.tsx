import { useEffect, useState } from 'react';
import { useLenis } from '@/hooks/useLenis';
import { ScrollTrigger } from '@/hooks/useGSAP';
import { LoadingScreen } from '@/site/LoadingScreen';
import { Navbar } from '@/site/Navbar';
import { HeroSection } from '@/site/HeroSection';
import { SelectedWorks } from '@/site/SelectedWorks';
import { Journal } from '@/site/Journal';
import { Explorations } from '@/site/Explorations';
import { Stats } from '@/site/Stats';
import { ContactFooter } from '@/site/ContactFooter';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  useLenis();

  useEffect(() => {
    if (isLoading) return;
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    const id2 = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      window.cancelAnimationFrame(id);
      window.clearTimeout(id2);
    };
  }, [isLoading]);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) {
      ScrollTrigger.normalizeScroll({ allowNestedScroll: true, type: 'touch' });
    }
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        <Navbar />
        <main>
          <HeroSection ready={!isLoading} />
          <SelectedWorks />
          <Journal />
          <Explorations />
          <Stats />
          <ContactFooter />
        </main>
      </div>
    </>
  );
}
