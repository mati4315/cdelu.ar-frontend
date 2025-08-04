// 🎰 Script de Prueba - Ruta de Lotería Detallada
// Archivo: test-lottery-route.js

/**
 * Función para probar la ruta de lotería detallada
 */
function testLotteryRoute() {
  console.log('🎰 Probando ruta de lotería detallada...\n');
  
  // URLs de prueba (actualizadas al puerto 5174)
  const testUrls = [
    'http://localhost:5174/lotteries/1',
    'http://localhost:5174/lotteries/36',
    'http://localhost:5174/lotteries/100'
  ];
  
  console.log('📋 URLs de prueba:');
  testUrls.forEach(url => {
    console.log(`  - ${url}`);
  });
  
  console.log('\n💡 Para probar:');
  console.log('1. Abre una de las URLs en el navegador');
  console.log('2. Verifica que se muestre la vista básica');
  console.log('3. Revisa la consola del navegador para errores');
  
  console.log('\n🔧 Si hay errores:');
  console.log('- Verifica que el servidor esté corriendo: npm run dev');
  console.log('- Verifica que el archivo LotteryDetailView.vue existe');
  console.log('- Revisa la consola del navegador para errores específicos');
}

/**
 * Función para verificar el estado del servidor
 */
async function checkServerStatus() {
  try {
    console.log('🔍 Verificando estado del servidor...');
    
    const response = await fetch('http://localhost:5174/');
    if (response.ok) {
      console.log('✅ Servidor de desarrollo funcionando en puerto 5174');
    } else {
      console.log('❌ Servidor de desarrollo no responde');
    }
  } catch (error) {
    console.log('❌ Error conectando al servidor:', error.message);
  }
}

/**
 * Función para mostrar información de debugging
 */
function showDebugInfo() {
  console.log(`
🎰 DEBUG - RUTA DE LOTERÍA DETALLADA
====================================

📋 Problemas Comunes:
1. ❌ Error 500: Archivo Vue no se compila
2. ❌ Error 404: Ruta no encontrada
3. ❌ Error de importación: Problema con el router
4. ❌ Error de WebSocket: Puerto incorrecto

🔧 Soluciones:
1. ✅ Verificar que LotteryDetailView.vue existe
2. ✅ Verificar sintaxis del archivo Vue
3. ✅ Reiniciar servidor de desarrollo
4. ✅ Limpiar caché del navegador
5. ✅ Usar puerto correcto (5174)

📱 URLs importantes:
- Servidor: http://localhost:5174
- Lotería 1: http://localhost:5174/lotteries/1
- Lotería 36: http://localhost:5174/lotteries/36

🧪 Para debuggear:
1. checkServerStatus() - Verificar servidor
2. testLotteryRoute() - Probar rutas
3. Revisar consola del navegador

💡 Si la versión mínima funciona, podemos expandirla
  `);
}

// Exportar funciones para uso en consola
window.testLotteryRoute = testLotteryRoute;
window.checkServerStatus = checkServerStatus;
window.showDebugInfo = showDebugInfo;

// Mostrar información al cargar
showDebugInfo();

console.log('🎰 Script de prueba de ruta cargado');
console.log('💡 Usa testLotteryRoute() para probar las rutas'); 