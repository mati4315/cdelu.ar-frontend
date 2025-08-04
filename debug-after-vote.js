import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugAfterVote() {
  console.log('🔍 Debuggeando después del voto...\n');

  try {
    // 1. Obtener encuestas activas
    console.log('1️⃣ Obteniendo encuestas activas...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=5`);
    
    const survey = activeResponse.data.data[0];
    console.log('✅ Encuesta encontrada:', survey.id);
    console.log('📋 Pregunta:', survey.question);
    console.log('📊 Total de votos:', survey.total_votes);

    // 2. Votar en la encuesta
    console.log('\n2️⃣ Votando en la encuesta...');
    const voteData = {
      option_ids: [survey.options[0].id]
    };
    
    const voteResponse = await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData);
    console.log('✅ Voto exitoso');

    // 3. Obtener la encuesta específica después del voto
    console.log('\n3️⃣ Obteniendo encuesta específica después del voto...');
    const surveyResponse = await axios.get(`${BASE_URL}/surveys/${survey.id}`);
    const updatedSurvey = surveyResponse.data.data;
    
    console.log('📊 Total de votos actualizado:', updatedSurvey.total_votes);
    console.log('👤 user_voted:', updatedSurvey.user_voted);
    console.log('📋 user_votes:', updatedSurvey.user_votes);
    console.log('📋 Campos disponibles:', Object.keys(updatedSurvey));

    // 4. Intentar votar nuevamente
    console.log('\n4️⃣ Intentando votar nuevamente...');
    try {
      await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData);
      console.log('❌ ERROR: Debería haber fallado');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        console.log('✅ Correcto: No permite votar dos veces');
        
        // 5. Obtener la encuesta después del segundo intento
        console.log('\n5️⃣ Obteniendo encuesta después del segundo intento...');
        const finalSurveyResponse = await axios.get(`${BASE_URL}/surveys/${survey.id}`);
        const finalSurvey = finalSurveyResponse.data.data;
        
        console.log('📊 Total de votos final:', finalSurvey.total_votes);
        console.log('👤 user_voted final:', finalSurvey.user_voted);
        console.log('📋 user_votes final:', finalSurvey.user_votes);
        
        if (finalSurvey.user_voted) {
          console.log('✅ El backend está devolviendo user_voted correctamente');
        } else {
          console.log('❌ El backend NO está devolviendo user_voted');
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

debugAfterVote(); 