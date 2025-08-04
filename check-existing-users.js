const BASE_URL = 'http://localhost:3001/api/v1';

async function checkExistingUsers() {
  console.log('👥 Verificando usuarios existentes...\n');
  
  try {
    // Intentar obtener usuarios (si el endpoint existe)
    const response = await fetch(`${BASE_URL}/users`);
    
    if (response.ok) {
      const users = await response.json();
      console.log('✅ Usuarios encontrados:', users);
    } else {
      console.log('❌ No se puede obtener lista de usuarios');
    }
  } catch (error) {
    console.log('💥 Error:', error.message);
  }
}

async function testSimpleLogin() {
  console.log('\n🔐 Probando login simple...\n');
  
  const testUsers = [
    { email: 'admin@trigamer.net', password: 'admin123' },
    { email: 'admin@cdelu.com', password: 'admin123' },
    { email: 'admin', password: 'admin' },
    { email: 'test@test.com', password: 'test' },
    { email: 'user@example.com', password: 'password' }
  ];
  
  for (const user of testUsers) {
    console.log(`📧 Probando: ${user.email}`);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      console.log('Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Login exitoso!');
        console.log('👤 Usuario:', result.user);
        console.log('🔑 Token:', result.token.substring(0, 20) + '...');
        return result;
      } else {
        const errorText = await response.text();
        console.log('❌ Error:', errorText);
      }
    } catch (error) {
      console.log('💥 Error de conexión:', error.message);
    }
    
    console.log('---');
  }
  
  return null;
}

async function createUserWithCorrectFormat() {
  console.log('\n👨‍💼 Creando usuario con formato correcto...\n');
  
  const userData = {
    nombre: 'Administrador del Sistema',
    email: 'admin@trigamer.net',
    password: 'admin123',
    rol: 'administrador'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Usuario creado exitosamente:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.log('❌ Error creando usuario:', errorText);
      
      // Intentar parsear como JSON para más detalles
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
  console.log('🚀 Verificando sistema de usuarios...\n');
  
  // 1. Verificar usuarios existentes
  await checkExistingUsers();
  
  // 2. Probar login con usuarios comunes
  const loginResult = await testSimpleLogin();
  
  if (loginResult) {
    console.log('\n✅ Usuario válido encontrado!');
    console.log('📧 Email:', loginResult.user.email);
    console.log('👤 Nombre:', loginResult.user.nombre);
    console.log('🔑 Rol:', loginResult.user.rol);
  } else {
    console.log('\n❌ No se encontraron usuarios válidos');
    console.log('\n🔄 Intentando crear usuario administrador...');
    
    const createdUser = await createUserWithCorrectFormat();
    
    if (createdUser) {
      console.log('\n✅ Usuario administrador creado exitosamente!');
      console.log('📧 Email:', createdUser.email);
      console.log('👤 Nombre:', createdUser.nombre);
      console.log('🔑 Rol:', createdUser.rol);
    } else {
      console.log('\n❌ No se pudo crear el usuario administrador');
      console.log('\n📋 Próximos pasos:');
      console.log('   1. Verificar la base de datos');
      console.log('   2. Verificar el endpoint de registro');
      console.log('   3. Crear usuario manualmente en la base de datos');
    }
  }
}

main(); 