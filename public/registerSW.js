// Registro del Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado exitosamente:', registration.scope);
        
        // Manejar actualizaciones del SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Hay una nueva versión disponible
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.log('Error al registrar SW:', error);
      });
  });
}

// Función para mostrar notificación de actualización
function showUpdateNotification() {
  // Crear notificación de actualización
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #8b5cf6;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 300px;
    ">
      <h4 style="margin: 0 0 8px 0; font-size: 16px;">Nueva versión disponible</h4>
      <p style="margin: 0 0 12px 0; font-size: 14px;">Hay una nueva versión de la aplicación disponible.</p>
      <button onclick="updateApp()" style="
        background: white;
        color: #8b5cf6;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
      ">Actualizar</button>
      <button onclick="this.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 8px;
      ">Cerrar</button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Función para actualizar la aplicación
function updateApp() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

// Manejar instalación de PWA
if (!window.deferredPrompt) {
  window.deferredPrompt = null;
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que Chrome muestre automáticamente el prompt
  e.preventDefault();
  
  // Guardar el evento para usarlo después
  window.deferredPrompt = e;
  
  // Mostrar botón de instalación personalizado
  showInstallButton();
});

function showInstallButton() {
  // Crear botón de instalación
  const installButton = document.createElement('div');
  installButton.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #8b5cf6;
      color: white;
      padding: 12px 16px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
      </svg>
      Instalar App
    </div>
  `;
  
  installButton.addEventListener('click', () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó instalar la PWA');
        }
        window.deferredPrompt = null;
        installButton.remove();
      });
    }
  });
  
  document.body.appendChild(installButton);
} 