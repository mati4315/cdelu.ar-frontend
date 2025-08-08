// Script para probar usuarios no logueados (invitados)
console.log('🔍 Probando usuario NO LOGUEADO...');

function testGuestUser() {
  console.log('\n=== ESTADO ACTUAL ===');
  
  // 1. Verificar autenticación
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  console.log('🔐 Token:', token ? 'EXISTE' : 'NO EXISTE');
  console.log('👤 User:', user ? 'EXISTE' : 'NO EXISTE');
  
  if (token || user) {
    console.log('⚠️ PROBLEMA: Hay datos de usuario, no es un usuario invitado');
    console.log('💡 Para probar como invitado, ejecuta: clearUserData()');
    return;
  }
  
  // 2. Verificar localStorage de votos
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  console.log('📱 LocalStorage votos:', votedSurveys || 'VACÍO');
  
  // 3. Verificar DOM
  const surveyContainer = document.querySelector('.survey-container');
  if (!surveyContainer) {
    console.log('❌ No se encontró encuesta');
    return;
  }
  
  const votingOptions = surveyContainer.querySelectorAll('.voting-option');
  const results = surveyContainer.querySelectorAll('.option-result');
  
  console.log('\n=== ESTADO DE LA ENCUESTA ===');
  console.log('🗳️ Opciones para votar:', votingOptions.length);
  console.log('📊 Resultados mostrados:', results.length);
  
  // 4. Determinar problema
  if (votingOptions.length > 0) {
    console.log('✅ CORRECTO: Estado 0 - Usuario puede votar');
  } else if (results.length > 0) {
    console.log('❌ PROBLEMA: Estado 1 - Mostrando resultados a usuario invitado');
    console.log('🔧 Posibles causas:');
    console.log('   1. Backend envía datos incorrectos');
    console.log('   2. localStorage corrupto');
    console.log('   3. Lógica de frontend incorrecta');
  } else {
    console.log('⚠️ Estado indeterminado');
  }
}

function clearUserData() {
  console.log('🧹 Limpiando datos de usuario...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userVotedSurveys');
  console.log('✅ Limpieza completada');
  setTimeout(() => {
    console.log('🔄 Recargando página...');
    window.location.reload();
  }, 1000);
}

function forceGuestVoting() {
  console.log('🔧 Forzando estado de votación para invitado...');
  localStorage.removeItem('userVotedSurveys');
  
  // Intentar forzar re-render
  if (typeof clearSurveyVotes === 'function') {
    clearSurveyVotes();
  } else {
    window.location.reload();
  }
}

// Ejecutar test automáticamente
testGuestUser();

// Exponer funciones
window.testGuestUser = testGuestUser;
window.clearUserData = clearUserData;
window.forceGuestVoting = forceGuestVoting;

console.log('\n🛠️ Funciones disponibles:');
console.log('• testGuestUser() - Verificar estado actual');
console.log('• clearUserData() - Limpiar datos de usuario');
console.log('• forceGuestVoting() - Forzar estado de votación'); 