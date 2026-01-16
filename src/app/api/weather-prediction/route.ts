import { getWeatherAnalysis } from '@/ai/flows/weather-prediction';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to access this feature.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await getWeatherAnalysis(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
