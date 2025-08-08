import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function debugVoteError() {
  console.log('🧪 Debuggeando error de votación...\n');

  try {
    // 1. Login como usuario
    console.log('👤 1. Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // 2. Obtener encuesta específica
    console.log('\n📋 2. Obteniendo encuesta ID 22...');
    const surveyResponse = await axios.get(`${BASE_URL}/api/v1/surveys/22`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Respuesta completa de la encuesta:', JSON.stringify(surveyResponse.data, null, 2));

    // 3. Verificar estructura de datos
    const survey = surveyResponse.data.survey || surveyResponse.data.data;
    console.log('\n🔍 3. Verificando campos de votación:');
    console.log('   - user_voted:', survey.user_voted);
    console.log('   - user_votes:', survey.user_votes);
    console.log('   - options:', survey.options?.map(opt => ({
      id: opt.id,
      text: opt.option_text,
      votes: opt.votes_count,
      percentage: opt.percentage
    })));

    // 4. Intentar votar
    console.log('\n🗳️ 4. Intentando votar...');
    try {
      const voteResponse = await axios.post(`${BASE_URL}/api/v1/surveys/22/vote`, {
        option_ids: [survey.options[0].id]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Voto exitoso:', voteResponse.data);
      
    } catch (voteError) {
      console.log('❌ Error al votar:', voteError.response?.data || voteError.message);
      console.log('📊 Status:', voteError.response?.status);
      console.log('📊 Headers:', voteError.response?.headers);
    }

    // 5. Verificar encuesta después del voto
    console.log('\n🔍 5. Verificando encuesta después del voto...');
    const updatedResponse = await axios.get(`${BASE_URL}/api/v1/surveys/22`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const updatedSurvey = updatedResponse.data.survey || updatedResponse.data.data;
    console.log('📊 Estado después del voto:', {
      user_voted: updatedSurvey.user_voted,
      user_votes: updatedSurvey.user_votes,
      total_votes: updatedSurvey.total_votes
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
debugVoteError(); 