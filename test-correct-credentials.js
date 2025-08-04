const BASE_URL = 'http://localhost:3001/api/v1';

async function testCorrectCredentials() {
  console.log('🔐 Probando credenciales correctas...\n');
  
  const correctCredentials = {
    email: 'admin@cdelu.ar',
    password: 'admin123'
  };
  
  try {
    console.log('📧 Intentando login con:', correctCredentials.email);
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(correctCredentials)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', result.user);
      console.log('🔑 Token:', result.token.substring(0, 20) + '...');
      console.log('🔑 Rol:', result.user.rol);
      
      // Guardar token para pruebas posteriores
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      return result;
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Detalles del error:', errorJson);
      } catch (e) {
        console.log('📋 Error como texto:', errorText);
      }
    }
  } catch (error) {
    console.log('💥 Error de conexión:', error.message);
  }
  
  return null;
}

async function testCreateSurveyWithToken(token) {
  console.log('\n📝 Probando creación de encuesta con token...\n');
  
  const surveyData = {
    title: 'Encuesta de Prueba Frontend',
    description: 'Esta es una encuesta de prueba creada desde el frontend',
    question: '¿Cuál es tu deporte favorito?',
    options: ['Fútbol', 'Básquet', 'Tenis', 'Otro'],
    is_multiple_choice: false,
    max_votes_per_user: 1
  };
  
  try {
    const response = await fetch(`${BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(surveyData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Encuesta creada exitosamente:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.log('❌ Error creando encuesta:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Detalles del error:', errorJson);
      } catch (e) {
        console.log('📋 Error como texto:', errorText);
      }
    }
  } catch (error) {
    console.log('💥 Error de conexión:', error.message);
  }
  
  return null;
}

// Función principal
async function main() {
  console.log('🚀 Probando credenciales correctas...\n');
  
  // 1. Probar login con credenciales correctas
  const loginResult = await testCorrectCredentials();
  
  if (loginResult) {
    console.log('\n✅ Login exitoso! Ahora probando creación de encuesta...');
    
    // 2. Probar creación de encuesta
    const surveyResult = await testCreateSurveyWithToken(loginResult.token);
    
    if (surveyResult) {
      console.log('\n🎉 ¡Todo funcionando correctamente!');
      console.log('✅ Login: Exitoso');
      console.log('✅ Creación de encuesta: Exitosa');
      console.log('✅ Token válido');
      console.log('✅ Permisos de administrador confirmados');
    } else {
      console.log('\n❌ Error al crear encuesta');
    }
  } else {
    console.log('\n❌ Error en login');
    console.log('\n📋 Posibles soluciones:');
    console.log('   1. Verificar que el backend esté corriendo');
    console.log('   2. Verificar la base de datos');
    console.log('   3. Verificar las credenciales');
  }
}

main(); 