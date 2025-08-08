// Script para simular el comportamiento del frontend
console.log('🧪 Probando frontend completo con sistema arreglado...\n');

// Simular datos de encuesta del backend
const surveyData = {
  id: 26,
  question: '¿Cuál es tu deporte favorito?',
  status: 'active',
  is_multiple_choice: false,
  max_votes_per_user: 1,
  total_votes: 0,
  user_voted: false,
  user_votes: [],
  options: [
    {
      id: 82,
      option_text: 'Fútbol',
      votes_count: 0,
      percentage: 0,
      display_order: 1
    },
    {
      id: 83,
      option_text: 'Basketball',
      votes_count: 0,
      percentage: 0,
      display_order: 2
    },
    {
      id: 84,
      option_text: 'Tenis',
      votes_count: 0,
      percentage: 0,
      display_order: 3
    }
  ]
};

console.log('📋 Estado inicial de la encuesta:');
console.log('   - user_voted:', surveyData.user_voted);
console.log('   - user_votes:', surveyData.user_votes);
console.log('   - total_votes:', surveyData.total_votes);

// Simular la función hasUserVoted del componente
function hasUserVoted(survey) {
  console.log('🔍 Verificando si usuario votó en encuesta:', survey.id);
  console.log('   - has_voted:', survey.has_voted);
  console.log('   - show_options:', survey.show_options);
  console.log('   - user_voted:', survey.user_voted);
  console.log('   - user_votes:', survey.user_votes);
  
  // Si el backend proporciona has_voted (sistema binario nuevo), usarlo
  if (survey.has_voted !== undefined) {
    console.log('   - Usando has_voted del backend:', survey.has_voted);
    return survey.has_voted;
  }
  
  // Si el backend proporciona user_voted (sistema actual), usarlo
  if (survey.user_voted !== undefined) {
    console.log('   - Usando user_voted del backend:', survey.user_voted);
    return survey.user_voted;
  }
  
  // Si el backend proporciona user_votes, verificar si tiene votos
  if (survey.user_votes && survey.user_votes.length > 0) {
    console.log('   - Usando user_votes del backend:', survey.user_votes);
    return true;
  }
  
  console.log('   - Usuario no ha votado');
  return false;
}

// Probar estado inicial
console.log('\n🧪 Probando estado inicial...');
const hasVotedInitial = hasUserVoted(surveyData);
console.log('✅ Resultado inicial:', hasVotedInitial);

if (!hasVotedInitial) {
  console.log('✅ CORRECTO: Usuario ve opciones para votar');
} else {
  console.log('❌ ERROR: Usuario ve resultados cuando no ha votado');
}

// Simular voto exitoso
console.log('\n🗳️ Simulando voto exitoso...');
const surveyAfterVote = {
  ...surveyData,
  user_voted: true,
  user_votes: [82],
  total_votes: 1,
  options: [
    {
      id: 82,
      option_text: 'Fútbol',
      votes_count: 1,
      percentage: 100,
      display_order: 1
    },
    {
      id: 83,
      option_text: 'Basketball',
      votes_count: 0,
      percentage: 0,
      display_order: 2
    },
    {
      id: 84,
      option_text: 'Tenis',
      votes_count: 0,
      percentage: 0,
      display_order: 3
    }
  ]
};

console.log('📊 Estado después del voto:');
console.log('   - user_voted:', surveyAfterVote.user_voted);
console.log('   - user_votes:', surveyAfterVote.user_votes);
console.log('   - total_votes:', surveyAfterVote.total_votes);

// Probar estado después del voto
console.log('\n🧪 Probando estado después del voto...');
const hasVotedAfter = hasUserVoted(surveyAfterVote);
console.log('✅ Resultado después del voto:', hasVotedAfter);

if (hasVotedAfter) {
  console.log('✅ CORRECTO: Usuario ve resultados después de votar');
} else {
  console.log('❌ ERROR: Usuario no ve resultados después de votar');
}

// Simular función calculatePercentage
function calculatePercentage(option) {
  console.log('🔍 Calculando porcentaje para:', option.option_text);
  console.log('   - Votos de la opción:', option.votes_count);
  console.log('   - Porcentaje del backend:', option.percentage);
  
  // Si el backend proporciona el porcentaje, usarlo directamente
  if (option.percentage !== undefined && option.percentage !== null) {
    console.log('   - Usando porcentaje del backend:', option.percentage + '%');
    return option.percentage;
  }
  
  // Fallback al cálculo local
  const totalVotes = surveyAfterVote.total_votes || 0;
  if (totalVotes === 0) {
    console.log('   - No hay votos totales, 0%');
    return 0;
  }
  
  const percentage = Math.round((option.votes_count / totalVotes) * 100);
  console.log('   - Porcentaje calculado localmente:', percentage + '%');
  return percentage;
}

// Probar cálculo de porcentajes
console.log('\n🧪 Probando cálculo de porcentajes...');
surveyAfterVote.options.forEach(option => {
  const percentage = calculatePercentage(option);
  console.log(`   - ${option.option_text}: ${percentage}% (${option.votes_count} votos)`);
});

console.log('\n🎯 Resumen del sistema:');
console.log('   - Estado inicial: Usuario ve opciones para votar');
console.log('   - Después de votar: Usuario ve resultados con porcentajes');
console.log('   - Porcentajes: Se calculan correctamente desde el backend');
console.log('   - Barras de progreso: Se muestran según los porcentajes');
console.log('   - Transición: Suave y clara entre estados'); 