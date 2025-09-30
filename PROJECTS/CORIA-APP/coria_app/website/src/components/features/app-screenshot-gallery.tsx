'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlayIcon } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { SwipeableGallery } from '@/components/ui/swipeable-gallery';
import { cn } from '@/lib/utils';

interface AppScreenshotGalleryProps {
  category: string;
}

const getScreenshotsForCategory = (category: string) => {
  const baseScreenshots = [
    {
      id: 1,
      title: 'Barcode Scanner',
      description: 'Scan any product barcode instantly',
    },
    {
      id: 2,
      title: 'Product Insights',
      description: 'Detailed sustainability and impact scores',
    },
    {
      id: 3,
      title: 'AI Recommendations',
      description: 'Discover smarter alternatives aligned with your values',
    },
    {
      id: 4,
      title: 'Impact Dashboard',
      description: 'Track carbon, water, and health impact over time',
    },
  ];

  return baseScreenshots.map((item) => ({ ...item, key: `${category}-${item.id}` }));
};

export function AppScreenshotGallery({ category }: AppScreenshotGalleryProps) {
  const t = useTranslations('features');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const screenshots = getScreenshotsForCategory(category);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Heading as="h3" size="xl" weight="bold" className="text-coria-primary">
            {t('gallery.title')}
          </Heading>
          <Text size="sm" color="secondary" className="text-gray-600">
            {t(`categories.${category}.title`)}
          </Text>
        </div>
        <Button
          variant={showVideo ? 'primary' : 'ghost'}
          size="sm"
          className={cn('gap-2', showVideo ? 'text-white' : 'text-coria-primary')}
          onClick={() => setShowVideo((prev) => !prev)}
        >
          <PlayIcon className="h-4 w-4" />
          {t('gallery.watchDemo')}
        </Button>
      </div>

      {showVideo ? (
        <Card className="rounded-[28px] border border-white/70 bg-white/95 p-6 text-center shadow-[0_30px_90px_-70px_rgba(27,94,63,0.45)]">
          <div className="flex aspect-video items-center justify-center rounded-[24px] bg-gradient-to-br from-coria-primary/15 via-white to-leaf/15">
            <div className="space-y-3 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coria-primary/15 text-coria-primary">
                <PlayIcon className="h-8 w-8" />
              </span>
              <Text size="sm" color="secondary" className="text-gray-600">
                {t('gallery.videoPlaceholder')}
              </Text>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_30px_90px_-70px_rgba(27,94,63,0.45)]">
          <SwipeableGallery onSlideChange={setCurrentIndex} showDots className="max-w-sm mx-auto">
            {screenshots.map((screenshot) => (
              <div key={screenshot.key} className="space-y-4">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[26px] bg-gradient-to-br from-coria-primary/10 via-white to-leaf/10">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <Badge variant="secondary" className="bg-coria-primary/10 text-coria-primary">
                      {t(`categories.${category}.title`)}
                    </Badge>
                    <Heading as="h4" size="lg" weight="semibold" className="mt-4 text-coria-primary">
                      {screenshot.title}
                    </Heading>
                    <Text size="sm" color="secondary" className="mt-2 px-8 text-gray-600">
                      {screenshot.description}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </SwipeableGallery>

          <div className="mt-6 hidden justify-center gap-2 md:flex">
            {screenshots.map((screenshot, index) => (
              <button
                key={screenshot.key}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-2 w-8 rounded-full transition-all',
                  index === currentIndex ? 'bg-coria-primary' : 'bg-coria-primary/20 hover:bg-coria-primary/40'
                )}
                type="button"
              />
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
