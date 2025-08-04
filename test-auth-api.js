const BASE_URL = 'http://localhost:3001/api/v1';

async function testAuthAPI() {
  console.log('🔐 Probando API con autenticación...\n');
  
  // Simular token de administrador (reemplaza con un token real)
  const adminToken = 'tu_token_de_admin_aqui';
  
  try {
    // 1. Probar crear encuesta (requiere admin)
    console.log('1️⃣ Probando POST /surveys (crear encuesta)...');
    const surveyData = {
      title: 'Encuesta de Prueba',
      description: 'Esta es una encuesta de prueba',
      question: '¿Cuál es tu fruta favorita?',
      options: ['Manzana', 'Banana', 'Naranja'],
      is_multiple_choice: false,
      max_votes_per_user: 1
    };
    
    const response = await fetch(`${BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(surveyData)
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Encuesta creada:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error creando encuesta:', errorText);
    }
    
    // 2. Probar votar sin autenticación
    console.log('\n2️⃣ Probando POST /surveys/1/vote (sin auth)...');
    const voteData = { option_ids: [1] };
    
    const response2 = await fetch(`${BASE_URL}/surveys/1/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(voteData)
    });
    
    console.log('Status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Voto exitoso:', data2);
    } else {
      const errorText2 = await response2.text();
      console.log('❌ Error al votar:', errorText2);
    }
    
    // 3. Probar votar con autenticación
    console.log('\n3️⃣ Probando POST /surveys/1/vote (con auth)...');
    
    const response3 = await fetch(`${BASE_URL}/surveys/1/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(voteData)
    });
    
    console.log('Status:', response3.status);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Voto exitoso con auth:', data3);
    } else {
      const errorText3 = await response3.text();
      console.log('❌ Error al votar con auth:', errorText3);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
}

testAuthAPI(); 