// Test rápido de URL de loterías
console.log('🔍 Verificando configuración de URLs...')

const BASE_URL = 'http://localhost:3001'
const baseURL = `${BASE_URL}/api/v1`
const baseUrl = '/lotteries'
const filters = 'page=1&limit=12'

const finalURL = `${baseURL}${baseUrl}?${filters}`

console.log('📋 Configuración:')
console.log('- BASE_URL:', BASE_URL)
console.log('- baseURL:', baseURL)
console.log('- baseUrl:', baseUrl)
console.log('- filters:', filters)
console.log()
console.log('🎯 URL Final:', finalURL)
console.log()

if (finalURL === 'http://localhost:3001/api/v1/lotteries?page=1&limit=12') {
  console.log('✅ URL correcta!')
} else {
  console.log('❌ URL incorrecta!')
}

// Test de fetch
console.log('🌐 Probando conexión...')
fetch(finalURL)
  .then(response => {
    console.log('✅ Status:', response.status)
    return response.json()
  })
  .then(data => {
    console.log('📊 Respuesta:', data)
  })
  .catch(error => {
    console.log('❌ Error:', error.message)
  }) 