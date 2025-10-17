'use client';

import { BrandBackground } from '@/components/ui/BrandBackground';

interface ClientBackgroundProps {
  enabled: boolean;
  intensity: 'low' | 'med' | 'high';
}

export function ClientBackground({ enabled, intensity }: ClientBackgroundProps) {
  if (!enabled) return null;

  return <BrandBackground intensity={intensity} interactive={true} />;
}
