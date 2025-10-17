import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, id, url, timestamp } = body;

    // Validate the data
    if (!name || typeof value !== 'number' || !id) {
      return NextResponse.json(
        { error: 'Invalid web vitals data' },
        { status: 400 }
      );
    }

    // In a real application, you would store this data in a database
    // or send it to an analytics service like Google Analytics, Mixpanel, etc.
    
    // For now, we'll just log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals Metric:', {
        name,
        value,
        id,
        url,
        timestamp: new Date(timestamp).toISOString(),
      });
    }

    // Example: Send to external analytics service
    if (process.env.ANALYTICS_ENDPOINT) {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
        },
        body: JSON.stringify({
          event: 'web_vitals',
          properties: {
            metric_name: name,
            metric_value: value,
            metric_id: id,
            page_url: url,
            timestamp,
            user_agent: request.headers.get('user-agent'),
            referer: request.headers.get('referer'),
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}