// 🎰 Prueba Rápida - Ruta de Lotería
// Archivo: quick-test-lottery.js

/**
 * Función para probar rápidamente la ruta de lotería
 */
function quickTestLottery() {
  console.log('🎰 Prueba rápida de ruta de lotería...\n');
  
  const testUrl = 'http://localhost:5174/lotteries/36';
  
  console.log('📋 Información:');
  console.log(`  - URL de prueba: ${testUrl}`);
  console.log(`  - Servidor: http://localhost:5174`);
  console.log(`  - Puerto correcto: 5174`);
  
  console.log('\n💡 Instrucciones:');
  console.log('1. Abre la URL en el navegador');
  console.log('2. Deberías ver: "Lotería 36" y "Vista detallada de la lotería"');
  console.log('3. Si funciona, podemos expandir la funcionalidad');
  
  console.log('\n🔧 Si hay errores:');
  console.log('- Verifica que el servidor esté corriendo');
  console.log('- Limpia el caché del navegador (Ctrl+F5)');
  console.log('- Revisa la consola del navegador');
  
  // Abrir la URL automáticamente si es posible
  try {
    window.open(testUrl, '_blank');
    console.log('\n✅ URL abierta automáticamente');
  } catch (error) {
    console.log('\n📋 Copia y pega esta URL en el navegador:');
    console.log(testUrl);
  }
}

// Exportar función
window.quickTestLottery = quickTestLottery;

console.log('🎰 Script de prueba rápida cargado');
console.log('💡 Usa quickTestLottery() para probar la ruta'); 