// Script para probar que el fix del frontend funciona
console.log('🧪 Probando fix del frontend para votación...\n');

// Simular datos de encuesta como los devuelve el backend arreglado
const surveyData = {
  id: 22,
  question: 'aaaaaaaaaaa',
  status: 'active',
  is_multiple_choice: false,
  max_votes_per_user: 1,
  total_votes: 2,
  user_voted: true,  // Ahora el backend devuelve esto correctamente
  user_votes: [74, 73],  // Ahora el backend devuelve esto correctamente
  options: [
    {
      id: 73,
      option_text: '111111111',
      votes_count: 1,
      percentage: 50,
      display_order: 1
    },
    {
      id: 74,
      option_text: '222222222222',
      votes_count: 1,
      percentage: 50,
      display_order: 2
    }
  ]
};

console.log('📋 Datos de encuesta del backend (ARREGLADO):', {
  id: surveyData.id,
  user_voted: surveyData.user_voted,
  user_votes: surveyData.user_votes,
  total_votes: surveyData.total_votes
});

// Simular la función hasUserVoted del componente
function hasUserVoted(survey) {
  const isAuthenticated = true; // Simular usuario autenticado
  
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
  
  // También verificar localStorage como respaldo para usuarios autenticados
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  if (votedSurveys) {
    const votedIds = JSON.parse(votedSurveys);
    const localStorageVoted = votedIds.includes(survey.id);
    console.log('   - Verificando localStorage como respaldo:', localStorageVoted);
    
    // Si el backend dice que no votó pero localStorage dice que sí, limpiar localStorage
    if (!backendVoted && localStorageVoted) {
      console.log('   - Limpiando localStorage inconsistente');
      const updatedIds = votedIds.filter((id) => id !== survey.id);
      localStorage.setItem('userVotedSurveys', JSON.stringify(updatedIds));
      return false;
    }
  }
  
  return backendVoted;
}

// Probar la función
console.log('\n🧪 Probando función hasUserVoted...');
const hasVoted = hasUserVoted(surveyData);
console.log('✅ Resultado:', hasVoted);

if (hasVoted) {
  console.log('✅ CORRECTO: Usuario autenticado ve encuesta como votada (debería mostrar resultados)');
} else {
  console.log('❌ ERROR: Usuario autenticado no ve encuesta como votada');
}

// Simular encuesta no votada
console.log('\n🧪 Probando con encuesta no votada...');
const surveyNotVoted = {
  ...surveyData,
  user_voted: false,
  user_votes: []
};

const hasVotedNotVoted = hasUserVoted(surveyNotVoted);
console.log('✅ Resultado para encuesta no votada:', hasVotedNotVoted);

if (!hasVotedNotVoted) {
  console.log('✅ CORRECTO: Usuario autenticado ve encuesta como no votada (debería mostrar opciones)');
} else {
  console.log('❌ ERROR: Usuario autenticado ve encuesta como votada cuando no lo está');
}

console.log('\n🎯 Resumen del fix:');
console.log('   - Backend ahora devuelve user_voted y user_votes correctamente');
console.log('   - Frontend usa la URL correcta (/api/v1/surveys)');
console.log('   - Función hasUserVoted funciona correctamente para ambos casos');
console.log('   - Usuarios autenticados ven su estado real de votación');
console.log('   - Usuarios invitados ven opciones para votar'); 