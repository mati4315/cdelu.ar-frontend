const BASE_URL = 'http://localhost:3001/api/v1';

async function testAdminLogin() {
  console.log('🔐 Probando login del administrador...\n');
  
  try {
    // Datos del administrador según la documentación
    const loginData = {
      email: 'admin@trigamer.net',
      password: 'admin123' // Ajusta según la contraseña real
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
      
      console.log('💾 Token y usuario guardados');
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

// Probar operaciones de administración
async function testAdminOperations(token) {
  console.log('\n🔧 Probando operaciones de administración...\n');
  
  try {
    // 1. Probar actualizar encuesta
    console.log('1️⃣ Probando PUT /surveys/3...');
    const updateData = {
      title: 'Encuesta Actualizada',
      status: 'active'
    };
    
    const response = await fetch(`${BASE_URL}/surveys/3`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Encuesta actualizada:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error actualizando encuesta:', errorText);
    }
    
    // 2. Probar crear encuesta
    console.log('\n2️⃣ Probando POST /surveys...');
    const newSurveyData = {
      title: 'Nueva Encuesta de Prueba',
      description: 'Esta es una encuesta de prueba',
      question: '¿Cuál es tu color favorito?',
      options: ['Rojo', 'Azul', 'Verde'],
      is_multiple_choice: false,
      max_votes_per_user: 1
    };
    
    const response2 = await fetch(`${BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newSurveyData)
    });
    
    console.log('Status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Encuesta creada:', data2);
    } else {
      const errorText2 = await response2.text();
      console.log('❌ Error creando encuesta:', errorText2);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de administración...\n');
  
  // 1. Login
  const loginResult = await testAdminLogin();
  
  if (loginResult && loginResult.token) {
    console.log('\n✅ Login exitoso, probando operaciones...');
    await testAdminOperations(loginResult.token);
  } else {
    console.log('\n❌ No se pudo hacer login. Verifica las credenciales.');
  }
}

main(); 