// Script de prueba para verificar la funcionalidad de actualización de encuestas
// Ejecutar en la consola del navegador cuando estés en la página con encuestas

console.log('🔍 Probando funcionalidad de actualización de encuestas...');

// Función para simular un clic en el botón de actualización
function testRefreshButton() {
  const refreshButton = document.querySelector('.refresh-results-btn');
  
  if (refreshButton) {
    console.log('✅ Botón de actualización encontrado');
    console.log('🔄 Simulando clic en el botón...');
    refreshButton.click();
    
    // Observar cambios en el estado
    setTimeout(() => {
      const isRefreshing = refreshButton.disabled;
      console.log(`📊 Estado del botón: ${isRefreshing ? 'Actualizando...' : 'Listo'}`);
    }, 100);
    
    // Verificar después de 3 segundos
    setTimeout(() => {
      console.log('✅ Prueba de actualización completada');
    }, 3000);
    
  } else {
    console.log('❌ Botón de actualización no encontrado');
    console.log('💡 Asegúrate de que hay una encuesta visible y que ya has votado');
  }
}

// Función para verificar la funcionalidad de visibility change
function testVisibilityChange() {
  console.log('🔍 Probando actualización al cambiar visibilidad...');
  console.log('📝 Instrucciones:');
  console.log('   1. Cambia a otra pestaña o minimiza la ventana por más de 30 segundos');
  console.log('   2. Regresa a esta pestaña');
  console.log('   3. Observa la consola para ver si se activó la actualización automática');
  
  // Agregar listener temporal para ver si funciona
  const originalHandler = document.onvisibilitychange;
  let testCounter = 0;
  
  document.onvisibilitychange = function() {
    testCounter++;
    console.log(`👁️ Visibility change detectado (${testCounter})`);
    console.log(`📊 Estado: ${document.hidden ? 'Oculto' : 'Visible'}`);
    
    if (originalHandler) {
      originalHandler.call(this);
    }
  };
  
  // Restaurar después de 2 minutos
  setTimeout(() => {
    document.onvisibilitychange = originalHandler;
    console.log('🔄 Handler de visibility change restaurado');
  }, 120000);
}

// Función para verificar el estado actual de las encuestas
function checkSurveyState() {
  console.log('📊 Verificando estado actual de encuestas...');
  
  const surveyContainer = document.querySelector('.survey-container');
  if (surveyContainer) {
    console.log('✅ Contenedor de encuesta encontrado');
    
    const votingOptions = surveyContainer.querySelectorAll('.voting-option');
    const results = surveyContainer.querySelectorAll('.option-result');
    const refreshButton = surveyContainer.querySelector('.refresh-results-btn');
    const thanksMessage = surveyContainer.querySelector('.thanks-message');
    
    console.log(`📊 Opciones de votación: ${votingOptions.length}`);
    console.log(`📊 Resultados mostrados: ${results.length}`);
    console.log(`📊 Botón de actualización: ${refreshButton ? 'Visible' : 'No visible'}`);
    console.log(`📊 Mensaje de agradecimiento: ${thanksMessage ? 'Visible' : 'No visible'}`);
    
    if (refreshButton) {
      console.log('✅ El usuario ya ha votado - botón de actualización disponible');
    } else if (votingOptions.length > 0) {
      console.log('ℹ️ El usuario aún no ha votado - opciones de votación visibles');
    }
    
  } else {
    console.log('❌ No se encontró contenedor de encuesta');
    console.log('💡 Verifica que estés en la página principal con encuestas activas');
  }
}

// Ejecutar verificaciones
console.log('🚀 Iniciando pruebas...');
checkSurveyState();

console.log('\n📋 Funciones disponibles:');
console.log('• testRefreshButton() - Probar botón de actualización');
console.log('• testVisibilityChange() - Probar actualización automática');
console.log('• checkSurveyState() - Verificar estado actual');

// Auto-ejecutar prueba del botón si está disponible
setTimeout(() => {
  const refreshButton = document.querySelector('.refresh-results-btn');
  if (refreshButton) {
    console.log('\n🔄 Ejecutando prueba automática del botón...');
    testRefreshButton();
  }
}, 1000); 