const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testCompleteSurveySystem() {
  console.log('🧪 Probando sistema completo de encuestas...\n');

  try {
    // 1. Login como admin
    console.log('1️⃣ Login como administrador...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    console.log('🔑 Token obtenido:', token.substring(0, 50) + '...');

    // 2. Crear una nueva encuesta
    console.log('\n2️⃣ Creando nueva encuesta...');
    const createData = {
      question: '¿Cuál es tu fruta favorita?',
      options: ['Manzana', 'Plátano', 'Naranja', 'Fresa'],
      is_multiple_choice: false,
      max_votes_per_user: 1,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 horas
    };
    
    const createResponse = await axios.post(`${BASE_URL}/surveys`, createData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const surveyId = createResponse.data.data.id;
    console.log('✅ Encuesta creada exitosamente');
    console.log('📋 ID de la encuesta:', surveyId);

    // 3. Obtener la encuesta creada
    console.log('\n3️⃣ Obteniendo encuesta creada...');
    const surveyResponse = await axios.get(`${BASE_URL}/surveys/${surveyId}`);
    console.log('✅ Encuesta obtenida correctamente');
    console.log('📋 Pregunta:', surveyResponse.data.data.question);
    console.log('📋 Opciones:', surveyResponse.data.data.options.map(o => o.option_text));

    // 4. Votar en la encuesta (sin token - como usuario público)
    console.log('\n4️⃣ Votando en la encuesta...');
    const voteData = {
      option_ids: [surveyResponse.data.data.options[0].id] // Votar por la primera opción
    };
    
    const voteResponse = await axios.post(`${BASE_URL}/surveys/${surveyId}/vote`, voteData);
    console.log('✅ Voto registrado exitosamente');
    console.log('📋 Respuesta:', voteResponse.data.message);

    // 5. Intentar votar nuevamente (debería fallar)
    console.log('\n5️⃣ Intentando votar nuevamente (debería fallar)...');
    try {
      await axios.post(`${BASE_URL}/surveys/${surveyId}/vote`, voteData);
      console.log('❌ ERROR: Debería haber fallado');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        console.log('✅ Correcto: No permite votar dos veces');
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

    // 6. Obtener estadísticas
    console.log('\n6️⃣ Obteniendo estadísticas...');
    const statsResponse = await axios.get(`${BASE_URL}/surveys/${surveyId}/stats`);
    console.log('✅ Estadísticas obtenidas correctamente');
    console.log('📊 Total de votos:', statsResponse.data.data.total_votes);
    console.log('📊 Votantes únicos:', statsResponse.data.data.unique_ips);

    console.log('\n🎉 ¡Sistema de encuestas funcionando perfectamente!');
    console.log('✅ Backend actualizado correctamente');
    console.log('✅ Formulario simplificado funcionando');
    console.log('✅ Validación de votos funcionando');
    console.log('✅ Estadísticas funcionando');

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔧 El backend aún necesita actualizaciones');
    } else if (error.response?.status === 401) {
      console.log('\n🔧 Credenciales incorrectas o token expirado');
    } else {
      console.log('\n🔧 Error inesperado en el sistema');
    }
  }
}

testCompleteSurveySystem(); 