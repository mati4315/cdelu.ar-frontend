import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugBackendVotes() {
  console.log('🔍 Debuggeando votos en el backend...\n');

  try {
    // 1. Login como usuario
    console.log('1️⃣ Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Obtener encuesta específica CON token
    console.log('\n2️⃣ Obteniendo encuesta 17 CON token...');
    const surveyResponse = await axios.get(`${BASE_URL}/surveys/17`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const survey = surveyResponse.data.data;
    console.log('📊 Encuesta 17:');
    console.log(`   - ID: ${survey.id}`);
    console.log(`   - Pregunta: ${survey.question}`);
    console.log(`   - Total votos: ${survey.total_votes}`);
    console.log(`   - user_voted: ${survey.user_voted}`);
    console.log(`   - user_votes: ${JSON.stringify(survey.user_votes)}`);
    
    if (survey.options) {
      console.log('   - Opciones:');
      survey.options.forEach((option, index) => {
        console.log(`     ${index + 1}. ${option.option_text}: ${option.votes_count} votos`);
      });
    }

    // 3. Verificar directamente en la base de datos
    console.log('\n3️⃣ Verificando votos en la base de datos...');
    const dbResponse = await axios.get(`${BASE_URL}/debug/survey-votes/17`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Datos de la base de datos:');
    console.log(JSON.stringify(dbResponse.data, null, 2));

    // 4. Intentar votar de nuevo para ver el error
    console.log('\n4️⃣ Intentando votar de nuevo...');
    try {
      const voteResponse = await axios.post(`${BASE_URL}/surveys/17/vote`, {
        option_ids: [61, 62]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Voto exitoso:', voteResponse.data);
    } catch (error) {
      console.log('❌ Error al votar:', error.response?.data);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugBackendVotes(); 