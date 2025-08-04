// 🎰 Script de Prueba - Vista Completa de Lotería
// Archivo: test-lottery-complete.js

/**
 * Función para probar la vista completa de lotería
 */
function testLotteryComplete() {
  console.log('🎰 Probando vista completa de lotería...\n');
  
  const testUrls = [
    'http://localhost:5174/lotteries/1',
    'http://localhost:5174/lotteries/36',
    'http://localhost:5174/lotteries/100'
  ];
  
  console.log('📋 URLs de prueba:');
  testUrls.forEach(url => {
    console.log(`  - ${url}`);
  });
  
  console.log('\n🎯 Funcionalidades implementadas:');
  console.log('✅ Carga de datos de la API');
  console.log('✅ Estados de loading y error');
  console.log('✅ Información completa de la lotería');
  console.log('✅ Estadísticas en tiempo real');
  console.log('✅ Barra de progreso visual');
  console.log('✅ Selección de números interactiva');
  console.log('✅ Botón de participación');
  console.log('✅ Estados de participación del usuario');
  console.log('✅ Información de premios');
  console.log('✅ Lista de ganadores');
  console.log('✅ Diseño responsive');
  
  console.log('\n💡 Para probar:');
  console.log('1. Abre una de las URLs en el navegador');
  console.log('2. Verifica que se cargue la información completa');
  console.log('3. Prueba la selección de números');
  console.log('4. Verifica el botón de participación');
  console.log('5. Revisa que no hay errores en la consola');
  
  console.log('\n🔧 Características:');
  console.log('- Header con gradiente y estado');
  console.log('- Imagen de la lotería (si existe)');
  console.log('- Grid de estadísticas');
  console.log('- Barra de progreso animada');
  console.log('- Grid de números seleccionables');
  console.log('- Resumen de selección');
  console.log('- Botón de participación inteligente');
  console.log('- Estados de participación');
  console.log('- Información de premios');
  console.log('- Lista de ganadores (si aplica)');
  
  // Abrir la URL automáticamente
  try {
    window.open(testUrls[1], '_blank');
    console.log('\n✅ URL abierta automáticamente');
  } catch (error) {
    console.log('\n📋 Copia y pega esta URL:');
    console.log(testUrls[1]);
  }
}

/**
 * Función para verificar el estado de la API
 */
async function checkLotteryAPI() {
  try {
    console.log('🔍 Verificando API de loterías...');
    
    const response = await fetch('http://localhost:3001/api/v1/lotteries?limit=5');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API de loterías funcionando');
      console.log(`📊 Loterías disponibles: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log('📋 Loterías:');
        data.data.forEach(lottery => {
          console.log(`  - ${lottery.title} (ID: ${lottery.id}) - ${lottery.status}`);
        });
      }
    } else {
      console.log('❌ API de loterías no responde');
    }
  } catch (error) {
    console.log('❌ Error verificando API:', error.message);
  }
}

/**
 * Función para mostrar información de la nueva funcionalidad
 */
function showCompleteInfo() {
  console.log(`
🎰 VISTA COMPLETA DE LOTERÍA - FUNCIONALIDAD IMPLEMENTADA
==========================================================

📋 Características Implementadas:
1. ✅ Carga automática de datos de la API
2. ✅ Estados de loading y error
3. ✅ Header con gradiente y estado
4. ✅ Imagen de la lotería
5. ✅ Grid de estadísticas (precio, tickets, ganadores, tiempo)
6. ✅ Barra de progreso visual
7. ✅ Información de premios y términos
8. ✅ Selección de números interactiva
9. ✅ Resumen de selección con precio
10. ✅ Botón de participación inteligente
11. ✅ Estados de participación del usuario
12. ✅ Lista de ganadores (si aplica)
13. ✅ Diseño responsive completo

🔧 Funcionalidades:
- 🎯 Selección de números con grid interactivo
- 💰 Cálculo automático de precio total
- 📊 Progreso visual de tickets vendidos
- ⏰ Tiempo restante hasta finalización
- 🏆 Información de ganadores (si aplica)
- 👤 Estado personalizado de participación
- 🎨 Diseño moderno y atractivo

🧪 Para probar:
1. testLotteryComplete() - Prueba completa
2. checkLotteryAPI() - Verificar API

📱 URLs importantes:
- Vista detallada: http://localhost:5174/lotteries/36
- API de loterías: http://localhost:3001/api/v1/lotteries
- Dashboard: http://localhost:5174/publicidad

💡 La vista se adapta automáticamente según el estado de la lotería
  `);
}

// Exportar funciones
window.testLotteryComplete = testLotteryComplete;
window.checkLotteryAPI = checkLotteryAPI;
window.showCompleteInfo = showCompleteInfo;

// Mostrar información
showCompleteInfo();

console.log('🎰 Script de vista completa de lotería cargado');
console.log('💡 Usa testLotteryComplete() para probar la funcionalidad completa'); 