// 🎰 Script de Prueba - Anuncio de Lotería Dinámico
// Archivo: test-lottery-ad.js

const API_BASE_URL = 'http://localhost:3001/api/v1';

/**
 * Función para crear un anuncio especial de lotería
 */
async function createLotteryAd() {
  try {
    console.log('🎰 Creando anuncio especial de lotería...');
    
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
      impresiones_maximas: 0,
      tipo_especial: 'lottery_dynamic'
    };

    const response = await fetch(`${API_BASE_URL}/ads`, {
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
    }
  } catch (error) {
    console.error('❌ Error en createLotteryAd:', error);
  }
}

/**
 * Función para verificar loterías activas
 */
async function checkActiveLotteries() {
  try {
    console.log('🔍 Verificando loterías activas...');
    
    const response = await fetch(`${API_BASE_URL}/lotteries?status=active`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Loterías activas encontradas:', result.data.length);
      result.data.forEach(lottery => {
        console.log(`  - ${lottery.title} (ID: ${lottery.id}) - Tickets: ${lottery.tickets_sold}/${lottery.max_tickets}`);
      });
      return result.data;
    } else {
      console.error('❌ Error verificando loterías activas');
    }
  } catch (error) {
    console.error('❌ Error en checkActiveLotteries:', error);
  }
}

/**
 * Función para simular la generación de anuncio dinámico
 */
async function simulateDynamicLotteryAd() {
  try {
    console.log('🎲 Simulando generación de anuncio dinámico...');
    
    // Obtener loterías activas
    const activeLotteries = await checkActiveLotteries();
    
    if (!activeLotteries || activeLotteries.length === 0) {
      console.log('⚠️ No hay loterías activas para generar anuncio dinámico');
      return null;
    }

    // Seleccionar lotería aleatoria
    const randomIndex = Math.floor(Math.random() * activeLotteries.length);
    const selectedLottery = activeLotteries[randomIndex];
    
    console.log(`🎯 Lotería seleccionada: ${selectedLottery.title}`);
    
    // Simular datos de usuario (en producción esto vendría del backend)
    const userTickets = []; // Simular tickets del usuario
    
    // Crear anuncio dinámico
    const dynamicAd = {
      id: -1, // ID temporal
      titulo: `🎰 ${selectedLottery.title}`,
      descripcion: selectedLottery.description || '¡Participa en nuestra lotería y gana premios increíbles!',
      image_url: selectedLottery.image_url,
      enlace_destino: `/lotteries/${selectedLottery.id}`,
      texto_opcional: selectedLottery.is_free 
        ? '¡Participación gratuita!' 
        : `Precio: $${selectedLottery.ticket_price}`,
      categoria: 'eventos',
      prioridad: 3,
      activo: true,
      impresiones_maximas: 0,
      impresiones_actuales: 0,
      clics_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tipo_especial: 'lottery_dynamic',
      datos_especiales: {
        lottery_id: selectedLottery.id,
        lottery_title: selectedLottery.title,
        lottery_description: selectedLottery.description,
        lottery_image: selectedLottery.image_url,
        is_free: selectedLottery.is_free,
        ticket_price: selectedLottery.ticket_price,
        tickets_sold: selectedLottery.tickets_sold || 0,
        max_tickets: selectedLottery.max_tickets,
        num_winners: selectedLottery.num_winners,
        end_date: selectedLottery.end_date,
        status: selectedLottery.status,
        user_participated: false, // Simular que no participó
        user_ticket_numbers: []
      }
    };
    
    console.log('✅ Anuncio dinámico generado:', dynamicAd);
    return dynamicAd;
  } catch (error) {
    console.error('❌ Error en simulateDynamicLotteryAd:', error);
  }
}

/**
 * Función para probar el sistema completo
 */
async function testLotteryAdSystem() {
  console.log('🚀 Iniciando prueba del sistema de anuncios de lotería...');
  
  // 1. Verificar loterías activas
  const activeLotteries = await checkActiveLotteries();
  
  if (!activeLotteries || activeLotteries.length === 0) {
    console.log('⚠️ No hay loterías activas. Creando una lotería de prueba...');
    // Aquí podrías crear una lotería de prueba si es necesario
  }
  
  // 2. Simular anuncio dinámico
  const dynamicAd = await simulateDynamicLotteryAd();
  
  // 3. Crear anuncio especial en la base de datos
  if (dynamicAd) {
    await createLotteryAd();
  }
  
  console.log('✅ Prueba del sistema completada');
}

/**
 * Función para mostrar información del sistema
 */
function showSystemInfo() {
  console.log(`
🎰 SISTEMA DE ANUNCIOS DE LOTERÍA DINÁMICO
============================================

📋 Características:
- ✅ Prioridad 3 (alta prioridad)
- 🎯 Dinámico (selecciona loterías activas aleatoriamente)
- 👤 Personalizado (muestra estado de participación del usuario)
- 🎰 Botón inteligente ("Participar" o "Ver mi número")
- 📊 Estadísticas en tiempo real
- 🔄 Se actualiza automáticamente

🔧 Funcionalidades:
1. Solo se muestra si hay loterías activas
2. Selecciona una lotería aleatoria de las activas
3. Verifica si el usuario participó en esa lotería
4. Muestra botón "Participar" o "Ver mi número" según el caso
5. Incluye estadísticas de la lotería (tickets vendidos, precio, etc.)

📱 URLs importantes:
- Dashboard de publicidad: http://localhost:5173/publicidad
- API de loterías: http://localhost:3001/api/v1/lotteries
- API de anuncios: http://localhost:3001/api/v1/ads

🧪 Para probar:
1. Ejecutar: testLotteryAdSystem()
2. Verificar en: http://localhost:5173/publicidad
3. Crear anuncio especial de lotería
4. Verificar que aparece en el feed con prioridad 3
  `);
}

// Exportar funciones para uso en consola
window.testLotteryAdSystem = testLotteryAdSystem;
window.createLotteryAd = createLotteryAd;
window.checkActiveLotteries = checkActiveLotteries;
window.simulateDynamicLotteryAd = simulateDynamicLotteryAd;
window.showSystemInfo = showSystemInfo;

// Mostrar información al cargar
showSystemInfo();

console.log('🎰 Script de prueba de anuncios de lotería cargado');
console.log('💡 Usa testLotteryAdSystem() para probar el sistema completo'); 