#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';

// Test if the API handler is properly built
try {
  const apiHandler = readFileSync(join(process.cwd(), 'api', 'index.js'), 'utf8');
  
  // Check if the handler exports a default function
  if (apiHandler.includes('module.exports = handler') || apiHandler.includes('export default') || apiHandler.includes('module.exports.default')) {
    console.log('✅ API handler is properly built and exports a function');
  } else {
    console.log('❌ API handler does not export a function');
    console.log('Handler preview:', apiHandler.substring(0, 200) + '...');
  }
  
  // Check for proper imports
  if (apiHandler.includes('express') && apiHandler.includes('registerRoutes')) {
    console.log('✅ API handler includes required dependencies');
  } else {
    console.log('❌ API handler is missing required dependencies');
  }
  
} catch (error) {
  console.error('❌ Error reading API handler:', error);
}

// Test if the Vercel config is valid JSON
try {
  const vercelConfig = JSON.parse(readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'));
  console.log('✅ vercel.json is valid JSON');
  console.log('Configuration:', JSON.stringify(vercelConfig, null, 2));
} catch (error) {
  console.error('❌ Error reading vercel.json:', error);
}
