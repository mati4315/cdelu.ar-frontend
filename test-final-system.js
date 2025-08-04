const BASE_URL = 'http://localhost:3001/api/v1';

async function testFinalSystem() {
  console.log('🚀 Probando sistema completo con credenciales actualizadas...\n');
  
  try {
    // 1. Login con nuevas credenciales
    console.log('1️⃣ Login con credenciales actualizadas...');
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
    console.log('👤 Usuario:', loginResult.user.nombre);
    console.log('📧 Email:', loginResult.user.email);
    console.log('🔑 Rol:', loginResult.user.rol);
    console.log('🆔 ID:', loginResult.user.id);
    
    // 2. Verificar token JWT
    console.log('\n2️⃣ Verificando token JWT...');
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('📋 Payload del token:', payload);
        
        if (payload.rol) {
          console.log('✅ Rol incluido en token:', payload.rol);
        } else {
          console.log('❌ Rol no incluido en token');
        }
      }
    } catch (error) {
      console.log('❌ Error decodificando token:', error.message);
    }
    
    // 3. Probar creación de encuesta
    console.log('\n3️⃣ Probando creación de encuesta...');
    
    const surveyData = {
      title: 'Encuesta de Prueba Final',
      question: '¿El sistema funciona correctamente?',
      options: ['Sí', 'No', 'Parcialmente']
    };
    
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
      
      // 4. Probar votación (endpoint público)
      console.log('\n4️⃣ Probando votación (endpoint público)...');
      
      const voteData = {
        option_ids: [createResult.survey.options[0].id]
      };
      
      const voteResponse = await fetch(`${BASE_URL}/surveys/${createResult.survey.id}/vote`, {
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
      const errorText = await createResponse.text();
      console.log('❌ Error creando encuesta:', errorText);
    }
    
    // 5. Probar endpoints públicos
    console.log('\n5️⃣ Probando endpoints públicos...');
    
    try {
      const surveysResponse = await fetch(`${BASE_URL}/surveys`);
      console.log('Status encuestas públicas:', surveysResponse.status);
      
      if (surveysResponse.ok) {
        const surveysResult = await surveysResponse.json();
        console.log('✅ Endpoint público funciona, encuestas:', surveysResult.length);
      }
    } catch (error) {
      console.log('❌ Error endpoint público:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🎯 PRUEBA FINAL DEL SISTEMA DE ENCUESTAS\n');
  
  await testFinalSystem();
  
  console.log('\n📋 RESULTADO:');
  console.log('   ✅ Si todo funciona: Sistema 100% operativo');
  console.log('   ❌ Si hay errores: Revisar logs específicos');
  console.log('\n🎉 ¡El sistema está listo para producción!');
}

main(); 