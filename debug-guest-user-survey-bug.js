// 🐛 Debug script para el problema de usuarios invitados
// Ejecutar en la consola del navegador cuando tengas el problema

console.log('🔍 DEBUGGING: Problema de usuario invitado viendo resultados');

// Función para verificar el estado actual
function checkGuestUserState() {
  console.log('\n📊 === VERIFICACIÓN DE ESTADO ===');
  
  // 1. Verificar autenticación
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  console.log('🔐 Estado de autenticación:', {
    hasToken: !!token,
    hasUser: !!user,
    token: token ? token.substring(0, 20) + '...' : 'No token',
    user: user ? JSON.parse(user) : 'No user'
  });
  
  // 2. Verificar localStorage de votos
  const votedSurveys = localStorage.getItem('userVotedSurveys');
  console.log('📱 LocalStorage votos:', {
    hasVotedSurveys: !!votedSurveys,
    votedSurveys: votedSurveys ? JSON.parse(votedSurveys) : 'No data'
  });
  
  // 3. Verificar encuesta actual en DOM
  const surveyContainer = document.querySelector('.survey-container');
  if (surveyContainer) {
    const votingOptions = surveyContainer.querySelectorAll('.voting-option');
    const results = surveyContainer.querySelectorAll('.option-result');
    const thanksMessage = surveyContainer.querySelector('.thanks-message');
    
    console.log('🎯 Estado de encuesta en DOM:', {
      hasVotingOptions: votingOptions.length > 0,
      hasResults: results.length > 0,
      hasThanksMessage: !!thanksMessage,
      votingOptionsCount: votingOptions.length,
      resultsCount: results.length
    });
    
    // Problema detectado
    if (results.length > 0 && !token && !votedSurveys) {
      console.log('🚨 PROBLEMA DETECTADO: Usuario invitado ve resultados sin haber votado');
      return true;
    }
  } else {
    console.log('❌ No se encontró contenedor de encuesta');
  }
  
  return false;
}

// Función para limpiar estado corrupto
function fixGuestUserState() {
  console.log('\n🛠️ === APLICANDO CORRECCIÓN ===');
  
  // 1. Limpiar localStorage corrupto
  localStorage.removeItem('userVotedSurveys');
  console.log('✅ LocalStorage limpiado');
  
  // 2. Forzar recarga de encuestas si las funciones están disponibles
  if (typeof clearSurveyVotes === 'function') {
    clearSurveyVotes();
    console.log('✅ Función clearSurveyVotes ejecutada');
  }
  
  // 3. Recargar página como último recurso
  setTimeout(() => {
    console.log('🔄 Recargando página en 2 segundos...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, 1000);
}

// Función para verificar datos de backend
function checkBackendResponse() {
  console.log('\n🌐 === VERIFICANDO RESPUESTA DEL BACKEND ===');
  
  // Interceptar próxima llamada a la API
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('/surveys/active')) {
      console.log('🔍 Interceptando llamada a:', url);
      
      return originalFetch.apply(this, args).then(response => {
        if (response.ok) {
          return response.clone().json().then(data => {
            console.log('📡 Respuesta del backend:', data);
            
            if (data.data && data.data.length > 0) {
              const survey = data.data[0];
              console.log('🎯 Primera encuesta:', {
                id: survey.id,
                show_options: survey.show_options,
                has_voted: survey.has_voted,
                user_voted: survey.user_voted,
                user_votes: survey.user_votes
              });
              
              // Verificar si backend está enviando datos incorrectos
              const hasProblematicData = survey.has_voted === true || 
                                       survey.user_voted === true || 
                                       survey.show_options === false ||
                                       (survey.user_votes && survey.user_votes.length > 0);
              
              if (hasProblematicData) {
                console.log('🚨 BACKEND ENVIANDO DATOS INCORRECTOS PARA USUARIO INVITADO');
              }
            }
            
            // Restaurar fetch original
            window.fetch = originalFetch;
            return response;
          });
        }
        return response;
      });
    }
    return originalFetch.apply(this, args);
  };
  
  console.log('👀 Interceptor configurado. La próxima llamada a /surveys/active será interceptada.');
}

// Ejecutar diagnóstico automático
console.log('🚀 Iniciando diagnóstico automático...');

const hasProblem = checkGuestUserState();

if (hasProblem) {
  console.log('\n🔧 SOLUCIONES DISPONIBLES:');
  console.log('1. fixGuestUserState() - Limpia y recarga automáticamente');
  console.log('2. checkBackendResponse() - Intercepta próxima llamada al backend');
  console.log('3. Manual: Refrescar página (F5)');
  
  // Auto-fix en desarrollo
  if (window.location.hostname === 'localhost') {
    console.log('\n🤖 Aplicando auto-fix en 3 segundos...');
    setTimeout(() => {
      fixGuestUserState();
    }, 3000);
  }
} else {
  console.log('✅ No se detectaron problemas evidentes');
}

// Exponer funciones globalmente
window.checkGuestUserState = checkGuestUserState;
window.fixGuestUserState = fixGuestUserState;
window.checkBackendResponse = checkBackendResponse; 