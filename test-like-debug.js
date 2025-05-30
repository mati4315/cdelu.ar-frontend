const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Token del usuario autenticado (cópialo del localStorage)
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWF0aWFzNDMxNUBnbWFpbC5jb20iLCJpYXQiOjE3NDg2MDc4NjEsImV4cCI6MTc0ODY5NDI2MX0.YpGRZ2fRXSb3lFO2CfpLdGpv8tYcmhRqWMa2bQY5c3s';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Interceptor para logging detallado
apiClient.interceptors.request.use(request => {
  console.log('\n🚀 REQUEST:', {
    method: request.method?.toUpperCase(),
    url: `${request.baseURL}${request.url}`,
    headers: request.headers,
    data: request.data
  });
  return request;
});

apiClient.interceptors.response.use(
  response => {
    console.log('✅ RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.log('❌ ERROR RESPONSE:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

async function testFeedEndpoints() {
  console.log('🧪 === TESTING FEED ENDPOINTS ===\n');

  // 1. Test feed general
  try {
    console.log('📋 1. Testing GET /feed');
    const feedResponse = await apiClient.get('/feed?page=1&limit=5');
    
    if (feedResponse.data?.data?.length > 0) {
      const firstItem = feedResponse.data.data[0];
      console.log(`📝 Primer item del feed - ID: ${firstItem.id}, Original ID: ${firstItem.original_id}, Type: ${firstItem.type}`);
      
      // Test like en el primer item
      await testLikeToggle(firstItem.id, `Feed Item ${firstItem.id}`);
    }
  } catch (error) {
    console.log('❌ Error getting feed:', error.message);
  }

  // 2. Test endpoint específico by-original-id
  console.log('\n📋 2. Testing GET /feed/by-original-id');
  await testByOriginalId(1, 179);
  await testByOriginalId(1, 172);

  // 3. Test likes en items específicos que dieron error
  console.log('\n📋 3. Testing specific failed items');
  await testLikeToggle(58, 'Original ID 179 (NewsDetail)');
  await testLikeToggle(63, 'Feed Item 63');
  await testLikeToggle(51, 'Original ID 172');
}

async function testByOriginalId(type, originalId) {
  console.log(`\n🔍 Testing by-original-id: type=${type}, originalId=${originalId}`);
  
  try {
    const response = await apiClient.get(`/feed/by-original-id/${type}/${originalId}`);
    console.log(`✅ Endpoint específico funciona para ${originalId}`);
    return response.data;
  } catch (error) {
    console.log(`⚠️ Endpoint específico falló para ${originalId}: ${error.response?.status}`);
    
    // Fallback: buscar en feed general
    try {
      console.log('🔄 Probando fallback...');
      const fallbackResponse = await apiClient.get(`/feed?page=1&limit=100`);
      const found = fallbackResponse.data.data.find(item => 
        item.original_id == originalId && item.type == type
      );
      
      if (found) {
        console.log(`✅ Fallback encontró: feed_id=${found.id} para original_id=${originalId}`);
        return found;
      } else {
        console.log(`❌ Fallback NO encontró original_id=${originalId}`);
      }
    } catch (fallbackError) {
      console.log(`❌ Fallback también falló: ${fallbackError.message}`);
    }
  }
  return null;
}

async function testLikeToggle(feedId, description) {
  console.log(`\n❤️ Testing like toggle for ${description} (feed_id: ${feedId})`);
  
  // Estado inicial
  try {
    const initialResponse = await apiClient.get(`/feed/${feedId}`);
    console.log(`📊 Estado inicial - likes: ${initialResponse.data?.likes_count || 'undefined'}`);
  } catch (error) {
    console.log(`⚠️ No se pudo obtener estado inicial: ${error.message}`);
  }

  // Primer like (agregar)
  try {
    console.log(`👆 Primer click (agregar like) - feed_id: ${feedId}`);
    const likeResponse = await apiClient.post(`/feed/${feedId}/like`);
    console.log(`✅ Primer like exitoso:`, likeResponse.data);
    
    // Pequeña pausa
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Segundo like (quitar)
    console.log(`👆 Segundo click (quitar like) - feed_id: ${feedId}`);
    const unlikeResponse = await apiClient.post(`/feed/${feedId}/like`);
    console.log(`✅ Segundo like exitoso:`, unlikeResponse.data);
    
  } catch (error) {
    console.log(`❌ Error en like toggle:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

async function testDatabaseConsistency() {
  console.log('\n🗄️ === TESTING DATABASE CONSISTENCY ===\n');
  
  try {
    // Get feed items
    const feedResponse = await apiClient.get('/feed?page=1&limit=10');
    console.log(`📊 Total items en feed: ${feedResponse.data?.data?.length || 0}`);
    
    // Analizar estructura de respuesta
    if (feedResponse.data?.data?.length > 0) {
      const item = feedResponse.data.data[0];
      console.log('📝 Estructura de item del feed:');
      console.log({
        id: item.id,
        titulo: item.titulo?.substring(0, 50) + '...',
        type: item.type,
        original_id: item.original_id,
        likes_count: item.likes_count,
        user_has_liked: item.user_has_liked,
        published_at: item.published_at
      });
    }
    
    // Test stats
    const statsResponse = await apiClient.get('/feed/stats');
    console.log('📊 Feed stats:', statsResponse.data);
    
  } catch (error) {
    console.log('❌ Error en consistency test:', error.message);
  }
}

async function main() {
  console.log('🚀 INICIANDO DEBUGGING AVANZADO DE LIKES\n');
  console.log(`🔑 Token: ${TOKEN.substring(0, 20)}...`);
  
  await testFeedEndpoints();
  await testDatabaseConsistency();
  
  console.log('\n✅ === DEBUGGING COMPLETADO ===');
}

// Ejecutar
main().catch(console.error); 