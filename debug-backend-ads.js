// 🔍 Script de Debug - Backend Ads API
// Archivo: debug-backend-ads.js

/**
 * Función para verificar la estructura exacta que espera el backend
 */
async function debugBackendAds() {
  try {
    console.log('🔍 Debuggeando backend de anuncios...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return;
    }

    // 1. Verificar endpoint GET para ver la estructura
    console.log('📊 1. Verificando estructura GET /ads...');
    const getResponse = await fetch('http://localhost:3001/api/v1/ads', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('GET /ads Status:', getResponse.status);
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('GET /ads Response:', getData);
      
      // Verificar estructura de un anuncio existente
      if (getData.data && getData.data.length > 0) {
        console.log('📋 Estructura de anuncio existente:', getData.data[0]);
      }
    } else {
      const errorText = await getResponse.text();
      console.error('GET /ads Error:', errorText);
    }

    // 2. Probar con datos mínimos
    console.log('📊 2. Probando con datos mínimos...');
    const minimalData = {
      titulo: 'Test Anuncio',
      descripcion: 'Test descripción',
      enlace_destino: 'https://example.com',
      categoria: 'general',
      prioridad: 1,
      activo: true,
      impresiones_maximas: 0
    };

    const minimalResponse = await fetch('http://localhost:3001/api/v1/ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(minimalData)
    });

    console.log('POST /ads (mínimo) Status:', minimalResponse.status);
    if (minimalResponse.ok) {
      const minimalResult = await minimalResponse.json();
      console.log('✅ POST /ads (mínimo) Success:', minimalResult);
    } else {
      const errorText = await minimalResponse.text();
      console.error('❌ POST /ads (mínimo) Error:', errorText);
    }

    // 3. Probar con datos completos
    console.log('📊 3. Probando con datos completos...');
    const fullData = {
      titulo: '🎰 Lotería Especial',
      descripcion: 'Anuncio dinámico de lotería que se actualiza automáticamente con loterías activas',
      enlace_destino: '/lotteries',
      texto_opcional: 'Anuncio especial con prioridad 3 - Solo se muestra si hay loterías activas',
      categoria: 'eventos',
      prioridad: 3,
      activo: true,
      impresiones_maximas: 0
    };

    const fullResponse = await fetch('http://localhost:3001/api/v1/ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fullData)
    });

    console.log('POST /ads (completo) Status:', fullResponse.status);
    if (fullResponse.ok) {
      const fullResult = await fullResponse.json();
      console.log('✅ POST /ads (completo) Success:', fullResult);
    } else {
      const errorText = await fullResponse.text();
      console.error('❌ POST /ads (completo) Error:', errorText);
    }

    // 4. Verificar campos requeridos
    console.log('📊 4. Verificando campos requeridos...');
    const requiredFields = ['titulo', 'descripcion', 'enlace_destino', 'categoria', 'prioridad', 'activo', 'impresiones_maximas'];
    
    for (const field of requiredFields) {
      const testData = { ...fullData };
      delete testData[field];
      
      const testResponse = await fetch('http://localhost:3001/api/v1/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`Campo ${field} requerido:`, testResponse.status === 400 ? 'SÍ' : 'NO');
    }

  } catch (error) {
    console.error('❌ Error en debugBackendAds:', error);
  }
}

/**
 * Función para verificar la estructura de la base de datos
 */
async function checkDatabaseStructure() {
  try {
    console.log('🗄️ Verificando estructura de base de datos...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return;
    }

    // Verificar diferentes endpoints para entender la estructura
    const endpoints = [
      '/api/v1/ads',
      '/api/v1/ads/1',
      '/api/v1/ads/stats'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3001${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`${endpoint} Status:`, response.status);
        if (response.ok) {
          const data = await response.json();
          console.log(`${endpoint} Structure:`, Object.keys(data));
        }
      } catch (error) {
        console.error(`Error en ${endpoint}:`, error);
      }
    }

  } catch (error) {
    console.error('❌ Error en checkDatabaseStructure:', error);
  }
}

/**
 * Función para mostrar información del backend
 */
function showBackendInfo() {
  console.log(`
🔍 DEBUG BACKEND - ANUNCIOS API
================================

📋 Información del Backend:
- Base URL: http://localhost:3001/api/v1
- Endpoint: POST /ads
- Autenticación: Bearer Token

🔧 Campos que estamos enviando:
- titulo: string (requerido)
- descripcion: string (requerido)
- enlace_destino: string (requerido)
- texto_opcional: string (opcional)
- categoria: string (requerido)
- prioridad: number (requerido)
- activo: boolean (requerido)
- impresiones_maximas: number (requerido)

🧪 Para debuggear:
1. debugBackendAds() - Prueba completa del endpoint
2. checkDatabaseStructure() - Verifica estructura de BD

📱 URLs importantes:
- API Base: http://localhost:3001/api/v1
- Endpoint Ads: http://localhost:3001/api/v1/ads
- Dashboard: http://localhost:5173/publicidad

💡 Posibles problemas:
1. Campo faltante en la base de datos
2. Validación en el backend
3. Tipo de dato incorrecto
4. Campo requerido no enviado
  `);
}

// Exportar funciones para uso en consola
window.debugBackendAds = debugBackendAds;
window.checkDatabaseStructure = checkDatabaseStructure;
window.showBackendInfo = showBackendInfo;

// Mostrar información al cargar
showBackendInfo();

console.log('🔍 Script de debug de backend cargado');
console.log('💡 Usa debugBackendAds() para investigar el problema'); 