#!/usr/bin/env node

/**
 * Test script to check Google Maps route duration between office and home
 */

const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (error) {
    console.error('Failed to load .env.local:', error.message);
  }
}

loadEnv();
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Office and Home coordinates from config/locations.ts
const OFFICE_COORDS = '-6.2088,106.8199'; // Sudirman
const HOME_COORDS = '-6.2673,106.7831'; // Pondok Indah

async function testRouteDuration() {
  if (!API_KEY || API_KEY === 'your_key_here') {
    console.error('❌ Google Maps API key not configured');
    process.exit(1);
  }

  console.log('🗺️  Testing Google Maps Directions API\n');
  console.log('From: Office (Sudirman)', OFFICE_COORDS);
  console.log('To: Home (Pondok Indah)', HOME_COORDS);
  console.log('');

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.append('origin', OFFICE_COORDS);
    url.searchParams.append('destination', HOME_COORDS);
    url.searchParams.append('departure_time', 'now');
    url.searchParams.append('traffic_model', 'best_guess');
    url.searchParams.append('key', API_KEY);

    console.log('📡 Fetching route data...\n');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('❌ API Error:', data.status);
      if (data.error_message) {
        console.error('Error message:', data.error_message);
      }
      console.log('\nFull response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    console.log('✅ Route found!\n');
    console.log('Distance:', leg.distance.text, `(${leg.distance.value} meters)`);
    console.log('Duration (no traffic):', leg.duration.text, `(${leg.duration.value} seconds)`);
    console.log('Duration (no traffic in minutes):', Math.round(leg.duration.value / 60), 'minutes');

    if (leg.duration_in_traffic) {
      console.log('\n🚦 Traffic Data:');
      console.log('Duration (with traffic):', leg.duration_in_traffic.text, `(${leg.duration_in_traffic.value} seconds)`);
      console.log('Duration (with traffic in minutes):', Math.round(leg.duration_in_traffic.value / 60), 'minutes');

      const delaySeconds = leg.duration_in_traffic.value - leg.duration.value;
      const delayMinutes = Math.round(delaySeconds / 60);
      console.log('Traffic delay:', delayMinutes, 'minutes');
      console.log('Delay ratio:', (leg.duration_in_traffic.value / leg.duration.value).toFixed(2) + 'x');
    } else {
      console.log('\n⚠️  No traffic data available (duration_in_traffic missing)');
    }

    console.log('\n📍 Route summary:', route.summary);
    console.log('\nSteps:');
    leg.steps.slice(0, 3).forEach((step, i) => {
      const clean = step.html_instructions.replace(/<[^>]*>/g, '');
      console.log(`  ${i + 1}. ${clean.substring(0, 100)}...`);
    });

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRouteDuration();
