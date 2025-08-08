import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function createFreshSurvey() {
  console.log('🧪 Creando encuesta fresca para pruebas...\n');

  try {
    // 1. Login como admin
    console.log('👤 1. Login como administrador...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // 2. Crear encuesta fresca
    console.log('\n📝 2. Creando encuesta fresca...');
    const surveyData = {
      question: '¿Cuál es tu deporte favorito?',
      options: [
        'Fútbol',
        'Basketball',
        'Tenis'
      ],
      duration_hours: 24,
      duration_minutes: 0
    };

    const createResponse = await axios.post(`${BASE_URL}/api/v1/surveys`, surveyData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Encuesta creada exitosamente:', createResponse.data);

    // 3. Verificar que la encuesta está activa
    console.log('\n🔍 3. Verificando que la encuesta está activa...');
    const activeResponse = await axios.get(`${BASE_URL}/api/v1/surveys/active`);
    console.log('📊 Encuestas activas:', activeResponse.data);

  } catch (error) {
    console.error('❌ Error creando encuesta:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
createFreshSurvey(); 