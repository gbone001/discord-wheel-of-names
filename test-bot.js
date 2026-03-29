/**
 * Simple test to verify bot components work
 */

import { generateWheelGIF } from './wheel-generator.js';
import { UplupAPI } from './uplup-api.js';
import { writeFileSync } from 'fs';

console.log('Testing bot components...\n');

// Test GIF generation
async function testGifGeneration() {
  console.log('1. Testing GIF generation...');
  
  try {
    const entries = ['Alice', 'Bob', 'Charlie', 'Diana'];
    const gifBuffer = await generateWheelGIF(entries, {
      winner: 'Bob',
      colorPalette: 'uplup',
      duration: 2000,
      fps: 10,
      spinRevolutions: 2
    });
    
    writeFileSync('test-output.gif', gifBuffer);
    console.log('   ✅ GIF generation successful\n');
  } catch (error) {
    console.error('   ❌ GIF generation failed:', error.message);
  }
}

// Test API client (without actual API key)
async function testApiClient() {
  console.log('2. Testing API client...');
  
  try {
    // Just test instantiation, not actual API calls
    const api = new UplupAPI('test_key');
    console.log('   ✅ API client instantiation successful\n');
  } catch (error) {
    console.error('   ❌ API client instantiation failed:', error.message);
  }
}

async function runTests() {
  await testGifGeneration();
  await testApiClient();
  console.log('🎉 All tests completed!');
}

runTests().catch(console.error);