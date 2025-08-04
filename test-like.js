// Script de prueba para el endpoint de likes
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Obtener token desde variables de entorno o usar uno de prueba
const TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

async function testLikeEndpoint() {
  console.log('🧪 Testing like endpoint...');
  console.log(`🔗 URL: ${BASE_URL}/feed/59/like`);
  console.log(`🔑 Token: ${TOKEN ? TOKEN.substring(0, 20) + '...' : 'NO TOKEN'}`);
  
  try {
    // Test POST para dar like
    console.log('\n📤 Testing POST /feed/59/like');
    const response = await axios.post(
      `${BASE_URL}/feed/59/like`,
      {}, // Body vacío
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success!');
    console.log('📊 Status:', response.status);
    console.log('📋 Data:', response.data);
    
    // Test GET para verificar estructura
    console.log('\n📤 Testing GET /feed/59 (para ver estructura)');
    const feedResponse = await axios.get(
      `${BASE_URL}/feed/59`,
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Feed item structure:');
    console.log('📋 Data:', feedResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
      console.error('🔍 Headers:', error.response.headers);
    }
    
    if (error.response?.status === 401) {
      console.error('🔑 Posible problema de autenticación - token inválido o expirado');
    }
    
    if (error.response?.status === 400) {
      console.error('📝 Bad Request - revisar estructura de la petición');
    }
    
    if (error.response?.status === 404) {
      console.error('🔍 Endpoint no encontrado - revisar ruta del backend');
    }
  }
}

// Test alternativo con diferentes endpoints
async function testAlternativeEndpoints() {
  console.log('\n🧪 Testing alternative endpoints...');
  
  const endpoints = [
    '/feed/59/likes',     // Alternativa 1
    '/feed/59/like',      // Actual
    '/likes/59',          // Alternativa 2
    '/feed/likes/59',     // Alternativa 3
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📤 Testing POST ${endpoint}`);
      const response = await axios.post(
        `${BASE_URL}${endpoint}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log(`📋 Response:`, response.data);
      
    } catch (error) {
      console.log(`❌ ${endpoint} - Status: ${error.response?.status || 'Network Error'}`);
      if (error.response?.data) {
        console.log(`📋 Error:`, error.response.data);
      }
    }
  }
}

// Ejecutar tests
async function runTests() {
  if (!TOKEN || TOKEN === 'your-test-token-here') {
    console.log('⚠️ No hay token configurado. Para usar este script:');
    console.log('1. Obtén un token válido desde el frontend (Dev Tools -> Application -> Local Storage)');
    console.log('2. Ejecuta: TEST_TOKEN="tu-token-aqui" node test-like.js');
    return;
  }
  
  await testLikeEndpoint();
  await testAlternativeEndpoints();
}

runTests().catch(console.error); 