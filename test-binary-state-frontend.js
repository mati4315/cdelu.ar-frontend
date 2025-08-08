import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

async function testBinaryStateFrontend() {
  console.log('🧪 Probando sistema de estado binario en frontend...\n');

  try {
    // 1. Obtener encuestas activas como usuario no autenticado
    console.log('📋 1. Obteniendo encuestas como usuario no autenticado...');
    const activeResponse = await axios.get(`${BASE_URL}/api/v1/surveys/active?limit=1`);
    const surveys = activeResponse.data.data;
    
    if (surveys.length === 0) {
      console.log('❌ No hay encuestas activas para probar');
      return;
    }
    
    const survey = surveys[0];
    console.log('✅ Encuesta encontrada:', {
      id: survey.id,
      question: survey.question,
      has_voted: survey.has_voted,
      show_options: survey.show_options,
      total_votes: survey.total_votes
    });

    // 2. Verificar estado binario para usuario no autenticado
    console.log('\n🔍 2. Verificando estado binario para usuario no autenticado...');
    if (survey.has_voted === false && survey.show_options === true) {
      console.log('✅ CORRECTO: Usuario no autenticado ve opciones para votar');
    } else {
      console.log('❌ ERROR: Estado binario incorrecto para usuario no autenticado');
      console.log('   - has_voted:', survey.has_voted);
      console.log('   - show_options:', survey.show_options);
    }

    // 3. Login como usuario
    console.log('\n👤 3. Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // 4. Obtener encuesta con autenticación
    console.log('\n📋 4. Obteniendo encuesta con autenticación...');
    const authResponse = await axios.get(`${BASE_URL}/api/v1/surveys/${survey.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const authSurvey = authResponse.data.data;
    console.log('📊 Encuesta con autenticación:', {
      id: authSurvey.id,
      has_voted: authSurvey.has_voted,
      show_options: authSurvey.show_options,
      total_votes: authSurvey.total_votes
    });

    // 5. Verificar estado binario para usuario autenticado
    console.log('\n🔍 5. Verificando estado binario para usuario autenticado...');
    if (authSurvey.has_voted === false && authSurvey.show_options === true) {
      console.log('✅ CORRECTO: Usuario autenticado ve opciones para votar (no ha votado)');
    } else if (authSurvey.has_voted === true && authSurvey.show_options === false) {
      console.log('✅ CORRECTO: Usuario autenticado ve resultados (ya votó)');
    } else {
      console.log('❌ ERROR: Estado binario incorrecto para usuario autenticado');
      console.log('   - has_voted:', authSurvey.has_voted);
      console.log('   - show_options:', authSurvey.show_options);
    }

    // 6. Intentar votar
    console.log('\n🗳️ 6. Intentando votar...');
    try {
      const voteResponse = await axios.post(`${BASE_URL}/api/v1/surveys/${survey.id}/vote`, {
        option_ids: [authSurvey.options[0].id]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Voto exitoso:', voteResponse.data);
      
      // 7. Verificar estado después del voto
      console.log('\n🔍 7. Verificando estado después del voto...');
      const updatedResponse = await axios.get(`${BASE_URL}/api/v1/surveys/${survey.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedSurvey = updatedResponse.data.data;
      console.log('📊 Estado después del voto:', {
        has_voted: updatedSurvey.has_voted,
        show_options: updatedSurvey.show_options,
        total_votes: updatedSurvey.total_votes
      });

      if (updatedSurvey.has_voted === true && updatedSurvey.show_options === false) {
        console.log('✅ CORRECTO: Después de votar, muestra resultados');
      } else {
        console.log('❌ ERROR: Estado incorrecto después de votar');
      }

    } catch (voteError) {
      console.log('❌ Error al votar:', voteError.response?.data || voteError.message);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testBinaryStateFrontend(); 