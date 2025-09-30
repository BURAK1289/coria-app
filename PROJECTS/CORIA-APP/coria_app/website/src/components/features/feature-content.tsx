'use client';

import { FeatureOverview } from './feature-overview';
import { FeatureDetail } from './feature-detail';
import { CategoryOverview } from './category-overview';

interface FeatureContentProps {
  category?: string;
  feature?: string;
}

export function FeatureContent({ category, feature }: FeatureContentProps) {
  // If no category is selected, show general features overview
  if (!category) {
    return <FeatureOverview />;
  }

  // If category is selected but no specific feature, show category overview
  if (category && !feature) {
    return <CategoryOverview category={category} />;
  }

  // If both category and feature are selected, show feature detail
  if (category && feature) {
    return <FeatureDetail category={category} feature={feature} />;
  }

  return <FeatureOverview />;
}