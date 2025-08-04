const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testBackendUpdates() {
  console.log('🧪 Probando actualizaciones del backend...\n');

  try {
    // 1. Probar obtener encuestas activas
    console.log('1️⃣ Probando GET /surveys/active...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=10`);
    console.log('✅ Encuestas activas obtenidas correctamente');
    console.log(`📊 Encuestas encontradas: ${activeResponse.data.data?.length || 0}`);
    
    if (activeResponse.data.data?.length > 0) {
      const survey = activeResponse.data.data[0];
      console.log('📋 Campos de la encuesta:', Object.keys(survey));
      
      // Verificar que no tenga title ni description
      if (survey.title) {
        console.log('❌ ERROR: La encuesta aún tiene campo "title"');
      } else {
        console.log('✅ Campo "title" eliminado correctamente');
      }
      
      if (survey.description) {
        console.log('❌ ERROR: La encuesta aún tiene campo "description"');
      } else {
        console.log('✅ Campo "description" eliminado correctamente');
      }
    }

    // 2. Probar obtener una encuesta específica
    console.log('\n2️⃣ Probando GET /surveys/:id...');
    const surveyResponse = await axios.get(`${BASE_URL}/surveys/8`);
    console.log('✅ Encuesta específica obtenida correctamente');
    console.log('📋 Campos de la encuesta:', Object.keys(surveyResponse.data.data));

    // 3. Probar crear una encuesta (sin title y description)
    console.log('\n3️⃣ Probando POST /surveys (crear encuesta)...');
    const createData = {
      question: '¿Cuál es tu color favorito?',
      options: ['Rojo', 'Azul', 'Verde'],
      is_multiple_choice: false,
      max_votes_per_user: 1,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
    };
    
    const createResponse = await axios.post(`${BASE_URL}/surveys`, createData, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Token de admin
      }
    });
    console.log('✅ Encuesta creada correctamente');
    console.log('📋 Respuesta:', createResponse.data);

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n🔧 El backend necesita ser actualizado:');
      console.log('1. Ejecutar: ALTER TABLE surveys DROP COLUMN title;');
      console.log('2. Ejecutar: ALTER TABLE surveys DROP COLUMN description;');
      console.log('3. Actualizar controladores para no usar estos campos');
    }
  }
}

testBackendUpdates(); 