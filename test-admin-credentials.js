const BASE_URL = 'http://localhost:3001/api/v1';

async function testAdminCredentials() {
  console.log('🔐 Probando credenciales de administrador...\n');
  
  const credentials = [
    {
      name: 'admin@trigamer.net',
      email: 'admin@trigamer.net',
      password: 'admin123'
    },
    {
      name: 'admin@cdelu.com',
      email: 'admin@cdelu.com',
      password: 'admin123'
    },
    {
      name: 'admin@example.com',
      email: 'admin@example.com',
      password: 'admin123'
    },
    {
      name: 'admin',
      email: 'admin',
      password: 'admin'
    },
    {
      name: 'admin@trigamer.net',
      email: 'admin@trigamer.net',
      password: 'password'
    }
  ];
  
  for (const cred of credentials) {
    console.log(`📧 Probando: ${cred.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cred.email,
          password: cred.password
        })
      });
      
      console.log('Status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Login exitoso:', result);
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
  
  console.log('❌ Ninguna credencial funcionó');
  return null;
}

// Función para crear un usuario administrador
async function createAdminUser() {
  console.log('\n👨‍💼 Intentando crear usuario administrador...\n');
  
  const adminData = {
    nombre: 'Administrador',
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
      body: JSON.stringify(adminData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Usuario administrador creado:', result);
      return result;
    } else {
      const errorText = await response.text();
      console.log('❌ Error creando usuario:', errorText);
    }
  } catch (error) {
    console.log('💥 Error de conexión:', error.message);
  }
  
  return null;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de credenciales...\n');
  
  // 1. Intentar crear usuario admin
  console.log('1️⃣ Creando usuario administrador...');
  await createAdminUser();
  
  // 2. Probar credenciales
  console.log('\n2️⃣ Probando credenciales...');
  const loginResult = await testAdminCredentials();
  
  if (loginResult) {
    console.log('\n✅ Credenciales encontradas!');
    console.log('📧 Email:', loginResult.user.email);
    console.log('👤 Nombre:', loginResult.user.name);
    console.log('🔑 Rol:', loginResult.user.rol);
  } else {
    console.log('\n❌ No se encontraron credenciales válidas');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Verificar que el backend esté corriendo');
    console.log('   2. Verificar la base de datos');
    console.log('   3. Crear manualmente un usuario administrador');
  }
}

main(); 