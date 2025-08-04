const BASE_URL = 'http://localhost:3001/api/v1';

async function debugTokenAuthorization() {
  console.log('🔍 Debuggeando token y autorización...\n');
  
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
    
    console.log('✅ Login exitoso');
    console.log('👤 Usuario:', loginResult.user.nombre);
    console.log('📧 Email:', loginResult.user.email);
    console.log('🔑 Rol:', loginResult.user.rol);
    console.log('🆔 ID:', loginResult.user.id);
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    
    // 2. Decodificar el token (JWT)
    console.log('\n2️⃣ Analizando token JWT...');
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('📋 Payload del token:', payload);
        
        if (payload.rol) {
          console.log('🔑 Rol en token:', payload.rol);
        } else {
          console.log('⚠️ No hay rol en el token');
        }
        
        if (payload.userId) {
          console.log('🆔 User ID en token:', payload.userId);
        }
        
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          console.log('⏰ Token expira:', expDate);
          console.log('⏰ Es válido:', expDate > new Date());
        }
      }
    } catch (error) {
      console.log('❌ Error decodificando token:', error.message);
    }
    
    // 3. Probar diferentes headers de autorización
    console.log('\n3️⃣ Probando diferentes formatos de autorización...');
    
    const authTests = [
      {
        name: 'Bearer token (estándar)',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      },
      {
        name: 'Token sin Bearer',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      },
      {
        name: 'Token en header personalizado',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      },
      {
        name: 'Token en query parameter',
        url: `${BASE_URL}/surveys?token=${token}`,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ];
    
    for (const test of authTests) {
      console.log(`\n📝 Probando: ${test.name}`);
      
      try {
        const response = await fetch(test.url || `${BASE_URL}/surveys`, {
          method: 'POST',
          headers: test.headers,
          body: JSON.stringify({
            title: 'Test de Autorización',
            question: '¿Funciona la autorización?',
            options: ['Sí', 'No']
          })
        });
        
        console.log('Status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Éxito:', result);
        } else {
          const errorText = await response.text();
          console.log('❌ Error:', errorText);
        }
      } catch (error) {
        console.log('💥 Error de conexión:', error.message);
      }
    }
    
    // 4. Probar endpoint público para comparar
    console.log('\n4️⃣ Probando endpoint público...');
    
    try {
      const publicResponse = await fetch(`${BASE_URL}/surveys`);
      console.log('Status endpoint público:', publicResponse.status);
      
      if (publicResponse.ok) {
        const publicResult = await publicResponse.json();
        console.log('✅ Endpoint público funciona');
      } else {
        const errorText = await publicResponse.text();
        console.log('❌ Error endpoint público:', errorText);
      }
    } catch (error) {
      console.log('💥 Error endpoint público:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Debuggeando autorización...\n');
  
  await debugTokenAuthorization();
  
  console.log('\n📋 Posibles problemas:');
  console.log('   1. Token malformado');
  console.log('   2. Rol no incluido en el token');
  console.log('   3. Middleware de autorización defectuoso');
  console.log('   4. Configuración incorrecta del backend');
  console.log('   5. Problema de CORS o headers');
}

main(); 