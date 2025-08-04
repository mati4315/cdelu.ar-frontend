// Script para crear loterías de prueba
const BASE_URL = 'http://localhost:3001'

// Datos de prueba para loterías
const testLotteries = [
  {
    title: "Lotería Gratuita de Prueba",
    description: "Una lotería gratuita para probar el sistema",
    is_free: true,
    ticket_price: 0,
    min_tickets: 1,
    max_tickets: 50,
    num_winners: 3,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    prize_description: "Premios especiales para los ganadores",
    terms_conditions: "Términos y condiciones de la lotería"
  },
  {
    title: "Lotería de Pago Premium",
    description: "Lotería de pago con premios especiales",
    is_free: false,
    ticket_price: 100,
    min_tickets: 10,
    max_tickets: 100,
    num_winners: 5,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días
    prize_description: "Premios en efectivo y productos",
    terms_conditions: "Términos y condiciones de la lotería premium"
  },
  {
    title: "Lotería Rápida",
    description: "Lotería que termina pronto",
    is_free: true,
    ticket_price: 0,
    min_tickets: 1,
    max_tickets: 20,
    num_winners: 2,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días
    prize_description: "Premios rápidos",
    terms_conditions: "Lotería de duración corta"
  }
]

async function createTestLotteries() {
  console.log('🎰 Creando loterías de prueba...')
  
  // Primero necesitamos un token de administrador
  console.log('\n🔐 Obteniendo token de administrador...')
  
  try {
    // Login como administrador (ajusta las credenciales según tu sistema)
    const loginResponse = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    })
    
    const loginData = await loginResponse.json()
    
    if (!loginData.success) {
      console.log('❌ Error al hacer login:', loginData.message)
      console.log('💡 Asegúrate de tener un usuario administrador creado')
      return
    }
    
    const token = loginData.data.token
    console.log('✅ Token obtenido correctamente')
    
    // Crear loterías de prueba
    console.log('\n🎯 Creando loterías de prueba...')
    
    for (let i = 0; i < testLotteries.length; i++) {
      const lottery = testLotteries[i]
      console.log(`\n📝 Creando lotería ${i + 1}: ${lottery.title}`)
      
      const createResponse = await fetch(`${BASE_URL}/api/v1/lotteries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(lottery)
      })
      
      const createData = await createResponse.json()
      
      if (createData.success) {
        console.log(`✅ Lotería creada: ${createData.data.title}`)
      } else {
        console.log(`❌ Error al crear lotería: ${createData.message}`)
      }
    }
    
    console.log('\n🎉 Proceso completado!')
    console.log('🌐 Ve a http://localhost:5173/lotteries para ver las loterías')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n🔧 Verifica que:')
    console.log('1. El backend esté corriendo en puerto 3001')
    console.log('2. Tengas un usuario administrador creado')
    console.log('3. Las rutas de lotería estén configuradas')
  }
}

// Ejecutar script
createTestLotteries() 