import { NextRequest, NextResponse } from 'next/server';

// Google Directions API proxy to avoid CORS issues
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'your_key_here') {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Build URL with optional parameters
    const params = new URLSearchParams({
      origin,
      destination,
      key: apiKey,
    });

    // Add optional parameters if provided
    const departureTime = searchParams.get('departure_time');
    if (departureTime) {
      params.append('departure_time', departureTime);
    } else {
      params.append('departure_time', 'now');
    }

    const trafficModel = searchParams.get('traffic_model');
    if (trafficModel) {
      params.append('traffic_model', trafficModel);
    } else {
      params.append('traffic_model', 'best_guess');
    }

    const alternatives = searchParams.get('alternatives');
    if (alternatives) {
      params.append('alternatives', alternatives);
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json({ error: 'Failed to fetch directions' }, { status: 500 });
  }
}
