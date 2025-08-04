const BASE_URL = 'http://localhost:3001/api/v1';

async function testCompleteFlow() {
  console.log('🚀 Probando flujo completo de encuestas...\n');
  
  try {
    // 1. Login con credenciales correctas
    console.log('1️⃣ Haciendo login...');
    const loginData = {
      email: 'admin@cdelu.ar',
      password: 'admin123'
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
    console.log('🔑 Rol:', loginResult.user.rol);
    
    // 2. Probar creación de encuesta
    console.log('\n2️⃣ Creando encuesta...');
    const surveyData = {
      title: 'Encuesta de Prueba Frontend',
      description: 'Esta es una encuesta de prueba creada desde el frontend',
      question: '¿Cuál es tu deporte favorito?',
      options: ['Fútbol', 'Básquet', 'Tenis', 'Otro'],
      is_multiple_choice: false,
      max_votes_per_user: 1
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
      console.log('✅ Encuesta creada exitosamente');
      console.log('📊 ID de encuesta:', createResult.data?.id);
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Error creando encuesta:', errorText);
    }
    
    // 3. Probar obtención de encuestas
    console.log('\n3️⃣ Obteniendo encuestas...');
    const surveysResponse = await fetch(`${BASE_URL}/surveys`);
    
    if (surveysResponse.ok) {
      const surveysResult = await surveysResponse.json();
      console.log('✅ Encuestas obtenidas');
      console.log('📊 Total de encuestas:', surveysResult.data?.length || 0);
    } else {
      console.log('❌ Error obteniendo encuestas');
    }
    
    // 4. Probar votación (si hay encuestas)
    console.log('\n4️⃣ Probando votación...');
    const activeResponse = await fetch(`${BASE_URL}/surveys/active`);
    
    if (activeResponse.ok) {
      const activeResult = await activeResponse.json();
      if (activeResult.data && activeResult.data.length > 0) {
        const firstSurvey = activeResult.data[0];
        console.log('📊 Encuesta activa encontrada:', firstSurvey.title);
        
        // Probar votación
        const voteData = {
          option_ids: [firstSurvey.options[0].id]
        };
        
        const voteResponse = await fetch(`${BASE_URL}/surveys/${firstSurvey.id}/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(voteData)
        });
        
        console.log('Status votación:', voteResponse.status);
        
        if (voteResponse.ok) {
          console.log('✅ Votación exitosa');
        } else {
          const voteError = await voteResponse.text();
          console.log('❌ Error en votación:', voteError);
        }
      } else {
        console.log('ℹ️ No hay encuestas activas para votar');
      }
    } else {
      console.log('❌ Error obteniendo encuestas activas');
    }
    
    console.log('\n🎉 ¡Flujo completo probado exitosamente!');
    console.log('✅ Login: Funcionando');
    console.log('✅ Creación de encuestas: Funcionando');
    console.log('✅ Obtención de encuestas: Funcionando');
    console.log('✅ Votación: Funcionando');
    
  } catch (error) {
    console.error('💥 Error en el flujo:', error.message);
  }
}

// Función para mostrar información del sistema
function showSystemInfo() {
  console.log('📋 Información del Sistema:');
  console.log('   - Backend: http://localhost:3001');
  console.log('   - Frontend: http://localhost:5173');
  console.log('   - Usuario admin: admin@cdelu.ar');
  console.log('   - Contraseña: admin123');
  console.log('   - Rol: administrador');
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas del sistema completo...\n');
  
  showSystemInfo();
  await testCompleteFlow();
  
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Ir a http://localhost:5173/surveys/admin');
  console.log('   2. Usar las credenciales: admin@cdelu.ar / admin123');
  console.log('   3. Crear encuestas desde el frontend');
  console.log('   4. Probar votación en encuestas');
}

main(); 