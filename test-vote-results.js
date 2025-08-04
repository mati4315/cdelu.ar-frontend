import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function testVoteResults() {
  console.log('🧪 Probando funcionalidad de mostrar resultados...\n');

  try {
    // 1. Obtener encuestas activas
    console.log('1️⃣ Obteniendo encuestas activas...');
    const activeResponse = await axios.get(`${BASE_URL}/surveys/active?limit=5`);
    
    if (activeResponse.data.data.length === 0) {
      console.log('❌ No hay encuestas activas disponibles');
      return;
    }
    
    const survey = activeResponse.data.data[0];
    console.log('✅ Encuesta encontrada:', survey.id);
    console.log('📋 Pregunta:', survey.question);

    // 2. Votar en la encuesta
    console.log('\n2️⃣ Votando en la encuesta...');
    const voteData = {
      option_ids: [survey.options[0].id] // Votar por la primera opción
    };
    
    const voteResponse = await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData);
    console.log('✅ Primer voto registrado exitosamente');
    console.log('📋 Respuesta:', voteResponse.data.message);

    // 3. Intentar votar nuevamente (debería mostrar resultados)
    console.log('\n3️⃣ Intentando votar nuevamente (debería mostrar resultados)...');
    try {
      await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData);
      console.log('❌ ERROR: Debería haber fallado');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        console.log('✅ Correcto: No permite votar dos veces');
        console.log('📋 Mensaje:', error.response.data.message);
        
        // 4. Obtener la encuesta actualizada para ver los resultados
        console.log('\n4️⃣ Obteniendo encuesta actualizada para ver resultados...');
        const updatedSurveyResponse = await axios.get(`${BASE_URL}/surveys/${survey.id}`);
        const updatedSurvey = updatedSurveyResponse.data.data;
        
        console.log('✅ Encuesta actualizada obtenida');
        console.log('📊 Total de votos:', updatedSurvey.total_votes);
        console.log('📋 Opciones con votos:');
        
        updatedSurvey.options.forEach(option => {
          const percentage = updatedSurvey.total_votes > 0 
            ? Math.round((option.votes_count / updatedSurvey.total_votes) * 100)
            : 0;
          console.log(`  - ${option.option_text}: ${option.votes_count} votos (${percentage}%)`);
        });
        
        console.log('\n🎉 ¡Funcionalidad funcionando correctamente!');
        console.log('✅ El backend devuelve error 400 cuando ya votó');
        console.log('✅ El frontend debería mostrar los resultados en lugar del error');
        
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testVoteResults(); 