import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, getBlogCategories } from '@/lib/cms/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const category = searchParams.get('category');
    const preview = searchParams.get('preview') === 'true';

    // Handle categories endpoint
    if (searchParams.get('type') === 'categories') {
      const categories = await getBlogCategories(preview);
      return NextResponse.json({
        success: true,
        data: categories,
      });
    }

    // Handle blog posts endpoint
    const posts = await getBlogPosts(limit, category, preview);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        total: posts.length,
        limit: limit || posts.length,
        page: 1,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}