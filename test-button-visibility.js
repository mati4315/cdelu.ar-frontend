// Script para verificar la visibilidad del botón "Nueva Encuesta"
console.log('🔍 Verificando visibilidad del botón...');

// Función para verificar si el botón es visible
function checkButtonVisibility() {
  const button = document.querySelector('button');
  if (button) {
    const rect = button.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    
    console.log('📊 Información del botón:');
    console.log('   - Posición top:', rect.top);
    console.log('   - Posición bottom:', rect.bottom);
    console.log('   - Altura de ventana:', window.innerHeight);
    console.log('   - Es visible:', isVisible);
    console.log('   - Z-index:', window.getComputedStyle(button).zIndex);
    
    return isVisible;
  } else {
    console.log('❌ No se encontró el botón');
    return false;
  }
}

// Función para verificar el header
function checkHeader() {
  const header = document.querySelector('header');
  if (header) {
    const rect = header.getBoundingClientRect();
    console.log('📊 Información del header:');
    console.log('   - Posición:', rect.top, rect.bottom);
    console.log('   - Altura:', rect.height);
    console.log('   - Z-index:', window.getComputedStyle(header).zIndex);
  }
}

// Ejecutar verificaciones
console.log('🚀 Iniciando verificaciones...\n');

checkHeader();
checkButtonVisibility();

// Verificar después de un pequeño delay para asegurar que todo esté cargado
setTimeout(() => {
  console.log('\n🔄 Verificación después de delay...');
  checkButtonVisibility();
}, 1000); 