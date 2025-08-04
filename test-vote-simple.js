const BASE_URL = 'http://localhost:3001/api/v1';

async function testVoteSimple() {
  console.log('🗳️ Probando endpoint de votación (versión simple)...\n');
  
  try {
    // 1. Obtener encuesta
    console.log('1️⃣ Obteniendo encuesta ID 3...');
    const surveyResponse = await fetch(`${BASE_URL}/surveys/3`);
    
    if (!surveyResponse.ok) {
      console.log(`❌ Error HTTP: ${surveyResponse.status}`);
      const errorText = await surveyResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const surveyData = await surveyResponse.json();
    
    if (!surveyData.success) {
      console.log('❌ Error obteniendo encuesta:', surveyData.message);
      return;
    }
    
    const survey = surveyData.data;
    console.log(`✅ Encuesta obtenida: "${survey.title}"`);
    console.log(`   - Estado: ${survey.status}`);
    console.log(`   - Total votos: ${survey.total_votes}`);
    console.log(`   - Opciones: ${survey.options.length}`);
    
    if (survey.options.length === 0) {
      console.log('❌ No hay opciones disponibles para votar');
      return;
    }
    
    // Mostrar opciones
    console.log('\n📋 Opciones disponibles:');
    survey.options.forEach(option => {
      console.log(`   - ID: ${option.id}, Texto: "${option.option_text}", Votos: ${option.votes_count}`);
    });
    
    // 2. Probar votación
    console.log('\n2️⃣ Probando votación...');
    const voteData = {
      option_ids: [survey.options[0].id]
    };
    
    console.log('📝 Datos de voto:', voteData);
    
    const voteResponse = await fetch(`${BASE_URL}/surveys/3/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(voteData)
    });
    
    console.log('Status:', voteResponse.status);
    console.log('Status Text:', voteResponse.statusText);
    
    if (voteResponse.ok) {
      const voteResult = await voteResponse.json();
      console.log('✅ Voto exitoso:', voteResult);
    } else {
      const errorText = await voteResponse.text();
      console.log('❌ Error en votación:', errorText);
      
      // Intentar parsear como JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Detalles del error:', errorJson);
      } catch (e) {
        console.log('📋 Error como texto:', errorText);
      }
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
}

// Función para probar diferentes escenarios
async function testDifferentScenarios() {
  console.log('\n🧪 Probando diferentes escenarios...\n');
  
  const scenarios = [
    {
      name: 'Voto simple',
      data: { option_ids: [1] }
    },
    {
      name: 'Voto múltiple',
      data: { option_ids: [1, 2] }
    },
    {
      name: 'Sin opciones',
      data: { option_ids: [] }
    },
    {
      name: 'Opción inexistente',
      data: { option_ids: [999] }
    }
  ];
  
  for (const scenario of scenarios) {
    console.log(`\n📝 Probando: ${scenario.name}`);
    console.log('Datos:', scenario.data);
    
    try {
      const response = await fetch(`${BASE_URL}/surveys/3/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenario.data)
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
}

// Función para verificar el servidor
async function checkServer() {
  console.log('🔍 Verificando servidor...\n');
  
  try {
    // Probar endpoint básico
    const response = await fetch(`${BASE_URL}/surveys/active`);
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor responde correctamente');
      console.log(`   - Encuestas activas: ${data.data?.length || 0}`);
    } else {
      console.log('❌ Servidor no responde correctamente');
    }
  } catch (error) {
    console.error('💥 Error conectando al servidor:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de votación...\n');
  
  await checkServer();
  await testVoteSimple();
  await testDifferentScenarios();
  
  console.log('\n🎯 Pruebas completadas');
  console.log('\n📋 Posibles soluciones para el error 500:');
  console.log('   1. Ejecutar: node setup-surveys-database.js');
  console.log('   2. Verificar que el backend esté corriendo');
  console.log('   3. Revisar logs del backend');
  console.log('   4. Verificar conexión a la base de datos');
  console.log('   5. Comprobar que las tablas existan');
}

main(); 