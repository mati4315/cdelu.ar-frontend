import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugUserVoted() {
  console.log('🔍 Debuggeando campo user_voted...\n');

  try {
    // 1. Obtener encuestas activas
    console.log('1️⃣ Obteniendo encuestas activas...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=5`);
    
    if (activeResponse.data.data.length === 0) {
      console.log('❌ No hay encuestas activas disponibles');
      return;
    }
    
    const survey = activeResponse.data.data[0];
    console.log('✅ Encuesta encontrada:', survey.id);
    console.log('📋 Pregunta:', survey.question);
    console.log('📊 Total de votos:', survey.total_votes);
    console.log('👤 user_voted:', survey.user_voted);
    console.log('📋 Campos disponibles:', Object.keys(survey));

    // 2. Intentar votar para ver qué pasa
    console.log('\n2️⃣ Intentando votar...');
    const voteData = {
      option_ids: [survey.options[0].id]
    };
    
    try {
      const voteResponse = await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData);
      console.log('✅ Voto exitoso');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        console.log('✅ Usuario ya votó (esperado)');
        
        // 3. Obtener la encuesta después del intento de voto
        console.log('\n3️⃣ Obteniendo encuesta después del intento de voto...');
        const updatedSurveyResponse = await axios.get(`${BASE_URL}/surveys/${survey.id}`);
        const updatedSurvey = updatedSurveyResponse.data.data;
        
        console.log('📊 Total de votos actualizado:', updatedSurvey.total_votes);
        console.log('👤 user_voted actualizado:', updatedSurvey.user_voted);
        console.log('📋 user_votes:', updatedSurvey.user_votes);
        
        if (updatedSurvey.user_voted) {
          console.log('✅ El backend está devolviendo user_voted correctamente');
        } else {
          console.log('❌ El backend NO está devolviendo user_voted correctamente');
          console.log('🔧 El backend necesita actualizar la lógica para detectar si el usuario ya votó');
        }
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugUserVoted(); 