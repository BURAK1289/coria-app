'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { AppleIcon, GooglePlayIcon } from '@/components/icons';

export function PricingCTA() {
  const t = useTranslations('pricing');

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-coria-green to-leaf">
      <Container>
        <div className="text-center text-white">
          <Typography variant="h2" className="mb-4 text-white">
            {t('cta.title')}
          </Typography>
          <Typography variant="large" className="mb-8 text-white/90 max-w-2xl mx-auto">
            {t('cta.description')}
          </Typography>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-coria-green hover:bg-gray-100"
              onClick={() => window.open('https://apps.apple.com/app/coria', '_blank')}
            >
              <AppleIcon className="w-5 h-5 mr-2" />
              {t('cta.downloadIos')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-coria-green hover:bg-gray-100"
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.coria.app', '_blank')}
            >
              <GooglePlayIcon className="w-5 h-5 mr-2" />
              {t('cta.downloadAndroid')}
            </Button>
          </div>
          
          <Typography variant="small" className="text-white/70">
            {t('cta.note')}
          </Typography>
        </div>
      </Container>
    </section>
  );
}