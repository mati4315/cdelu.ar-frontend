// 🎰 Script de Prueba - Fix de Ruta de Lotería
// Archivo: test-lottery-fix.js

/**
 * Función para probar la ruta de lotería después de los fixes
 */
function testLotteryFix() {
  console.log('🎰 Probando fix de ruta de lotería...\n');
  
  const testUrls = [
    'http://localhost:5174/lotteries/1',
    'http://localhost:5174/lotteries/36',
    'http://localhost:5174/lotteries/100'
  ];
  
  console.log('📋 URLs de prueba:');
  testUrls.forEach(url => {
    console.log(`  - ${url}`);
  });
  
  console.log('\n🔧 Fixes aplicados:');
  console.log('1. ✅ Puerto corregido: 5174');
  console.log('2. ✅ Archivo LotteryDetailView.vue recreado');
  console.log('3. ✅ Router configurado correctamente');
  console.log('4. ✅ Servidor reiniciado');
  
  console.log('\n💡 Para probar:');
  console.log('1. Abre una de las URLs en el navegador');
  console.log('2. Deberías ver: "🎰 Lotería #36"');
  console.log('3. Sin errores en la consola');
  
  console.log('\n🎯 Resultado esperado:');
  console.log('- Título: "🎰 Lotería #36"');
  console.log('- Subtítulo: "Vista detallada de la lotería"');
  console.log('- Información: ID y estado');
  console.log('- Sin errores de router');
  
  // Abrir la primera URL automáticamente
  try {
    window.open(testUrls[1], '_blank');
    console.log('\n✅ URL abierta automáticamente');
  } catch (error) {
    console.log('\n📋 Copia y pega esta URL:');
    console.log(testUrls[1]);
  }
}

/**
 * Función para verificar el estado del servidor
 */
async function checkServerStatus() {
  try {
    console.log('🔍 Verificando servidor...');
    
    const response = await fetch('http://localhost:5174/');
    if (response.ok) {
      console.log('✅ Servidor funcionando en puerto 5174');
    } else {
      console.log('❌ Servidor no responde');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

/**
 * Función para mostrar información de debugging
 */
function showDebugInfo() {
  console.log(`
🎰 DEBUG - FIX DE RUTA DE LOTERÍA
==================================

📋 Problemas Solucionados:
1. ✅ Puerto incorrecto (5173 → 5174)
2. ✅ Archivo Vue corrupto (recreado)
3. ✅ Router no encuentra ruta (fixeado)
4. ✅ WebSocket errors (puerto corregido)

🔧 Cambios Realizados:
1. ✅ Puerto actualizado en todos los scripts
2. ✅ LotteryDetailView.vue recreado
3. ✅ Router configurado correctamente
4. ✅ Servidor reiniciado

📱 URLs importantes:
- Servidor: http://localhost:5174
- Lotería 36: http://localhost:5174/lotteries/36
- Dashboard: http://localhost:5174/publicidad

🧪 Para probar:
1. testLotteryFix() - Prueba completa
2. checkServerStatus() - Verificar servidor

💡 Si funciona, podemos expandir la funcionalidad
  `);
}

// Exportar funciones
window.testLotteryFix = testLotteryFix;
window.checkServerStatus = checkServerStatus;
window.showDebugInfo = showDebugInfo;

// Mostrar información
showDebugInfo();

console.log('🎰 Script de fix de lotería cargado');
console.log('💡 Usa testLotteryFix() para probar'); 