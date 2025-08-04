const BASE_URL = 'http://localhost:3001/api/v1';

async function testTokenAuthorization() {
  console.log('🔐 Probando autorización del token...\n');
  
  try {
    // 1. Obtener token
    console.log('1️⃣ Obteniendo token...');
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
    
    console.log('✅ Token obtenido');
    console.log('👤 Usuario:', loginResult.user.nombre);
    console.log('🔑 Rol:', loginResult.user.rol);
    console.log('🆔 ID:', loginResult.user.id);
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    
    // 2. Probar diferentes endpoints con el token
    console.log('\n2️⃣ Probando endpoints con token...');
    
    const endpoints = [
      {
        name: 'Crear encuesta',
        method: 'POST',
        url: '/surveys',
        data: {
          title: 'Encuesta de Prueba Token',
          question: '¿Funciona la autorización?',
          options: ['Sí', 'No']
        }
      },
      {
        name: 'Obtener encuestas (público)',
        method: 'GET',
        url: '/surveys',
        data: null
      },
      {
        name: 'Obtener encuestas activas (público)',
        method: 'GET',
        url: '/surveys/active',
        data: null
      }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n📝 Probando: ${endpoint.name}`);
      
      const options = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (endpoint.data) {
        options.body = JSON.stringify(endpoint.data);
      }
      
      try {
        const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
        
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Éxito:', result);
        } else {
          const errorText = await response.text();
          console.log('❌ Error:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            console.log('📋 Detalles:', errorJson);
          } catch (e) {
            console.log('📋 Error como texto:', errorText);
          }
        }
      } catch (error) {
        console.log('💥 Error de conexión:', error.message);
      }
    }
    
    // 3. Probar sin token para comparar
    console.log('\n3️⃣ Probando sin token (para comparar)...');
    
    try {
      const response = await fetch(`${BASE_URL}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Encuesta sin token',
          question: '¿Debería fallar?',
          options: ['Sí', 'No']
        })
      });
      
      console.log('Status sin token:', response.status);
      
      if (response.ok) {
        console.log('⚠️ ¡Debería haber fallado!');
      } else {
        const errorText = await response.text();
        console.log('✅ Error esperado sin token:', errorText);
      }
    } catch (error) {
      console.log('💥 Error de conexión:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Probando autorización del token...\n');
  
  await testTokenAuthorization();
  
  console.log('\n📋 Análisis:');
  console.log('   - Si el token funciona en endpoints públicos: ✅');
  console.log('   - Si el token falla en endpoints admin: ❌ (problema de autorización)');
  console.log('   - Si sin token falla correctamente: ✅');
  console.log('   - Si sin token funciona: ❌ (problema de seguridad)');
}

main(); 