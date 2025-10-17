import { 
  fetchContentfulEntry, 
  fetchContentfulEntries, 
  ContentfulFeature,
  ContentfulFeatureCategory,
  ContentfulAsset,
  FeatureSkeleton,
  FeatureCategorySkeleton
} from '../contentful';
import { Asset, Entry } from 'contentful';

export interface Feature {
  name: string;
  description: string;
  icon: string;
  screenshots: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  }[];
  benefits: string[];
  category: FeatureCategory;
  methodology?: any; // Rich text document
  dataSources?: string[];
  relatedFeatures?: Feature[];
}

export interface FeatureCategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
}

// Type guards
function isAsset(item: any): item is Asset {
  return item && item.sys && item.sys.type === 'Asset' && item.fields && item.fields.file;
}

// Transform functions
function transformFeatureCategory(contentfulCategory: Entry<FeatureCategorySkeleton>): FeatureCategory {
  return {
    name: contentfulCategory.fields.name as unknown as string,
    slug: contentfulCategory.fields.slug as unknown as string,
    description: contentfulCategory.fields.description as unknown as string | undefined,
    icon: contentfulCategory.fields.icon as unknown as string | undefined,
    order: contentfulCategory.fields.order as unknown as number,
  };
}

function transformAsset(asset: Asset) {
  if (!isAsset(asset)) {
    throw new Error('Invalid asset');
  }

  const file = asset.fields.file;
  if (!file) {
    throw new Error('Asset file is missing');
  }

  const title = typeof asset.fields.title === 'string' ? asset.fields.title : '';
  const description = typeof asset.fields.description === 'string' ? asset.fields.description : '';

  // Safely access image details
  const imageDetails = file.details && 'image' in file.details ? file.details.image : undefined;

  return {
    url: `https:${file.url}`,
    alt: title || description || 'Feature screenshot',
    width: imageDetails?.width,
    height: imageDetails?.height,
  };
}

function transformFeature(contentfulFeature: Entry<FeatureSkeleton>): Feature {
  return {
    name: contentfulFeature.fields.name as unknown as string,
    description: contentfulFeature.fields.description as unknown as string,
    icon: contentfulFeature.fields.icon as unknown as string,
    screenshots: (contentfulFeature.fields.screenshots as unknown as Asset[])?.map(transformAsset) || [],
    benefits: contentfulFeature.fields.benefits as unknown as string[],
    category: transformFeatureCategory(contentfulFeature.fields.category as any),
    methodology: contentfulFeature.fields.methodology,
    dataSources: contentfulFeature.fields.dataSources as unknown as string[] | undefined,
    relatedFeatures: (contentfulFeature.fields.relatedFeatures as any)?.map(transformFeature),
  };
}

// Get all features
export async function getFeatures(
  category?: string,
  preview = false
): Promise<Feature[]> {
  const query: Record<string, any> = {
    order: 'fields.category.fields.order,fields.name',
    include: 3, // Include linked entries up to 3 levels
  };
  
  if (category) {
    query['fields.category.fields.slug'] = category;
  }
  
  const contentfulFeatures = await fetchContentfulEntries<FeatureSkeleton>(
    'feature',
    query,
    preview
  );
  
  return contentfulFeatures.map(transformFeature);
}

// Get feature by name (slug-like)
export async function getFeatureByName(name: string, preview = false): Promise<Feature | null> {
  const contentfulFeatures = await fetchContentfulEntries<FeatureSkeleton>(
    'feature',
    {
      'fields.name[match]': name,
      limit: 1,
      include: 3,
    },
    preview
  );
  
  if (!contentfulFeatures.length) {
    return null;
  }
  
  return transformFeature(contentfulFeatures[0]);
}

// Get feature categories
export async function getFeatureCategories(preview = false): Promise<FeatureCategory[]> {
  const contentfulCategories = await fetchContentfulEntries<FeatureCategorySkeleton>(
    'featureCategory',
    { order: 'fields.order' },
    preview
  );
  
  return contentfulCategories.map(transformFeatureCategory);
}

// Get features by category
export async function getFeaturesByCategory(
  categorySlug: string,
  preview = false
): Promise<Feature[]> {
  return getFeatures(categorySlug, preview);
}

// Get related features
export async function getRelatedFeatures(
  currentFeatureName: string,
  categorySlug: string,
  limit = 3,
  preview = false
): Promise<Feature[]> {
  const contentfulFeatures = await fetchContentfulEntries<FeatureSkeleton>(
    'feature',
    {
      'fields.category.fields.slug': categorySlug,
      'fields.name[ne]': currentFeatureName,
      order: 'fields.name',
      limit,
      include: 2,
    },
    preview
  );
  
  return contentfulFeatures.map(transformFeature);
}