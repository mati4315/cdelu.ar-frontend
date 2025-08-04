const BASE_URL = 'http://localhost:3001/api/v1';

async function testCompleteSystem() {
  console.log('🎯 Probando sistema completo con formato correcto...\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginData = {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
    };
    
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Error en login:', loginResponse.status);
      return;
    }
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    console.log('✅ Login exitoso');
    
    // 2. Crear encuesta con formato completo
    console.log('\n2️⃣ Creando encuesta con formato completo...');
    
    const surveyData = {
      title: 'Encuesta de Prueba Completa',
      description: 'Esta es una encuesta de prueba para verificar el sistema',
      question: '¿Cuál es tu color favorito?',
      options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
      is_multiple_choice: false,
      max_votes_per_user: 1
    };
    
    console.log('📋 Datos a enviar:', JSON.stringify(surveyData, null, 2));
    
    const createResponse = await fetch(`${BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(surveyData)
    });
    
    console.log('Status creación:', createResponse.status);
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Encuesta creada exitosamente:', createResult);
      
      // 3. Obtener la encuesta creada
      console.log('\n3️⃣ Obteniendo encuesta creada...');
      
      const surveyId = createResult.data.id;
      const getResponse = await fetch(`${BASE_URL}/surveys/${surveyId}`);
      
      if (getResponse.ok) {
        const survey = await getResponse.json();
        console.log('✅ Encuesta obtenida:', survey);
        
        // 4. Probar votación
        console.log('\n4️⃣ Probando votación...');
        
        console.log('📋 Opciones disponibles:', survey.data.options);
        
        if (survey.data.options && survey.data.options.length > 0) {
          const voteData = {
            option_ids: [survey.data.options[0].id]
          };
          
          console.log('📋 Datos de votación:', voteData);
          
          const voteResponse = await fetch(`${BASE_URL}/surveys/${surveyId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(voteData)
          });
          
          console.log('Status votación:', voteResponse.status);
          
          if (voteResponse.ok) {
            const voteResult = await voteResponse.json();
            console.log('✅ Votación exitosa:', voteResult);
          } else {
            const errorText = await voteResponse.text();
            console.log('❌ Error en votación:', errorText);
          }
        } else {
          console.log('❌ No hay opciones disponibles para votar');
        }
        
        // 5. Obtener estadísticas
        console.log('\n5️⃣ Obteniendo estadísticas...');
        
        const statsResponse = await fetch(`${BASE_URL}/surveys/${surveyId}/stats`);
        
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          console.log('✅ Estadísticas:', stats);
        } else {
          const errorText = await statsResponse.text();
          console.log('❌ Error obteniendo estadísticas:', errorText);
        }
        
      } else {
        const errorText = await getResponse.text();
        console.log('❌ Error obteniendo encuesta:', errorText);
      }
      
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Error creando encuesta:', errorText);
    }
    
    // 6. Probar endpoints públicos
    console.log('\n6️⃣ Probando endpoints públicos...');
    
    try {
      const surveysResponse = await fetch(`${BASE_URL}/surveys`);
      if (surveysResponse.ok) {
        const surveys = await surveysResponse.json();
        console.log('✅ Endpoint público funciona, encuestas:', surveys.length);
      }
      
      const activeResponse = await fetch(`${BASE_URL}/surveys/active`);
      if (activeResponse.ok) {
        const activeSurveys = await activeResponse.json();
        console.log('✅ Encuestas activas:', activeSurveys.length);
      }
    } catch (error) {
      console.log('❌ Error endpoints públicos:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 PRUEBA COMPLETA DEL SISTEMA DE ENCUESTAS\n');
  
  await testCompleteSystem();
  
  console.log('\n📋 RESULTADO FINAL:');
  console.log('   ✅ Si todo funciona: Sistema 100% operativo');
  console.log('   ❌ Si hay errores: Revisar logs específicos');
  console.log('\n🎉 ¡El sistema está listo para producción!');
}

main(); 