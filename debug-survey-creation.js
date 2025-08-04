const BASE_URL = 'http://localhost:3001/api/v1';

async function debugSurveyCreation() {
  console.log('🔍 Debuggeando creación de encuestas...\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginData = {
      email: 'matias4315@gmail.com',
      password: 'w35115415'
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
    
    // 2. Probar diferentes formatos de datos
    console.log('\n2️⃣ Probando diferentes formatos...');
    
    const testCases = [
      {
        name: 'Formato mínimo',
        data: {
          title: 'Test Mínimo',
          question: '¿Funciona?',
          options: ['Sí', 'No']
        }
      },
      {
        name: 'Formato completo',
        data: {
          title: 'Test Completo',
          description: 'Descripción de prueba',
          question: '¿Cuál es tu color favorito?',
          options: ['Rojo', 'Azul', 'Verde'],
          is_multiple_choice: false,
          max_votes_per_user: 1
        }
      },
      {
        name: 'Formato simple',
        data: {
          title: 'Encuesta Simple',
          question: '¿Te gusta este sitio?',
          options: ['Sí', 'No', 'Tal vez']
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📝 Probando: ${testCase.name}`);
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
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Éxito:', result);
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
      
      console.log('---');
    }
    
    // 3. Verificar base de datos
    console.log('\n3️⃣ Verificando estado de la base de datos...');
    
    try {
      const surveysResponse = await fetch(`${BASE_URL}/surveys`);
      if (surveysResponse.ok) {
        const surveys = await surveysResponse.json();
        console.log('📊 Encuestas existentes:', surveys.length);
        
        if (surveys.length > 0) {
          console.log('📋 Última encuesta:', surveys[surveys.length - 1]);
        }
      }
    } catch (error) {
      console.log('❌ Error verificando encuestas:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Debuggeando error 500 en creación de encuestas...\n');
  
  await debugSurveyCreation();
  
  console.log('\n📋 Posibles causas del error 500:');
  console.log('   1. Problema en la base de datos');
  console.log('   2. Error en el controlador del backend');
  console.log('   3. Validación de datos fallida');
  console.log('   4. Problema de conexión a la BD');
  console.log('   5. Error en el middleware');
}

main(); 