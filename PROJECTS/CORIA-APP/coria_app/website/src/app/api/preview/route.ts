import { NextRequest, NextResponse } from 'next/server';
import { getPageBySlug } from '@/lib/cms/pages';
import { getBlogPostBySlug } from '@/lib/cms/blog';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');
  const contentType = searchParams.get('contentType') || 'page';
  
  // Check the secret and next parameters
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  if (!slug) {
    return NextResponse.json(
      { message: 'Slug is required' },
      { status: 400 }
    );
  }
  
  try {
    let content = null;
    let redirectPath = '/';
    
    if (contentType === 'blogPost') {
      content = await getBlogPostBySlug(slug, true);
      redirectPath = `/blog/${slug}`;
    } else {
      content = await getPageBySlug(slug, true);
      redirectPath = `/${slug}`;
    }
    
    if (!content) {
      return NextResponse.json(
        { message: 'Content not found' },
        { status: 404 }
      );
    }
    
    // Create response with preview mode enabled
    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    
    // Set preview mode cookies
    response.cookies.set('__prerender_bypass', '1', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60, // 1 hour
    });
    
    response.cookies.set('__next_preview_data', JSON.stringify({
      contentType,
      slug,
    }), {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60, // 1 hour
    });
    
    return response;
    
  } catch (error) {
    logger.error('Preview error:', error);
    return NextResponse.json(
      { message: 'Failed to enable preview mode' },
      { status: 500 }
    );
  }
}

// Clear preview mode
export async function DELETE() {
  const response = NextResponse.json({ message: 'Preview mode disabled' });
  
  response.cookies.delete('__prerender_bypass');
  response.cookies.delete('__next_preview_data');
  
  return response;
}