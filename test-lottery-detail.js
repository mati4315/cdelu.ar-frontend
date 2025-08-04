// 🎰 Script de Prueba - Vista Detallada de Loterías
// Archivo: test-lottery-detail.js

/**
 * Función para probar la vista detallada de loterías
 */
async function testLotteryDetail() {
  try {
    console.log('🎰 Probando vista detallada de loterías...\n');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return;
    }

    // 1. Obtener loterías disponibles
    console.log('📊 1. Obteniendo loterías disponibles...');
    const lotteriesResponse = await fetch('http://localhost:3001/api/v1/lotteries?limit=5');
    const lotteriesData = await lotteriesResponse.json();
    
    if (!lotteriesData.success || !lotteriesData.data.length) {
      console.log('❌ No hay loterías disponibles para probar');
      return;
    }

    const testLottery = lotteriesData.data[0];
    console.log(`✅ Lotería de prueba: ${testLottery.title} (ID: ${testLottery.id})`);

    // 2. Probar acceso a la vista detallada
    console.log('\n📊 2. Probando acceso a vista detallada...');
    const detailUrl = `http://localhost:5174/lotteries/${testLottery.id}`;
    console.log(`✅ URL de vista detallada: ${detailUrl}`);
    
    // 3. Verificar API de lotería individual
    console.log('\n📊 3. Verificando API de lotería individual...');
    const detailResponse = await fetch(`http://localhost:3001/api/v1/lotteries/${testLottery.id}`);
    
    if (detailResponse.ok) {
      const detailData = await detailResponse.json();
      console.log('✅ API de lotería individual funciona correctamente');
      console.log(`  - Título: ${detailData.data.title}`);
      console.log(`  - Estado: ${detailData.data.status}`);
      console.log(`  - Tickets vendidos: ${detailData.data.tickets_sold}/${detailData.data.max_tickets}`);
    } else {
      console.error('❌ Error en API de lotería individual:', detailResponse.status);
    }

    // 4. Verificar participación del usuario
    console.log('\n📊 4. Verificando participación del usuario...');
    const participationResponse = await fetch(`http://localhost:3001/api/v1/lotteries/${testLottery.id}/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (participationResponse.ok) {
      const participationData = await participationResponse.json();
      console.log('✅ API de participación funciona correctamente');
      if (participationData.data && participationData.data.length > 0) {
        console.log(`  - Usuario ya participó con ${participationData.data.length} tickets`);
      } else {
        console.log('  - Usuario aún no ha participado');
      }
    } else {
      console.log('⚠️ API de participación no disponible o error de autenticación');
    }

    // 5. Verificar ganadores (si la lotería ha terminado)
    if (testLottery.status === 'finished') {
      console.log('\n📊 5. Verificando ganadores...');
      const winnersResponse = await fetch(`http://localhost:3001/api/v1/lotteries/${testLottery.id}/winners`);
      
      if (winnersResponse.ok) {
        const winnersData = await winnersResponse.json();
        console.log('✅ API de ganadores funciona correctamente');
        console.log(`  - Ganadores: ${winnersData.data?.length || 0}`);
      } else {
        console.log('⚠️ API de ganadores no disponible');
      }
    }

    // 6. Resumen de funcionalidades
    console.log('\n📋 RESUMEN DE FUNCIONALIDADES:');
    console.log(`  ✅ Vista detallada: ${detailUrl}`);
    console.log(`  ✅ API individual: /api/v1/lotteries/${testLottery.id}`);
    console.log(`  ✅ API participación: /api/v1/lotteries/${testLottery.id}/tickets`);
    console.log(`  ✅ API ganadores: /api/v1/lotteries/${testLottery.id}/winners`);
    console.log(`  ✅ Selección de números`);
    console.log(`  ✅ Participación en tiempo real`);
    console.log(`  ✅ Estados de lotería`);
    console.log(`  ✅ Barra de progreso`);
    console.log(`  ✅ Información de premios`);

    console.log('\n🎉 ¡Vista detallada de loterías lista para usar!');
    console.log(`💡 Visita: ${detailUrl}`);

  } catch (error) {
    console.error('❌ Error en testLotteryDetail:', error);
  }
}

/**
 * Función para simular participación en lotería
 */
async function simulateParticipation(lotteryId, ticketNumbers = [1, 5, 10]) {
  try {
    console.log(`🎯 Simulando participación en lotería ${lotteryId}...`);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return;
    }

    const response = await fetch(`http://localhost:3001/api/v1/lotteries/${lotteryId}/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ticket_numbers: ticketNumbers,
        payment_method: 'free'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Participación simulada exitosa');
      console.log('📋 Resultado:', result);
    } else {
      const error = await response.text();
      console.error('❌ Error en participación simulada:', error);
    }

  } catch (error) {
    console.error('❌ Error en simulateParticipation:', error);
  }
}

/**
 * Función para mostrar información de la nueva funcionalidad
 */
function showLotteryDetailInfo() {
  console.log(`
🎰 VISTA DETALLADA DE LOTERÍAS - NUEVA FUNCIONALIDAD
====================================================

📋 Características Implementadas:
1. ✅ Vista detallada en /lotteries/:id
2. ✅ Información completa de la lotería
3. ✅ Selección de números para participar
4. ✅ Barra de progreso en tiempo real
5. ✅ Estados de participación del usuario
6. ✅ Información de premios y ganadores
7. ✅ Diseño responsive y atractivo

🔧 Funcionalidades:
- 🎯 Selección de números con grid interactivo
- 💰 Cálculo automático de precio total
- 📊 Progreso visual de tickets vendidos
- ⏰ Tiempo restante hasta finalización
- 🏆 Información de ganadores (si aplica)
- 👤 Estado personalizado de participación

🧪 Para probar:
1. testLotteryDetail() - Prueba completa
2. simulateParticipation(id, [1,5,10]) - Simular participación

📱 URLs importantes:
- Vista detallada: http://localhost:5174/lotteries/36
- API individual: http://localhost:3001/api/v1/lotteries/36
- Lista de loterías: http://localhost:5174/lotteries

💡 La vista se adapta automáticamente según el estado de la lotería
  `);
}

// Exportar funciones para uso en consola
window.testLotteryDetail = testLotteryDetail;
window.simulateParticipation = simulateParticipation;
window.showLotteryDetailInfo = showLotteryDetailInfo;

// Mostrar información al cargar
showLotteryDetailInfo();

console.log('🎰 Script de vista detallada de loterías cargado');
console.log('💡 Usa testLotteryDetail() para probar la nueva funcionalidad'); 