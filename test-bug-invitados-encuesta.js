import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testGuestUserSurveyBug() {
  console.log('🧪 Probando bug de usuarios invitados en encuestas...\n');

  try {
    // 1. Obtener encuestas activas sin autenticación
    console.log('📋 1. Obteniendo encuestas activas como usuario invitado...');
    const activeResponse = await axios.get(`${BASE_URL}/api/v1/surveys/active?limit=1`);
    console.log('📊 Respuesta completa del backend:', JSON.stringify(activeResponse.data, null, 2));
    
    const surveys = activeResponse.data.data || activeResponse.data.surveys || activeResponse.data;
    
    if (!surveys || surveys.length === 0) {
      console.log('❌ No hay encuestas activas para probar');
      return;
    }
    
    const survey = surveys[0];
    console.log('✅ Encuesta encontrada:', {
      id: survey.id,
      question: survey.question,
      total_votes: survey.total_votes,
      user_voted: survey.user_voted,
      user_votes: survey.user_votes
    });

    // 2. Verificar que el backend no marca como votado para usuarios no autenticados
    console.log('\n🔍 2. Verificando estado de votación del backend...');
    if (survey.user_voted === true) {
      console.log('❌ BUG: Backend marca como votado para usuario no autenticado');
      console.log('   - user_voted:', survey.user_voted);
      console.log('   - user_votes:', survey.user_votes);
    } else {
      console.log('✅ Backend correctamente no marca como votado');
      console.log('   - user_voted:', survey.user_voted);
      console.log('   - user_votes:', survey.user_votes);
    }

    // 3. Intentar votar como usuario no autenticado
    console.log('\n🗳️ 3. Intentando votar como usuario invitado...');
    try {
      const voteResponse = await axios.post(`${BASE_URL}/api/v1/surveys/${survey.id}/vote`, {
        option_ids: [survey.options[0].id]
      });
      
      console.log('✅ Voto exitoso como invitado:', voteResponse.data);
      
      // 4. Verificar que el voto se registró
      console.log('\n🔍 4. Verificando que el voto se registró...');
      const updatedResponse = await axios.get(`${BASE_URL}/api/v1/surveys/${survey.id}`);
      const updatedSurvey = updatedResponse.data.survey || updatedResponse.data.data;
      
      console.log('📊 Estado después del voto:', {
        total_votes: updatedSurvey.total_votes,
        options: updatedSurvey.options.map(opt => ({
          id: opt.id,
          text: opt.option_text,
          votes: opt.votes_count,
          percentage: opt.percentage
        }))
      });
      
    } catch (voteError) {
      console.log('❌ Error al votar como invitado:', voteError.response?.data || voteError.message);
    }

    // 5. Probar con usuario autenticado
    console.log('\n👤 5. Probando con usuario autenticado...');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Obtener encuesta con autenticación
    const authResponse = await axios.get(`${BASE_URL}/api/v1/surveys/${survey.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const authSurvey = authResponse.data.survey || authResponse.data.data;
    console.log('📋 Encuesta con autenticación:', {
      id: authSurvey.id,
      user_voted: authSurvey.user_voted,
      user_votes: authSurvey.user_votes
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testGuestUserSurveyBug(); 