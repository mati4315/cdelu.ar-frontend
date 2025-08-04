import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function checkSurveyFields() {
  console.log('🔍 Verificando campos de la encuesta...\n');

  try {
    // 1. Obtener encuestas activas
    console.log('1️⃣ Obteniendo encuestas activas...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=5`);
    
    const survey = activeResponse.data.data[0];
    console.log('✅ Encuesta encontrada:', survey.id);
    console.log('📋 Pregunta:', survey.question);
    console.log('📊 Total de votos:', survey.total_votes);

    // 2. Obtener la encuesta específica
    console.log('\n2️⃣ Obteniendo encuesta específica...');
    const surveyResponse = await axios.get(`${BASE_URL}/surveys/${survey.id}`);
    const specificSurvey = surveyResponse.data.data;
    
    console.log('📊 Total de votos:', specificSurvey.total_votes);
    console.log('👤 user_voted:', specificSurvey.user_voted);
    console.log('📋 user_votes:', specificSurvey.user_votes);
    console.log('📋 Campos disponibles:', Object.keys(specificSurvey));
    
    // Mostrar todos los campos con sus valores
    console.log('\n📋 Detalles completos de la encuesta:');
    Object.entries(specificSurvey).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });

    // 3. Verificar si el backend está detectando que el usuario ya votó
    console.log('\n3️⃣ Verificando si el backend detecta que el usuario ya votó...');
    if (specificSurvey.user_voted === true) {
      console.log('✅ El backend detecta que el usuario ya votó');
    } else if (specificSurvey.user_voted === false) {
      console.log('❌ El backend dice que el usuario NO ha votado');
    } else {
      console.log('❓ El backend no devuelve el campo user_voted');
    }

    // 4. Verificar user_votes
    if (specificSurvey.user_votes && specificSurvey.user_votes.length > 0) {
      console.log('✅ El usuario tiene votos registrados:', specificSurvey.user_votes);
    } else {
      console.log('❌ El usuario no tiene votos registrados');
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkSurveyFields(); 