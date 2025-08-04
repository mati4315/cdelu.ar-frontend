// Script para iniciar sesión como administrador
const BASE_URL = 'http://localhost:3001/api/v1';

async function loginAsAdmin() {
  console.log('🔐 Iniciando sesión como administrador...');
  
  try {
    // Datos de login (ajusta según tu base de datos)
    const loginData = {
      email: 'matias4315@gmail.com', // Credenciales actualizadas
      password: 'w35115415'           // Credenciales actualizadas
    };
    
    console.log('📧 Intentando login con:', loginData.email);
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login exitoso:', data);
      
      // Guardar token y usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('💾 Token y usuario guardados en localStorage');
      console.log('👤 Usuario:', data.user);
      console.log('🔑 Token:', data.token.substring(0, 20) + '...');
      
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Error en login:', errorText);
      return null;
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    return null;
  }
}

// Función para crear un usuario administrador
async function createAdminUser() {
  console.log('👨‍💼 Creando usuario administrador...');
  
  try {
    const adminData = {
      name: 'Administrador',
      email: 'admin@cdelu.com',
      password: 'admin123',
      rol: 'administrador'
    };
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Usuario administrador creado:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Error creando usuario:', errorText);
      return null;
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
    return null;
  }
}

// Función principal
async function setupAdmin() {
  console.log('🚀 Configurando acceso de administrador...\n');
  
  // 1. Intentar crear usuario admin
  console.log('1️⃣ Creando usuario administrador...');
  const created = await createAdminUser();
  
  if (created) {
    console.log('✅ Usuario administrador creado exitosamente');
  } else {
    console.log('ℹ️ Usuario administrador ya existe o error al crear');
  }
  
  // 2. Intentar login
  console.log('\n2️⃣ Iniciando sesión como administrador...');
  const loginResult = await loginAsAdmin();
  
  if (loginResult) {
    console.log('✅ Login exitoso como administrador');
    console.log('🔄 Recarga la página para aplicar los cambios');
  } else {
    console.log('❌ Error en login. Verifica las credenciales');
  }
}

// Ejecutar
setupAdmin(); 