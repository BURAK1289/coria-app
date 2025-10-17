'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Dynamic import for BrandBackground (client-only component)
const BrandBackground = dynamic(
  () => import('@/components/ui/BrandBackground'),
  {
    ssr: false,
    loading: () => {
      console.log('Loading BrandBackground component...');
      return null;
    }
  }
);

interface BackgroundWrapperProps {
  enabled: boolean;
  intensity: 'low' | 'med' | 'high';
}

export function BackgroundWrapper({ enabled, intensity }: BackgroundWrapperProps) {
  useEffect(() => {
    console.log('BackgroundWrapper mounted:', { enabled, intensity });
  }, [enabled, intensity]);

  if (!enabled) {
    console.log('Background is disabled');
    return null;
  }

  console.log('Rendering BrandBackground with intensity:', intensity);
  return <BrandBackground intensity={intensity} interactive={true} />;
}
