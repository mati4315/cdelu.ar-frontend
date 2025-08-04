const BASE_URL = 'http://localhost:3001/api/v1';

async function testDataFormats() {
  console.log('📝 Probando diferentes formatos de datos...\n');
  
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
    
    // 2. Probar diferentes formatos de datos
    const testCases = [
      {
        name: 'Formato mínimo válido',
        data: {
          title: 'Encuesta Mínima',
          question: '¿Te gusta este sitio?',
          options: ['Sí', 'No']
        }
      },
      {
        name: 'Formato completo válido',
        data: {
          title: 'Encuesta Completa',
          description: 'Esta es una encuesta de prueba',
          question: '¿Cuál es tu color favorito?',
          options: ['Rojo', 'Azul', 'Verde'],
          is_multiple_choice: false,
          max_votes_per_user: 1
        }
      },
      {
        name: 'Formato con selección múltiple',
        data: {
          title: 'Encuesta Múltiple',
          question: '¿Qué colores te gustan?',
          options: ['Rojo', 'Azul', 'Verde', 'Amarillo'],
          is_multiple_choice: true,
          max_votes_per_user: 2
        }
      },
      {
        name: 'Formato con fecha de expiración',
        data: {
          title: 'Encuesta con Expiración',
          question: '¿Cuál es tu fruta favorita?',
          options: ['Manzana', 'Banana', 'Naranja'],
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        name: 'Formato con todos los campos',
        data: {
          title: 'Encuesta Completa',
          description: 'Descripción de la encuesta',
          question: '¿Cuál es tu deporte favorito?',
          options: ['Fútbol', 'Básquet', 'Tenis', 'Natación'],
          is_multiple_choice: false,
          max_votes_per_user: 1,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n2️⃣ Probando: ${testCase.name}`);
      console.log('📋 Datos:', JSON.stringify(testCase.data, null, 2));
      
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
          
          try {
            const errorJson = JSON.parse(errorText);
            console.log('📋 Detalles del error:', errorJson);
            
            if (errorJson.details) {
              console.log('🔍 Detalles de validación:');
              errorJson.details.forEach((detail, index) => {
                console.log(`   ${index + 1}. Campo: ${detail.instancePath || 'N/A'}`);
                console.log(`      Error: ${detail.message}`);
                console.log(`      Valor: ${detail.params?.value || 'N/A'}`);
              });
            }
          } catch (e) {
            console.log('📋 Error como texto:', errorText);
          }
        }
      } catch (error) {
        console.log('💥 Error de conexión:', error.message);
      }
      
      console.log('---');
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función para mostrar la estructura esperada
function showExpectedStructure() {
  console.log('\n📋 Estructura esperada por el backend:');
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
  console.log('🚀 Probando formatos de datos para crear encuestas...\n');
  
  showExpectedStructure();
  await testDataFormats();
  
  console.log('\n📋 Posibles problemas:');
  console.log('   1. Campos requeridos faltantes');
  console.log('   2. Formato de fecha incorrecto');
  console.log('   3. Tipos de datos incorrectos');
  console.log('   4. Validaciones específicas del backend');
  console.log('   5. Campos adicionales no esperados');
}

main(); 