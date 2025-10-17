import { NextRequest, NextResponse } from 'next/server';
import { 
  getFeatures, 
  getFeatureByName, 
  getFeatureCategories,
  getFeaturesByCategory,
  getRelatedFeatures
} from '@/lib/cms/features';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const category = searchParams.get('category');
    const related = searchParams.get('related');
    const preview = searchParams.get('preview') === 'true';
    const action = searchParams.get('action');
    
    if (action === 'categories') {
      // Get feature categories
      const categories = await getFeatureCategories(preview);
      return NextResponse.json({ categories });
    }
    
    if (name) {
      // Get specific feature by name
      const feature = await getFeatureByName(name, preview);
      
      if (!feature) {
        return NextResponse.json(
          { error: 'Feature not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ feature });
    }
    
    if (related && category) {
      // Get related features
      const features = await getRelatedFeatures(related, category, 3, preview);
      return NextResponse.json({ features });
    }
    
    if (category) {
      // Get features by category
      const features = await getFeaturesByCategory(category, preview);
      return NextResponse.json({ features });
    }
    
    // Get all features
    const features = await getFeatures(undefined, preview);
    return NextResponse.json({ features });
    
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}