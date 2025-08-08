import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testFreshSurvey() {
  console.log('🧪 Probando encuesta fresca...\n');

  try {
    // 1. Obtener encuesta específica como usuario no autenticado
    console.log('📋 1. Obteniendo encuesta 26 como usuario no autenticado...');
    const surveyResponse = await axios.get(`${BASE_URL}/api/v1/surveys/26`);
    console.log('📊 Respuesta completa:', JSON.stringify(surveyResponse.data, null, 2));

    // 2. Login como usuario
    console.log('\n👤 2. Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 3. Obtener encuesta con autenticación
    console.log('\n📋 3. Obteniendo encuesta 26 con autenticación...');
    const authResponse = await axios.get(`${BASE_URL}/api/v1/surveys/26`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Respuesta con autenticación:', JSON.stringify(authResponse.data, null, 2));

    // 4. Verificar estado antes de votar
    const survey = authResponse.data.data;
    console.log('\n🔍 4. Estado antes de votar:');
    console.log('   - user_voted:', survey.user_voted);
    console.log('   - user_votes:', survey.user_votes);
    console.log('   - total_votes:', survey.total_votes);

    // 5. Intentar votar
    console.log('\n🗳️ 5. Intentando votar...');
    try {
      const voteResponse = await axios.post(`${BASE_URL}/api/v1/surveys/26/vote`, {
        option_ids: [survey.options[0].id]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Voto exitoso:', voteResponse.data);
      
      // 6. Verificar estado después del voto
      console.log('\n🔍 6. Verificando estado después del voto...');
      const updatedResponse = await axios.get(`${BASE_URL}/api/v1/surveys/26`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedSurvey = updatedResponse.data.data;
      console.log('📊 Estado después del voto:');
      console.log('   - user_voted:', updatedSurvey.user_voted);
      console.log('   - user_votes:', updatedSurvey.user_votes);
      console.log('   - total_votes:', updatedSurvey.total_votes);
      console.log('   - options:', updatedSurvey.options.map(opt => ({
        id: opt.id,
        text: opt.option_text,
        votes: opt.votes_count,
        percentage: opt.percentage
      })));

    } catch (voteError) {
      console.log('❌ Error al votar:', voteError.response?.data || voteError.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testFreshSurvey(); 