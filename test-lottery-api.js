// Script de prueba para verificar la API de loterías
const BASE_URL = 'http://localhost:3001'

async function testLotteryAPI() {
  console.log('🧪 Probando API de Loterías...')
  
  try {
    // Test 1: Obtener loterías
    console.log('\n1️⃣ Probando GET /api/v1/lotteries...')
    const response = await fetch(`${BASE_URL}/api/v1/lotteries`)
    const data = await response.json()
    
    console.log('✅ Status:', response.status)
    console.log('📊 Respuesta:', data)
    
    if (response.ok) {
      console.log('✅ API de loterías funcionando correctamente')
    } else {
      console.log('❌ Error en la API')
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
    console.log('\n🔧 Soluciones posibles:')
    console.log('1. Verificar que el backend esté corriendo en puerto 3001')
    console.log('2. Verificar que las rutas de lotería estén configuradas')
    console.log('3. Verificar que la base de datos esté conectada')
  }
}

// Ejecutar prueba
testLotteryAPI() 