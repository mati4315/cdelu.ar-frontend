const BASE_URL = 'http://localhost:3001/api/v1';

async function testSurveyAPI() {
  console.log('🧪 Probando API de encuestas...\n');
  
  try {
    // 1. Probar obtener encuestas activas
    console.log('1️⃣ Probando GET /surveys/active...');
    const response = await fetch(`${BASE_URL}/surveys/active?limit=5`);
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
    
    // 2. Probar obtener todas las encuestas
    console.log('\n2️⃣ Probando GET /surveys...');
    const response2 = await fetch(`${BASE_URL}/surveys`);
    console.log('Status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Respuesta exitosa:', data2);
    } else {
      const errorText2 = await response2.text();
      console.log('❌ Error:', errorText2);
    }
    
    // 3. Probar votar en una encuesta (simulado)
    console.log('\n3️⃣ Probando POST /surveys/1/vote...');
    const voteData = {
      option_ids: [1]
    };
    
    const response3 = await fetch(`${BASE_URL}/surveys/1/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(voteData)
    });
    
    console.log('Status:', response3.status);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Voto exitoso:', data3);
    } else {
      const errorText3 = await response3.text();
      console.log('❌ Error al votar:', errorText3);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
}

testSurveyAPI(); 