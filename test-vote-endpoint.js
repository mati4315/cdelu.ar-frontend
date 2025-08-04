const BASE_URL = 'http://localhost:3001/api/v1';

async function testVoteEndpoint() {
  console.log('🗳️ Probando endpoint de votación...\n');
  
  try {
    // 1. Obtener encuesta para ver las opciones disponibles
    console.log('1️⃣ Obteniendo encuesta ID 3...');
    const surveyResponse = await fetch(`${BASE_URL}/surveys/3`);
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
    
    // Mostrar opciones disponibles
    console.log('\n📋 Opciones disponibles:');
    survey.options.forEach(option => {
      console.log(`   - ID: ${option.id}, Texto: "${option.option_text}", Votos: ${option.votes_count}`);
    });
    
    // 2. Probar votación
    console.log('\n2️⃣ Probando votación...');
    const voteData = {
      option_ids: [survey.options[0].id] // Votar por la primera opción
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
    console.log('Headers:', Object.fromEntries(voteResponse.headers.entries()));
    
    if (voteResponse.ok) {
      const voteResult = await voteResponse.json();
      console.log('✅ Voto exitoso:', voteResult);
    } else {
      const errorText = await voteResponse.text();
      console.log('❌ Error en votación:', errorText);
      
      // Intentar parsear como JSON para más detalles
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Detalles del error:', errorJson);
      } catch (e) {
        console.log('📋 Error como texto:', errorText);
      }
    }
    
    // 3. Verificar si el voto se registró
    console.log('\n3️⃣ Verificando si el voto se registró...');
    const verifyResponse = await fetch(`${BASE_URL}/surveys/3`);
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      const updatedSurvey = verifyData.data;
      console.log(`✅ Encuesta actualizada: ${updatedSurvey.total_votes} votos totales`);
      
      // Mostrar opciones actualizadas
      console.log('\n📊 Opciones actualizadas:');
      updatedSurvey.options.forEach(option => {
        console.log(`   - "${option.option_text}": ${option.votes_count} votos`);
      });
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
}

// Función para probar con diferentes datos
async function testVoteWithDifferentData() {
  console.log('\n🧪 Probando con diferentes datos de voto...\n');
  
  const testCases = [
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
    },
    {
      name: 'Datos malformados',
      data: { option_ids: 'invalid' }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Probando: ${testCase.name}`);
    console.log('Datos:', testCase.data);
    
    try {
      const response = await fetch(`${BASE_URL}/surveys/3/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      }
    } catch (error) {
      console.log('💥 Error de conexión:', error.message);
    }
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de votación...\n');
  
  await testVoteEndpoint();
  await testVoteWithDifferentData();
  
  console.log('\n🎯 Pruebas completadas');
  console.log('\n📋 Posibles causas del error 500:');
  console.log('   1. Base de datos no configurada');
  console.log('   2. Triggers faltantes');
  console.log('   3. Restricciones únicas problemáticas');
  console.log('   4. Error en el código del backend');
  console.log('   5. Problema de conexión a la base de datos');
}

main(); 