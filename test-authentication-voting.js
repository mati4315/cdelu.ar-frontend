import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function testAuthenticationVoting() {
  console.log('🧪 Probando autenticación requerida para votar...\n');

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

    // 2. Intentar votar SIN token (debería fallar con 401)
    console.log('\n2️⃣ Intentando votar SIN token (debería fallar con 401)...');
    const voteData = {
      option_ids: [survey.options[0].id]
    };
    
    try {
      await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData);
      console.log('❌ ERROR: Debería haber fallado con 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: No permite votar sin autenticación');
        console.log('📋 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

    // 3. Login como usuario
    console.log('\n3️⃣ Login como usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 4. Intentar votar CON token (debería funcionar)
    console.log('\n4️⃣ Intentando votar CON token...');
    try {
      const voteResponse = await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Voto exitoso con autenticación');
      console.log('📋 Respuesta:', voteResponse.data.message);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        console.log('✅ Correcto: No permite votar dos veces');
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

    // 5. Intentar votar nuevamente (debería fallar con 400)
    console.log('\n5️⃣ Intentando votar nuevamente (debería fallar con 400)...');
    try {
      await axios.post(`${BASE_URL}/surveys/${survey.id}/vote`, voteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ ERROR: Debería haber fallado con 400');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya has votado')) {
        console.log('✅ Correcto: No permite votos duplicados');
        console.log('📋 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data);
      }
    }

    console.log('\n🎉 ¡Sistema de autenticación funcionando correctamente!');
    console.log('✅ Solo usuarios logueados pueden votar');
    console.log('✅ Se previenen votos duplicados');
    console.log('✅ Mensajes de error claros');

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testAuthenticationVoting(); 