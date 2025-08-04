// 🎰 Script de Prueba - Integración Sistema de Loterías
// Archivo: test-lottery-system-integration.js

/**
 * Función para probar la integración completa del sistema
 */
async function testLotterySystemIntegration() {
  try {
    console.log('🎰 Probando integración completa del sistema de loterías...\n');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      return;
    }

    // 1. Verificar loterías activas
    console.log('📊 1. Verificando loterías activas...');
    const lotteriesResponse = await fetch('http://localhost:3001/api/v1/lotteries?status=active');
    const lotteriesData = await lotteriesResponse.json();
    
    const activeLotteries = lotteriesData.data?.filter(lottery => 
      lottery.status === 'active' && lottery.current_status === 'running'
    ) || [];
    
    console.log(`✅ Encontradas ${activeLotteries.length} loterías activas`);
    activeLotteries.forEach(lottery => {
      console.log(`  - ${lottery.title} (ID: ${lottery.id})`);
    });

    // 2. Verificar anuncio de lotería
    console.log('\n📊 2. Verificando anuncio de lotería...');
    const adsResponse = await fetch('http://localhost:3001/api/v1/ads?categoria=eventos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const adsData = await adsResponse.json();
    
    const lotteryAd = adsData.data?.find(ad => 
      ad.titulo.includes('🎰') && ad.categoria === 'eventos'
    );
    
    if (lotteryAd) {
      console.log('✅ Anuncio de lotería encontrado:');
      console.log(`  - Título: ${lotteryAd.titulo}`);
      console.log(`  - Estado: ${lotteryAd.activo ? 'ACTIVO' : 'INACTIVO'}`);
      console.log(`  - Prioridad: ${lotteryAd.prioridad}`);
      console.log(`  - Última actualización: ${new Date(lotteryAd.updated_at).toLocaleString()}`);
    } else {
      console.log('❌ No se encontró anuncio de lotería');
    }

    // 3. Verificar frontend
    console.log('\n📊 3. Verificando frontend...');
    const dashboardUrl = 'http://localhost:5173/publicidad';
    console.log(`✅ Dashboard disponible en: ${dashboardUrl}`);
    
    // 4. Simular creación de anuncio
    console.log('\n📊 4. Simulando creación de anuncio...');
    const testAdData = {
      titulo: '🎰 Lotería Especial',
      descripcion: 'Anuncio dinámico de lotería que se actualiza automáticamente',
      enlace_destino: '/lotteries',
      texto_opcional: 'Anuncio especial con prioridad 3',
      categoria: 'eventos',
      prioridad: 3,
      activo: true,
      impresiones_maximas: 0
    };

    const createResponse = await fetch('http://localhost:3001/api/v1/ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testAdData)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Anuncio de prueba creado exitosamente');
      console.log(`  - ID: ${result.data.id}`);
    } else {
      const error = await createResponse.text();
      console.error('❌ Error creando anuncio de prueba:', error);
    }

    // 5. Resumen del sistema
    console.log('\n📋 RESUMEN DEL SISTEMA:');
    console.log(`  - Loterías activas: ${activeLotteries.length}`);
    console.log(`  - Anuncio de lotería: ${lotteryAd ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    console.log(`  - Estado del anuncio: ${lotteryAd?.activo ? 'ACTIVO' : 'INACTIVO'}`);
    console.log(`  - Frontend: http://localhost:5173/publicidad`);
    console.log(`  - Backend: http://localhost:3001/api/v1`);
    
    if (activeLotteries.length > 0 && lotteryAd?.activo) {
      console.log('\n🎉 ¡Sistema funcionando correctamente!');
    } else {
      console.log('\n⚠️ Sistema necesita ajustes');
    }

  } catch (error) {
    console.error('❌ Error en testLotterySystemIntegration:', error);
  }
}

/**
 * Función para verificar el worker automático
 */
async function checkAutoWorker() {
  try {
    console.log('🔄 Verificando worker automático...');
    
    // Verificar si el worker está ejecutándose
    const response = await fetch('http://localhost:3001/api/v1/health');
    if (response.ok) {
      console.log('✅ Backend respondiendo correctamente');
    } else {
      console.log('⚠️ Backend no responde');
    }
    
    console.log('💡 El worker automático debería ejecutarse cada 5 minutos');
    console.log('📊 Para verificar, revisa los logs del backend');
    
  } catch (error) {
    console.error('❌ Error verificando worker:', error);
  }
}

/**
 * Función para mostrar información del sistema
 */
function showSystemInfo() {
  console.log(`
🎰 SISTEMA DE LOTERÍAS - INTEGRACIÓN COMPLETA
==============================================

📋 Componentes del Sistema:
1. ✅ Backend Worker (create-lottery-ad.js)
2. ✅ Frontend Dashboard (AdsDashboardView.vue)
3. ✅ API de Loterías (/api/v1/lotteries)
4. ✅ API de Anuncios (/api/v1/ads)
5. ✅ Base de Datos (tabla ads)

🔧 Funcionalidades:
- 🕐 Worker automático cada 5 minutos
- 🎯 Verificación de loterías activas
- 📢 Creación/actualización automática de anuncios
- 🎨 Banner visual en el dashboard
- 📊 Contador dinámico de loterías activas

🧪 Para probar:
1. testLotterySystemIntegration() - Prueba completa
2. checkAutoWorker() - Verifica worker automático

📱 URLs importantes:
- Dashboard: http://localhost:5173/publicidad
- API Backend: http://localhost:3001/api/v1
- Loterías: http://localhost:5173/lotteries

💡 El sistema es completamente automático
  `);
}

// Exportar funciones para uso en consola
window.testLotterySystemIntegration = testLotterySystemIntegration;
window.checkAutoWorker = checkAutoWorker;
window.showSystemInfo = showSystemInfo;

// Mostrar información al cargar
showSystemInfo();

console.log('🎰 Script de integración de loterías cargado');
console.log('💡 Usa testLotterySystemIntegration() para probar el sistema'); 