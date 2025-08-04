const BASE_URL = 'http://localhost:3001/api/v1';

async function testCreateSurvey() {
  console.log('📝 Probando creación de encuesta...\n');
  
  try {
    // 1. Primero hacer login para obtener token
    console.log('1️⃣ Haciendo login...');
    const loginData = {
      email: 'admin@trigamer.net',
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
    console.log('✅ Login exitoso, token obtenido');
    
    // 2. Probar diferentes formatos de datos para crear encuesta
    const testCases = [
      {
        name: 'Datos completos válidos',
        data: {
          title: 'Encuesta de Prueba Frontend',
          description: 'Esta es una encuesta de prueba creada desde el frontend',
          question: '¿Cuál es tu deporte favorito?',
          options: ['Fútbol', 'Básquet', 'Tenis', 'Otro'],
          is_multiple_choice: false,
          max_votes_per_user: 1,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        name: 'Datos mínimos',
        data: {
          title: 'Encuesta Mínima',
          question: '¿Te gusta este sitio?',
          options: ['Sí', 'No']
        }
      },
      {
        name: 'Datos con selección múltiple',
        data: {
          title: 'Encuesta Múltiple',
          question: '¿Qué colores te gustan?',
          options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
          is_multiple_choice: true,
          max_votes_per_user: 2
        }
      },
      {
        name: 'Datos con fecha de expiración',
        data: {
          title: 'Encuesta con Expiración',
          question: '¿Cuál es tu fruta favorita?',
          options: ['Manzana', 'Banana', 'Naranja'],
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n2️⃣ Probando: ${testCase.name}`);
      console.log('📋 Datos:', testCase.data);
      
      try {
        const response = await fetch(`${BASE_URL}/surveys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(testCase.data)
        });
        
        console.log('Status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Éxito:', result);
        } else {
          const errorText = await response.text();
          console.log('❌ Error:', errorText);
          
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
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función para verificar la estructura esperada
function checkExpectedStructure() {
  console.log('\n📋 Estructura esperada para crear encuesta:');
  console.log(`
  {
    "title": "string (requerido)",
    "description": "string (opcional)",
    "question": "string (requerido)",
    "options": ["array de strings (mínimo 2, máximo 10)"],
    "is_multiple_choice": "boolean (opcional, default: false)",
    "max_votes_per_user": "number (opcional, default: 1)",
    "expires_at": "string ISO date (opcional)"
  }
  `);
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de creación de encuestas...\n');
  
  checkExpectedStructure();
  await testCreateSurvey();
  
  console.log('\n🎯 Pruebas completadas');
  console.log('\n📋 Posibles causas del error 400:');
  console.log('   1. Datos faltantes o inválidos');
  console.log('   2. Validaciones del backend');
  console.log('   3. Formato de fecha incorrecto');
  console.log('   4. Opciones insuficientes o excesivas');
  console.log('   5. Campos requeridos faltantes');
}

main(); 