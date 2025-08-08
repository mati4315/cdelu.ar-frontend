// Script simple para verificar estados de encuesta
console.log('🔍 Verificando estados de encuesta...');

function checkSurveyState() {
  const surveyContainer = document.querySelector('.survey-container');
  
  if (!surveyContainer) {
    console.log('❌ No se encontró encuesta');
    return;
  }
  
  const votingOptions = surveyContainer.querySelectorAll('.voting-option');
  const results = surveyContainer.querySelectorAll('.option-result');
  const refreshButton = surveyContainer.querySelector('.refresh-results-btn');
  
  console.log('📊 Estado actual:');
  console.log(`  - Opciones de votación: ${votingOptions.length}`);
  console.log(`  - Resultados mostrados: ${results.length}`);
  console.log(`  - Botón actualizar: ${refreshButton ? 'Visible' : 'No visible'}`);
  
  // Determinar estado
  if (votingOptions.length > 0) {
    console.log('✅ ESTADO 0: Usuario puede votar');
  } else if (results.length > 0) {
    console.log('✅ ESTADO 1: Usuario ya votó - mostrando resultados');
  } else {
    console.log('⚠️ Estado indeterminado');
  }
  
  // Verificar localStorage
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  console.log('📱 LocalStorage:', votedSurveys || 'Vacío');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  console.log('🔐 Autenticado:', !!token);
}

function testVote() {
  const firstOption = document.querySelector('.voting-option');
  if (firstOption) {
    console.log('🗳️ Simulando voto en primera opción...');
    firstOption.click();
  } else {
    console.log('❌ No hay opciones disponibles para votar');
  }
}

function resetLocalStorage() {
  localStorage.removeItem('userVotedSurveys');
  console.log('🧹 LocalStorage limpiado');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Ejecutar verificación
checkSurveyState();

// Exponer funciones
window.checkSurveyState = checkSurveyState;
window.testVote = testVote;
window.resetLocalStorage = resetLocalStorage;

console.log('\n🛠️ Funciones disponibles:');
console.log('• checkSurveyState() - Verificar estado actual');
console.log('• testVote() - Simular voto');
console.log('• resetLocalStorage() - Limpiar y recargar'); 