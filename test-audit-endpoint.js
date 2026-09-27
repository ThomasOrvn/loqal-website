#!/usr/bin/env node
/**
 * Script de test de l'endpoint d'audit Google Apps Script
 * Usage: node test-audit-endpoint.js <ENDPOINT_URL>
 */

const https = require('https');
const http = require('http');
const { URLSearchParams } = require('url');

const ENDPOINT_URL = process.argv[2];

if (!ENDPOINT_URL) {
  console.error('❌ Usage: node test-audit-endpoint.js <ENDPOINT_URL>');
  console.error('   Exemple: node test-audit-endpoint.js "https://script.google.com/macros/s/..."');
  process.exit(1);
}

// Test data for Château de Pommard
const testData = {
  activityName: 'Château de Pommard',
  city: 'Pommard',
  url: 'https://www.chateaudepommard.com'
};

console.log('🧪 Test de l\'endpoint d\'audit');
console.log('================================\n');
console.log('📍 Endpoint:', ENDPOINT_URL.replace(/\/([^/]+)$/, '/***'));
console.log('📝 Données de test:');
console.log('   - Activité:', testData.activityName);
console.log('   - Ville:', testData.city);
console.log('   - Site:', testData.url);
console.log('\n⏳ Envoi de la requête...\n');

const body = new URLSearchParams(testData).toString();
const url = new URL(ENDPOINT_URL);
const lib = url.protocol === 'https:' ? https : http;

const startTime = Date.now();

const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = lib.request(options, (res) => {
  const latency = Date.now() - startTime;
  
  console.log(`⚡ Statut: ${res.statusCode}`);
  console.log(`⏱️  Latence: ${latency}ms\n`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error('❌ Erreur HTTP:', res.statusCode);
      console.error('Réponse brute:', data);
      process.exit(1);
    }
    
    try {
      const result = JSON.parse(data);
      
      if (result.error) {
        console.error('❌ Erreur retournée par l\'API:', result.error);
        process.exit(1);
      }
      
      console.log('✅ Réponse JSON complète:');
      console.log('==========================\n');
      console.log(JSON.stringify(result, null, 2));
      
      console.log('\n📊 Résumé:');
      console.log('==========');
      console.log(`Score: ${result.score}/100`);
      console.log(`Critères: ${result.criteria?.length || 0}`);
      
      if (result.criteria) {
        console.log('\n📋 Détail des critères:');
        result.criteria.forEach((c, i) => {
          const icon = c.ok ? '✓' : '✗';
          console.log(`${i + 1}. [${icon}] ${c.label} (${c.points} pts)`);
          if (c.conseil && !c.ok) {
            console.log(`   → ${c.conseil}`);
          }
          if (c.source) {
            console.log(`   🔗 ${c.source}`);
          }
        });
      }
      
      if (result.sources && result.sources.length > 0) {
        console.log('\n📚 Sources utilisées:');
        result.sources.forEach((s, i) => {
          console.log(`${i + 1}. ${s}`);
        });
      }
      
      console.log('\n✅ Test réussi!');
      
    } catch (e) {
      console.error('❌ Erreur de parsing JSON:', e.message);
      console.error('Réponse brute:', data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur réseau:', e.message);
  process.exit(1);
});

req.write(body);
req.end();
