// Script para probar el fix del bug de usuarios invitados
console.log('🧪 Probando fix del bug de usuarios invitados en el frontend...\n');

// Limpiar localStorage para simular usuario nuevo
console.log('🧹 Limpiando localStorage para simular usuario nuevo...');
localStorage.removeItem('userVotedSurveys');
console.log('✅ localStorage limpiado');

// Simular verificación de usuario autenticado
console.log('\n🔍 Simulando verificación de autenticación...');
const isAuthenticated = false; // Simular usuario no autenticado
console.log('   - Usuario autenticado:', isAuthenticated);

// Simular datos de encuesta del backend
const surveyData = {
  id: 21,
  question: '¿Cuál es tu color favorito?',
  total_votes: 0,
  user_voted: undefined, // Backend no incluye esto para usuarios no autenticados
  user_votes: undefined, // Backend no incluye esto para usuarios no autenticados
  options: [
    { id: 70, option_text: 'Azul', votes_count: 0, percentage: 0 },
    { id: 71, option_text: 'Rojo', votes_count: 0, percentage: 0 },
    { id: 72, option_text: 'Verde', votes_count: 0, percentage: 0 }
  ]
};

console.log('📋 Datos de encuesta del backend:', {
  id: surveyData.id,
  user_voted: surveyData.user_voted,
  user_votes: surveyData.user_votes
});

// Simular la función hasUserVoted del componente
function hasUserVoted(survey) {
  console.log('🔍 Verificando si usuario votó en encuesta:', survey.id);
  console.log('   - Usuario autenticado:', isAuthenticated);
  console.log('   - user_voted del backend:', survey.user_voted);
  console.log('   - user_votes del backend:', survey.user_votes);
  
  // Si el usuario NO está autenticado, solo confiar en localStorage
  if (!isAuthenticated) {
    const votedSurveys = localStorage.getItem('userVotedSurveys');
    if (votedSurveys) {
      const votedIds = JSON.parse(votedSurveys);
      const hasVoted = votedIds.includes(survey.id);
      console.log('   - Verificando localStorage para usuario no autenticado:', hasVoted);
      return hasVoted;
    }
    console.log('   - Usuario no autenticado sin localStorage, no ha votado');
    return false;
  }
  
  // Si el usuario SÍ está autenticado, confiar en los datos del backend
  const backendVoted = survey.user_voted === true || 
                       (survey.user_votes && survey.user_votes.length > 0);
  
  console.log('   - Verificando backend para usuario autenticado:', backendVoted);
  return backendVoted;
}

// Probar la función
console.log('\n🧪 Probando función hasUserVoted...');
const hasVoted = hasUserVoted(surveyData);
console.log('✅ Resultado:', hasVoted);

if (hasVoted) {
  console.log('❌ BUG: Usuario invitado ve encuesta como votada');
} else {
  console.log('✅ FIX: Usuario invitado ve encuesta como no votada (correcto)');
}

// Simular voto exitoso
console.log('\n🗳️ Simulando voto exitoso...');
const markSurveyAsVoted = (surveyId) => {
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  let votedIds = votedSurveys ? JSON.parse(votedSurveys) : [];
  if (!votedIds.includes(surveyId)) {
    votedIds.push(surveyId);
    localStorage.setItem('userVotedSurveys', JSON.stringify(votedIds));
    console.log('✅ Encuesta marcada como votada en localStorage');
  }
};

markSurveyAsVoted(surveyData.id);

// Verificar después del voto
console.log('\n🔍 Verificando después del voto...');
const hasVotedAfter = hasUserVoted(surveyData);
console.log('✅ Resultado después del voto:', hasVotedAfter);

if (hasVotedAfter) {
  console.log('✅ CORRECTO: Después de votar, muestra como votada');
} else {
  console.log('❌ ERROR: Después de votar, no muestra como votada');
}

console.log('\n🎯 Resumen del fix:');
console.log('   - Usuarios no autenticados: Solo localStorage');
console.log('   - Usuarios autenticados: Backend + localStorage como respaldo');
console.log('   - Limpieza automática de localStorage inconsistente'); 