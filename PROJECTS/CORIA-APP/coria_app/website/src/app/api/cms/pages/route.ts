import { NextRequest, NextResponse } from 'next/server';
import { getPages, getPageBySlug } from '@/lib/cms/pages';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const preview = searchParams.get('preview') === 'true';
    
    if (slug) {
      // Get specific page by slug
      const page = await getPageBySlug(slug, preview);
      
      if (!page) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ page });
    } else {
      // Get all pages
      const pages = await getPages(preview);
      return NextResponse.json({ pages });
    }
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}