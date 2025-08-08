import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function debugBackendResponse() {
  console.log('🧪 Debuggeando respuesta completa del backend...\n');

  try {
    // 1. Obtener encuestas activas
    console.log('📋 1. Obteniendo encuestas activas...');
    const activeResponse = await axios.get(`${BASE_URL}/api/v1/surveys/active?limit=1`);
    console.log('📊 Respuesta completa del backend:', JSON.stringify(activeResponse.data, null, 2));
    
    const surveys = activeResponse.data.data;
    if (surveys.length === 0) {
      console.log('❌ No hay encuestas activas');
      return;
    }
    
    const survey = surveys[0];
    console.log('\n🔍 2. Verificando campos específicos:');
    console.log('   - has_voted:', survey.has_voted);
    console.log('   - show_options:', survey.show_options);
    console.log('   - user_voted:', survey.user_voted);
    console.log('   - user_votes:', survey.user_votes);
    console.log('   - total_votes:', survey.total_votes);
    console.log('   - options:', survey.options?.length || 0);

    // 3. Login y obtener encuesta específica
    console.log('\n👤 3. Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 4. Obtener encuesta específica
    console.log('\n📋 4. Obteniendo encuesta específica...');
    const surveyResponse = await axios.get(`${BASE_URL}/api/v1/surveys/${survey.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Respuesta completa de encuesta específica:', JSON.stringify(surveyResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
debugBackendResponse(); 