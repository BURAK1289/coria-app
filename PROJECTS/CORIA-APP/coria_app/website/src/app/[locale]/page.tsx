import { useTranslations } from 'next-intl';

import { HeroSection } from '@/components/sections/hero-section';
import { SocialProof } from '@/components/sections/social-proof';
import { FeaturesShowcase } from '@/components/sections/features-showcase';
import { AudienceInsights } from '@/components/sections/audience-insights';
import { DemoShowcase } from '@/components/sections/demo-showcase';
import { ImpactOverview } from '@/components/sections/impact-overview';
import { FoundationShowcase } from '@/components/sections/foundation-showcase';
import { BlogPreview } from '@/components/sections/blog-preview';
import { HomeFAQ } from '@/components/sections/home-faq';
import { FinalCTA } from '@/components/sections/final-cta';

export default function Home() {
  const t = useTranslations('common');

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-coria-primary focus:text-white focus:rounded focus:font-medium focus:outline-none focus:ring-2 focus:ring-coria-primary focus:ring-offset-2"
      >
        {t('skipToMainContent')}
      </a>

      <HeroSection />
      <SocialProof />
      <FeaturesShowcase />
      <AudienceInsights />
      <DemoShowcase />
      <ImpactOverview />
      <FoundationShowcase />
      <BlogPreview />
      <HomeFAQ />
      <FinalCTA />
    </main>
  );
}
