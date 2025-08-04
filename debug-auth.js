// Script para verificar el estado de autenticación
console.log('🔍 Verificando estado de autenticación...');

// Verificar token
const token = localStorage.getItem('token');
console.log('Token:', token ? '✅ Presente' : '❌ No encontrado');

// Verificar usuario
const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('Usuario:', user);
    console.log('Rol:', user.rol);
    console.log('Es administrador:', user.rol === 'administrador' ? '✅ Sí' : '❌ No');
  } catch (error) {
    console.error('Error parseando usuario:', error);
  }
} else {
  console.log('Usuario: ❌ No encontrado');
}

// Verificar headers de autorización
console.log('\n📋 Headers de autorización:');
if (token) {
  console.log('Authorization: Bearer', token.substring(0, 20) + '...');
} else {
  console.log('Authorization: ❌ No configurado');
} 