const BASE_URL = 'http://localhost:3001/api/v1';

async function testDateFormats() {
  console.log('📅 Probando diferentes formatos de fecha...\n');
  
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
    
    // 2. Probar diferentes formatos de fecha
    console.log('\n2️⃣ Probando diferentes formatos de fecha...');
    
    const testCases = [
      {
        name: 'Sin fecha de expiración',
        data: {
          title: 'Test Sin Fecha',
          description: 'Encuesta sin fecha de expiración',
          question: '¿Funciona sin fecha?',
          options: ['Sí', 'No'],
          is_multiple_choice: false,
          max_votes_per_user: 1
        }
      },
      {
        name: 'Fecha ISO completa',
        data: {
          title: 'Test Fecha ISO',
          description: 'Encuesta con fecha ISO completa',
          question: '¿Funciona con fecha ISO?',
          options: ['Sí', 'No'],
          is_multiple_choice: false,
          max_votes_per_user: 1,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        name: 'Fecha ISO sin milisegundos',
        data: {
          title: 'Test Fecha ISO Simple',
          description: 'Encuesta con fecha ISO simple',
          question: '¿Funciona con fecha ISO simple?',
          options: ['Sí', 'No'],
          is_multiple_choice: false,
          max_votes_per_user: 1,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z'
        }
      },
      {
        name: 'Fecha en formato YYYY-MM-DD',
        data: {
          title: 'Test Fecha Simple',
          description: 'Encuesta con fecha simple',
          question: '¿Funciona con fecha simple?',
          options: ['Sí', 'No'],
          is_multiple_choice: false,
          max_votes_per_user: 1,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      },
      {
        name: 'Fecha en formato YYYY-MM-DDTHH:mm',
        data: {
          title: 'Test Fecha Local',
          description: 'Encuesta con fecha local',
          question: '¿Funciona con fecha local?',
          options: ['Sí', 'No'],
          is_multiple_choice: false,
          max_votes_per_user: 1,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
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

// Función principal
async function main() {
  console.log('🚀 Probando formatos de fecha para expires_at...\n');
  
  await testDateFormats();
  
  console.log('\n📋 Posibles problemas:');
  console.log('   1. Formato de fecha incorrecto');
  console.log('   2. Fecha en el pasado');
  console.log('   3. Validación específica del backend');
  console.log('   4. Campo expires_at no requerido');
}

main(); 