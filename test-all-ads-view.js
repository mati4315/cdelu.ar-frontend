// 👁️ Script de Prueba - Ver Todas las Publicidades
// Archivo: test-all-ads-view.js

/**
 * Función para probar la vista de todas las publicidades
 */
function testAllAdsView() {
  console.log('👁️ Probando vista de todas las publicidades...\n');
  
  const testUrl = 'http://localhost:5174/publicidad';
  
  console.log('📋 URL de prueba:');
  console.log(`  - ${testUrl}`);
  
  console.log('\n🎯 Funcionalidades implementadas:');
  console.log('✅ Botón "Ver Todas las Publicidades"');
  console.log('✅ Modal con lista completa de anuncios');
  console.log('✅ Ordenamiento por fecha (más nuevos primero)');
  console.log('✅ Información completa de cada anuncio');
  console.log('✅ Estados activo/inactivo');
  console.log('✅ Estadísticas de impresiones y clics');
  console.log('✅ Enlaces directos a los anuncios');
  console.log('✅ Diseño responsive');
  
  console.log('\n💡 Para probar:');
  console.log('1. Ve a http://localhost:5174/publicidad');
  console.log('2. Busca el botón "👁️ Ver Todas las Publicidades"');
  console.log('3. Haz clic en el botón');
  console.log('4. Verifica que se abra el modal con todas las publicidades');
  console.log('5. Revisa que los anuncios estén ordenados por fecha');
  console.log('6. Prueba los enlaces directos a los anuncios');
  
  console.log('\n🔧 Características del modal:');
  console.log('- Lista completa de anuncios');
  console.log('- Ordenamiento cronológico');
  console.log('- Información detallada de cada anuncio');
  console.log('- Estados visuales (activo/inactivo)');
  console.log('- Estadísticas en tiempo real');
  console.log('- Enlaces directos');
  console.log('- Diseño atractivo y profesional');
  
  // Abrir la URL automáticamente
  try {
    window.open(testUrl, '_blank');
    console.log('\n✅ URL abierta automáticamente');
  } catch (error) {
    console.log('\n📋 Copia y pega esta URL:');
    console.log(testUrl);
  }
}

/**
 * Función para verificar el estado de la API de anuncios
 */
async function checkAdsAPI() {
  try {
    console.log('🔍 Verificando API de anuncios...');
    
    const response = await fetch('http://localhost:3001/api/v1/ads?limit=10');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API de anuncios funcionando');
      console.log(`📊 Anuncios disponibles: ${data.data?.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        console.log('📋 Anuncios:');
        data.data.forEach(ad => {
          console.log(`  - ${ad.titulo} (ID: ${ad.id}) - ${ad.activo ? 'Activo' : 'Inactivo'}`);
        });
      }
    } else {
      console.log('❌ API de anuncios no responde');
    }
  } catch (error) {
    console.log('❌ Error verificando API:', error.message);
  }
}

/**
 * Función para mostrar información de la nueva funcionalidad
 */
function showAllAdsInfo() {
  console.log(`
👁️ VISTA DE TODAS LAS PUBLICIDADES - FUNCIONALIDAD IMPLEMENTADA
===============================================================

📋 Características Implementadas:
1. ✅ Botón "Ver Todas las Publicidades" en el dashboard
2. ✅ Modal con lista completa de anuncios
3. ✅ Ordenamiento por fecha de creación (más nuevos primero)
4. ✅ Información completa de cada anuncio
5. ✅ Estados visuales (activo/inactivo)
6. ✅ Estadísticas de impresiones y clics
7. ✅ Enlaces directos a los anuncios
8. ✅ Diseño responsive y atractivo
9. ✅ Carga automática de datos
10. ✅ Estados de loading y error

🔧 Funcionalidades del Modal:
- 📊 Lista completa de anuncios
- 📅 Ordenamiento cronológico
- 🎯 Información detallada de cada anuncio
- ✅ Estados visuales (activo/inactivo)
- 📈 Estadísticas en tiempo real
- 🔗 Enlaces directos a anuncios
- 🎨 Diseño moderno y profesional

🧪 Para probar:
1. testAllAdsView() - Prueba completa
2. checkAdsAPI() - Verificar API

📱 URLs importantes:
- Dashboard: http://localhost:5174/publicidad
- API de anuncios: http://localhost:3001/api/v1/ads

💡 La vista muestra todas las publicidades tal como las vería el usuario final
  `);
}

// Exportar funciones
window.testAllAdsView = testAllAdsView;
window.checkAdsAPI = checkAdsAPI;
window.showAllAdsInfo = showAllAdsInfo;

// Mostrar información
showAllAdsInfo();

console.log('👁️ Script de vista de todas las publicidades cargado');
console.log('💡 Usa testAllAdsView() para probar la funcionalidad completa'); 