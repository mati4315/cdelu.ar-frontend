import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function createTestSurvey() {
  console.log('🧪 Creando encuesta de prueba...\n');

  try {
    // 1. Login como admin
    console.log('1️⃣ Login como administrador...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Crear encuesta de prueba
    console.log('\n2️⃣ Creando encuesta de prueba...');
    const createData = {
      question: '¿Cuál es tu color favorito?',
      options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
      is_multiple_choice: false,
      max_votes_per_user: 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
    
    const createResponse = await axios.post(`${BASE_URL}/surveys`, createData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const surveyId = createResponse.data.data.id;
    console.log('✅ Encuesta creada exitosamente');
    console.log('📋 ID de la encuesta:', surveyId);
    console.log('📋 Pregunta:', createData.question);
    console.log('📋 Opciones:', createData.options);

    // 3. Verificar que la encuesta está activa
    console.log('\n3️⃣ Verificando que la encuesta está activa...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=5`);
    console.log('✅ Encuestas activas:', activeResponse.data.data.length);
    
    if (activeResponse.data.data.length > 0) {
      console.log('📋 Encuestas disponibles:');
      activeResponse.data.data.forEach(survey => {
        console.log(`  - ID: ${survey.id}, Pregunta: ${survey.question}`);
      });
    }

    console.log('\n🎉 ¡Encuesta de prueba creada exitosamente!');
    console.log('✅ Ahora puedes probar la funcionalidad de votación');

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

createTestSurvey(); 