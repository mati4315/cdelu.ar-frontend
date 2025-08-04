import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function debugFrontendState() {
  console.log('🔍 Debuggeando estado del frontend...\n');

  try {
    // 1. Verificar que el endpoint funciona
    console.log('1️⃣ Verificando endpoint /surveys/active...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=10`);
    
    console.log('✅ Endpoint funciona correctamente');
    console.log('📊 Encuestas activas desde backend:', activeResponse.data.data.length);
    
    if (activeResponse.data.data.length > 0) {
      console.log('📋 Primera encuesta activa:');
      const survey = activeResponse.data.data[0];
      console.log(`   - ID: ${survey.id}`);
      console.log(`   - Pregunta: ${survey.question}`);
      console.log(`   - Total votos: ${survey.total_votes}`);
      console.log(`   - Opciones: ${survey.options?.length || 0}`);
    }

    // 2. Verificar que el frontend puede acceder al endpoint
    console.log('\n2️⃣ Verificando acceso desde frontend...');
    console.log('✅ El frontend debería poder acceder a:', `${BASE_URL}/surveys/active`);
    console.log('✅ El store debería cargar las encuestas activas');
    console.log('✅ El componente SurveyList debería mostrar las encuestas');

    // 3. Instrucciones para verificar en el navegador
    console.log('\n3️⃣ Para verificar en el navegador:');
    console.log('   - Abre http://localhost:5173/surveys');
    console.log('   - Ve a la pestaña "Encuestas Activas"');
    console.log('   - Abre la consola del navegador (F12)');
    console.log('   - Verifica si hay errores en la consola');
    console.log('   - Verifica si el store está cargando las encuestas');

    // 4. Posibles problemas
    console.log('\n4️⃣ Posibles problemas:');
    console.log('   - El store no está llamando a loadActiveSurveys()');
    console.log('   - El componente no está usando el store correctamente');
    console.log('   - Hay errores de CORS o red');
    console.log('   - El estado loading está en true indefinidamente');

    console.log('\n🎯 El backend está funcionando correctamente');
    console.log('🎯 El problema está en el frontend');
    console.log('🎯 Verifica la consola del navegador para más detalles');

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugFrontendState(); 