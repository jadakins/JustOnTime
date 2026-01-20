#!/usr/bin/env node

/**
 * Test script to verify WeatherAPI key is configured and working
 * Usage:
 *   - Locally: npm run test:weather
 *   - Or with env: NEXT_PUBLIC_WEATHER_API_KEY=your_key node scripts/test-weather-api.js
 */

// Load .env.local if running locally
if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  }
}

const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

if (!apiKey) {
  console.error('❌ WEATHER API KEY NOT FOUND');
  console.error('   Add NEXT_PUBLIC_WEATHER_API_KEY to your .env.local file');
  process.exit(1);
}

if (apiKey === 'your_key_here') {
  console.error('❌ WEATHER API KEY NOT CONFIGURED');
  console.error('   Replace placeholder "your_key_here" with actual API key');
  process.exit(1);
}

console.log('✓ API key found, testing connection...');

const JAKARTA_COORDS = '-6.2088,106.8456';
const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${JAKARTA_COORDS}`;

fetch(url)
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log('✓ WeatherAPI connection successful!');
    console.log(`  Location: ${data.location.name}, ${data.location.country}`);
    console.log(`  Temperature: ${data.current.temp_c}°C`);
    console.log(`  Condition: ${data.current.condition.text}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ WeatherAPI connection failed');
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  });
