// 🎰 Script Simplificado - Anuncios de Lotería
// Archivo: test-lottery-ad-simple.js

/**
 * Función para crear un anuncio de lotería básico
 */
async function createBasicLotteryAd() {
  try {
    console.log('🎰 Creando anuncio básico de lotería...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return;
    }

    const lotteryAdData = {
      titulo: '🎰 Lotería Especial',
      descripcion: 'Anuncio dinámico de lotería que se actualiza automáticamente con loterías activas',
      enlace_destino: '/lotteries',
      texto_opcional: 'Anuncio especial con prioridad 3 - Solo se muestra si hay loterías activas',
      categoria: 'eventos',
      prioridad: 3,
      activo: true,
      impresiones_maximas: 0
    };

    const response = await fetch('http://localhost:3001/api/v1/ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(lotteryAdData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Anuncio de lotería creado exitosamente:', result);
      return result.data;
    } else {
      const error = await response.text();
      console.error('❌ Error creando anuncio de lotería:', error);
      console.log('📋 Datos enviados:', lotteryAdData);
    }
  } catch (error) {
    console.error('❌ Error en createBasicLotteryAd:', error);
  }
}

/**
 * Función para verificar la estructura del backend
 */
async function checkBackendStructure() {
  try {
    console.log('🔍 Verificando estructura del backend...');
    
    // Verificar endpoint de anuncios
    const adsResponse = await fetch('http://localhost:3001/api/v1/ads');
    console.log('📊 Endpoint de anuncios:', adsResponse.status);
    
    if (adsResponse.ok) {
      const adsData = await adsResponse.json();
      console.log('📋 Estructura de anuncios:', adsData);
    }
    
    // Verificar endpoint de loterías
    const lotteryResponse = await fetch('http://localhost:3001/api/v1/lotteries');
    console.log('📊 Endpoint de loterías:', lotteryResponse.status);
    
    if (lotteryResponse.ok) {
      const lotteryData = await lotteryResponse.json();
      console.log('📋 Estructura de loterías:', lotteryData);
    }
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  }
}

/**
 * Función para simular anuncio de lotería en el frontend
 */
function simulateLotteryAd() {
  console.log('🎲 Simulando anuncio de lotería en el frontend...');
  
  // Crear anuncio simulado
  const simulatedAd = {
    id: -1,
    titulo: '🎰 Lotería de Prueba',
    descripcion: '¡Participa en nuestra lotería y gana premios increíbles!',
    image_url: 'https://via.placeholder.com/400x200/FFD700/000000?text=Lotería',
    enlace_destino: '/lotteries',
    texto_opcional: '¡Participación gratuita!',
    categoria: 'eventos',
    prioridad: 3,
    activo: true,
    impresiones_maximas: 0,
    impresiones_actuales: 0,
    clics_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    datos_especiales: {
      lottery_id: 1,
      lottery_title: 'Lotería de Prueba',
      lottery_description: 'Lotería de prueba para testing',
      lottery_image: 'https://via.placeholder.com/400x200/FFD700/000000?text=Lotería',
      is_free: true,
      ticket_price: 0,
      tickets_sold: 25,
      max_tickets: 100,
      num_winners: 3,
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      status: 'active',
      user_participated: false,
      user_ticket_numbers: []
    }
  };
  
  console.log('✅ Anuncio simulado creado:', simulatedAd);
  return simulatedAd;
}

/**
 * Función para probar la detección de anuncios de lotería
 */
function testLotteryAdDetection() {
  console.log('🧪 Probando detección de anuncios de lotería...');
  
  const testAds = [
    {
      titulo: '🎰 Lotería Especial',
      categoria: 'eventos',
      prioridad: 3
    },
    {
      titulo: 'Anuncio Normal',
      categoria: 'general',
      prioridad: 5
    },
    {
      titulo: 'Lotería de Prueba',
      categoria: 'eventos',
      prioridad: 3
    }
  ];
  
  testAds.forEach((ad, index) => {
    const isLottery = ad.titulo.includes('🎰') || 
                     ad.titulo.includes('Lotería') || 
                     (ad.categoria === 'eventos' && ad.prioridad === 3);
    
    console.log(`Anuncio ${index + 1}: "${ad.titulo}" - Es lotería: ${isLottery}`);
  });
}

/**
 * Función para mostrar información del sistema
 */
function showSystemInfo() {
  console.log(`
🎰 SISTEMA DE ANUNCIOS DE LOTERÍA - VERSIÓN SIMPLIFICADA
==========================================================

📋 Cambios realizados:
- ✅ Removido campo 'tipo_especial' para compatibilidad con backend
- ✅ Detección automática basada en título y prioridad
- ✅ Anuncios con 🎰 o "Lotería" en el título se detectan como lotería
- ✅ Prioridad 3 + categoría 'eventos' = anuncio de lotería

🔧 Funcionalidades:
1. Crear anuncio básico: createBasicLotteryAd()
2. Verificar backend: checkBackendStructure()
3. Simular anuncio: simulateLotteryAd()
4. Probar detección: testLotteryAdDetection()

📱 URLs importantes:
- Dashboard: http://localhost:5173/publicidad
- Feed: http://localhost:5173/

🧪 Para probar:
1. Ejecutar: createBasicLotteryAd()
2. Verificar en: http://localhost:5173/publicidad
3. Crear anuncio especial de lotería
4. Verificar que aparece en el feed con prioridad 3
  `);
}

// Exportar funciones para uso en consola
window.createBasicLotteryAd = createBasicLotteryAd;
window.checkBackendStructure = checkBackendStructure;
window.simulateLotteryAd = simulateLotteryAd;
window.testLotteryAdDetection = testLotteryAdDetection;
window.showSystemInfo = showSystemInfo;

// Mostrar información al cargar
showSystemInfo();

console.log('🎰 Script simplificado de anuncios de lotería cargado');
console.log('💡 Usa createBasicLotteryAd() para crear un anuncio de lotería'); 