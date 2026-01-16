import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect API routes, not pages (pages have client-side protection)
  if (pathname.startsWith('/api/crop-disease-diagnosis') ||
      pathname.startsWith('/api/crop-price-prediction') ||
      pathname.startsWith('/api/weather-prediction') ||
      pathname.startsWith('/api/translate-text')) {
    
    const sessionCookie = request.cookies.get('__session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/crop-disease-diagnosis/:path*',
    '/api/crop-price-prediction/:path*',
    '/api/weather-prediction/:path*',
    '/api/translate-text/:path*',
  ],
};
