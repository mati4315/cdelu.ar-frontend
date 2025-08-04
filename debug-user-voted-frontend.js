import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugUserVotedFrontend() {
  console.log('🔍 Debuggeando user_voted para usuario logueado...\n');

  try {
    // 1. Login como usuario
    console.log('1️⃣ Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    console.log('🔑 Token:', token.substring(0, 50) + '...');

    // 2. Obtener encuestas activas CON token
    console.log('\n2️⃣ Obteniendo encuestas activas CON token...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Encuestas activas encontradas:', activeResponse.data.data.length);
    
    if (activeResponse.data.data.length > 0) {
      activeResponse.data.data.forEach((survey, index) => {
        console.log(`\n📋 Encuesta ${index + 1}:`);
        console.log(`   - ID: ${survey.id}`);
        console.log(`   - Pregunta: ${survey.question}`);
        console.log(`   - Total votos: ${survey.total_votes}`);
        console.log(`   - user_voted: ${survey.user_voted}`);
        console.log(`   - user_votes: ${JSON.stringify(survey.user_votes)}`);
        console.log(`   - Opciones: ${survey.options?.length || 0}`);
        
        if (survey.options) {
          survey.options.forEach((option, optIndex) => {
            console.log(`     Opción ${optIndex + 1}: ${option.option_text} - ${option.votes_count} votos`);
          });
        }
      });
    }

    // 3. Obtener encuesta específica CON token
    if (activeResponse.data.data.length > 0) {
      const survey = activeResponse.data.data[0];
      console.log(`\n3️⃣ Obteniendo encuesta específica ${survey.id} CON token...`);
      
      const specificResponse = await axios.get(`${BASE_URL}/surveys/${survey.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const specificSurvey = specificResponse.data.data;
      console.log('📊 Encuesta específica:');
      console.log(`   - ID: ${specificSurvey.id}`);
      console.log(`   - Pregunta: ${specificSurvey.question}`);
      console.log(`   - Total votos: ${specificSurvey.total_votes}`);
      console.log(`   - user_voted: ${specificSurvey.user_voted}`);
      console.log(`   - user_votes: ${JSON.stringify(specificSurvey.user_votes)}`);
      
      if (specificSurvey.options) {
        console.log('   - Opciones con votos:');
        specificSurvey.options.forEach((option, index) => {
          const percentage = specificSurvey.total_votes > 0 
            ? Math.round((option.votes_count / specificSurvey.total_votes) * 100)
            : 0;
          console.log(`     ${index + 1}. ${option.option_text}: ${option.votes_count} votos (${percentage}%)`);
        });
      }
    }

    // 4. Verificar si el backend está calculando porcentajes correctamente
    console.log('\n4️⃣ Verificando cálculo de porcentajes...');
    if (activeResponse.data.data.length > 0) {
      const survey = activeResponse.data.data[0];
      console.log(`📊 Encuesta ${survey.id} - Total votos: ${survey.total_votes}`);
      
      if (survey.options) {
        survey.options.forEach((option, index) => {
          const percentage = survey.total_votes > 0 
            ? Math.round((option.votes_count / survey.total_votes) * 100)
            : 0;
          console.log(`   Opción ${index + 1}: ${option.option_text} - ${option.votes_count}/${survey.total_votes} = ${percentage}%`);
        });
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugUserVotedFrontend(); 