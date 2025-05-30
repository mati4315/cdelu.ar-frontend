// Script avanzado para diagnosticar el problema de likes
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Token del usuario (copia desde localStorage)
const TOKEN = process.env.TEST_TOKEN || 'your-token-here';

async function testBackendHealth() {
  console.log('🏥 [HEALTH CHECK] Verificando estado del backend...\n');
  
  try {
    // Test 1: Health check básico
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend responde:', healthResponse.status);
  } catch (error) {
    console.log('❌ Backend no responde o no tiene endpoint /health');
  }
  
  try {
    // Test 2: Verificar ruta de feed
    const feedResponse = await axios.get(`${BASE_URL}/feed`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log('✅ Endpoint /feed funciona:', feedResponse.status);
  } catch (error) {
    console.log('❌ Endpoint /feed falló:', error.response?.status || 'Network Error');
  }
}

async function testUserInfo() {
  console.log('\n👤 [USER INFO] Verificando información del usuario...\n');
  
  try {
    // Test: Obtener info del usuario actual
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    console.log('✅ Usuario autenticado:');
    console.log('   - ID:', userResponse.data.id);
    console.log('   - Nombre:', userResponse.data.nombre);
    console.log('   - Email:', userResponse.data.email);
    console.log('   - Role:', userResponse.data.role);
    
    return userResponse.data;
  } catch (error) {
    console.log('❌ Error obteniendo info del usuario:', error.response?.status);
    return null;
  }
}

async function testFeedItem(feedId = 62) {
  console.log(`\n📰 [FEED ITEM] Verificando item ${feedId}...\n`);
  
  try {
    // Test: Obtener el feed item específico
    const itemResponse = await axios.get(`${BASE_URL}/feed/${feedId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    console.log('✅ Feed item encontrado:');
    console.log('   - ID:', itemResponse.data.id);
    console.log('   - Título:', itemResponse.data.titulo?.substring(0, 50) + '...');
    console.log('   - Tipo:', itemResponse.data.type);
    console.log('   - Likes actuales:', itemResponse.data.likes_count);
    
    return itemResponse.data;
  } catch (error) {
    console.log(`❌ Error obteniendo feed item ${feedId}:`, error.response?.status);
    if (error.response?.data) {
      console.log('   - Error:', error.response.data);
    }
    return null;
  }
}

async function testLikeEndpoint(feedId = 62) {
  console.log(`\n❤️ [LIKE TEST] Probando like en item ${feedId}...\n`);
  
  try {
    const likeResponse = await axios.post(
      `${BASE_URL}/feed/${feedId}/like`,
      {}, // Body vacío
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ ¡Like exitoso!');
    console.log('   - Status:', likeResponse.status);
    console.log('   - Response:', likeResponse.data);
    
    return likeResponse.data;
  } catch (error) {
    console.log('❌ Error en like:', error.message);
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - Data:', error.response.data);
      
      // Análisis específico del error
      if (error.response.status === 500) {
        console.log('\n🔍 ANÁLISIS: Error 500 - Internal Server Error');
        console.log('   • El endpoint existe pero falló internamente');
        console.log('   • Posibles causas:');
        console.log('     - Error de base de datos');
        console.log('     - Bug en el código del endpoint');
        console.log('     - Problema de permisos');
        console.log('   • Revisar logs del backend para más detalles');
      }
    }
    
    return null;
  }
}

async function testAlternativeEndpoints(feedId = 62) {
  console.log('\n🔄 [ALTERNATIVES] Probando endpoints alternativos...\n');
  
  const alternatives = [
    `/feed/${feedId}/likes`,
    `/likes/${feedId}`,
    `/posts/${feedId}/like`,
    `/news/${feedId}/like`,
    `/com/${feedId}/like`
  ];
  
  for (const endpoint of alternatives) {
    try {
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
      
      console.log(`✅ ${endpoint}: Status ${response.status}`);
      console.log(`   Response:`, response.data);
    } catch (error) {
      const status = error.response?.status || 'Network Error';
      if (status === 404) {
        console.log(`➖ ${endpoint}: No existe (404)`);
      } else if (status === 500) {
        console.log(`❌ ${endpoint}: Error interno (500)`);
      } else {
        console.log(`❌ ${endpoint}: Error ${status}`);
      }
    }
  }
}

async function runCompleteDiagnostic() {
  console.log('🚀 DIAGNÓSTICO COMPLETO DEL BACKEND DE LIKES\n');
  console.log('=' .repeat(50));
  
  if (!TOKEN || TOKEN === 'your-token-here') {
    console.log('❌ Token no configurado');
    console.log('Uso: TEST_TOKEN="tu-token" node test-like-advanced.js');
    return;
  }
  
  // Ejecutar todos los tests
  await testBackendHealth();
  const user = await testUserInfo();
  const feedItem = await testFeedItem(62);
  const likeResult = await testLikeEndpoint(62);
  
  if (!likeResult) {
    await testAlternativeEndpoints(62);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 RESUMEN DEL DIAGNÓSTICO\n');
  
  if (user) {
    console.log(`✅ Usuario: ${user.nombre} (${user.role})`);
  } else {
    console.log('❌ Problema de autenticación');
  }
  
  if (feedItem) {
    console.log(`✅ Feed item 62 existe: "${feedItem.titulo?.substring(0, 30)}..."`);
  } else {
    console.log('❌ Feed item 62 no encontrado');
  }
  
  if (likeResult) {
    console.log('✅ Like funciona correctamente');
  } else {
    console.log('❌ Like falló - revisar logs del backend');
  }
  
  console.log('\n🔍 PRÓXIMO PASO:');
  console.log('Si el like falló, comparte los logs del backend cuando ejecutes este script');
}

runCompleteDiagnostic().catch(console.error); 