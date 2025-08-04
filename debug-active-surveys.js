import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugActiveSurveys() {
  console.log('🔍 Debuggeando encuestas activas...\n');

  try {
    // 1. Obtener encuestas activas
    console.log('1️⃣ Obteniendo encuestas activas...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=10`);
    
    console.log('📊 Respuesta completa:', JSON.stringify(activeResponse.data, null, 2));
    console.log('📋 Encuestas encontradas:', activeResponse.data.data?.length || 0);
    
    if (activeResponse.data.data?.length > 0) {
      console.log('📋 Detalles de las encuestas:');
      activeResponse.data.data.forEach((survey, index) => {
        console.log(`  ${index + 1}. ID: ${survey.id}`);
        console.log(`     Pregunta: ${survey.question}`);
        console.log(`     Estado: ${survey.status}`);
        console.log(`     Total votos: ${survey.total_votes}`);
        console.log(`     user_voted: ${survey.user_voted}`);
        console.log(`     user_votes: ${survey.user_votes}`);
        console.log(`     Opciones: ${survey.options?.length || 0}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay encuestas activas');
    }

    // 2. Obtener todas las encuestas
    console.log('\n2️⃣ Obteniendo todas las encuestas...');
    const allResponse = await axios.get(`${BASE_URL}/surveys?limit=10`);
    
    console.log('📋 Todas las encuestas encontradas:', allResponse.data.data?.length || 0);
    
    if (allResponse.data.data?.length > 0) {
      console.log('📋 Detalles de todas las encuestas:');
      allResponse.data.data.forEach((survey, index) => {
        console.log(`  ${index + 1}. ID: ${survey.id}`);
        console.log(`     Pregunta: ${survey.question}`);
        console.log(`     Estado: ${survey.status}`);
        console.log(`     Total votos: ${survey.total_votes}`);
        console.log('');
      });
    }

    // 3. Verificar si hay encuestas con estado 'active'
    console.log('\n3️⃣ Verificando encuestas con estado "active"...');
    const activeSurveys = allResponse.data.data?.filter(s => s.status === 'active') || [];
    console.log('📋 Encuestas con estado "active":', activeSurveys.length);
    
    activeSurveys.forEach((survey, index) => {
      console.log(`  ${index + 1}. ID: ${survey.id} - ${survey.question}`);
    });

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugActiveSurveys(); 