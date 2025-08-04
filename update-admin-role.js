const BASE_URL = 'http://localhost:3001/api/v1';

async function updateUserRole() {
  console.log('👨‍💼 Actualizando rol de usuario a administrador...\n');
  
  try {
    // 1. Primero hacer login
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
    console.log('✅ Login exitoso');
    console.log('👤 Usuario actual:', loginResult.user);
    console.log('🔑 Rol actual:', loginResult.user.rol);
    
    // 2. Intentar actualizar el rol (si hay endpoint)
    console.log('\n2️⃣ Intentando actualizar rol...');
    
    // Opción 1: Endpoint de actualización de perfil
    const updateResponse = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginResult.token}`
      },
      body: JSON.stringify({
        rol: 'administrador'
      })
    });
    
    console.log('Status actualización:', updateResponse.status);
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Rol actualizado exitosamente');
      console.log('👤 Usuario actualizado:', updateResult.user);
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Error actualizando rol:', errorText);
      
      console.log('\n📋 Solución manual:');
      console.log('   1. Conectar a la base de datos');
      console.log('   2. Ejecutar: UPDATE users SET rol = "administrador" WHERE email = "admin@cdelu.ar";');
      console.log('   3. Verificar: SELECT email, rol FROM users WHERE email = "admin@cdelu.ar";');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Función para verificar el rol actual
async function checkCurrentRole() {
  console.log('\n🔍 Verificando rol actual...\n');
  
  try {
    const loginData = {
      email: 'admin@cdelu.ar',
      password: 'admin123'
    };
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('👤 Usuario:', result.user.nombre);
      console.log('📧 Email:', result.user.email);
      console.log('🔑 Rol:', result.user.rol);
      console.log('🆔 ID:', result.user.id);
      
      if (result.user.rol === 'administrador') {
        console.log('✅ El usuario ya tiene rol de administrador');
      } else {
        console.log('❌ El usuario NO tiene rol de administrador');
        console.log('💡 Necesita actualizar el rol en la base de datos');
      }
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Verificando y actualizando rol de administrador...\n');
  
  await checkCurrentRole();
  await updateUserRole();
  
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Si el rol no se actualizó, hacerlo manualmente en la base de datos');
  console.log('   2. Probar crear encuesta nuevamente');
  console.log('   3. Verificar que el frontend funcione correctamente');
}

main(); 