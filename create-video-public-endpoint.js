#!/usr/bin/env node

/**
 * 🎥 Crear Endpoint Público de Video - Script Temporal
 * 
 * Este script crea una solución temporal para el endpoint público
 * mientras se implementa en el backend real
 * Fecha: 29 de Septiembre, 2025
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1';

async function main() {
  console.log('🎥 [INICIO] Creando endpoint público temporal');
  console.log('');
  
  // Primero vamos a ver si podemos obtener la configuración actual del admin
  console.log('📡 [PASO 1] Obteniendo configuración actual...');
  
  try {
    // Intentar obtener configuración actual (probablemente falle por auth)
    const response = await axios.get(`${API_BASE}/admin/video-settings`);
    console.log('✅ Configuración obtenida:', response.data);
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('⚠️  Como esperado, endpoint admin requiere autenticación');
      console.log('');
      
      // Crear configuración por defecto
      console.log('📝 [PASO 2] El backend necesita implementar el endpoint público');
      console.log('');
      console.log('🔧 SOLUCIÓN INMEDIATA:');
      console.log('');
      console.log('1. Localiza tu archivo de rutas del backend (routes/ o src/routes/)');
      console.log('2. Agrega este código:');
      console.log('');
      console.log('```javascript');
      console.log('// GET /api/v1/video-settings/public');
      console.log('app.get("/api/v1/video-settings/public", async (req, res) => {');
      console.log('  try {');
      console.log('    // Obtener de la misma tabla que usa el endpoint admin');
      console.log('    const settings = await db.query(');
      console.log('      "SELECT * FROM admin_settings WHERE setting_key = ?",');
      console.log('      ["video_enabled"]');
      console.log('    );');
      console.log('');
      console.log('    if (settings.length === 0) {');
      console.log('      // Valores por defecto');
      console.log('      return res.json({');
      console.log('        isVideoEnabled: true,');
      console.log('        lastModified: new Date().toISOString(),');
      console.log('        modifiedBy: "Sistema"');
      console.log('      });');
      console.log('    }');
      console.log('');
      console.log('    const setting = settings[0];');
      console.log('    res.json({');
      console.log('      isVideoEnabled: setting.setting_value === "true",');
      console.log('      lastModified: setting.modified_at,');
      console.log('      modifiedBy: setting.modified_by || "Sistema"');
      console.log('    });');
      console.log('');
      console.log('  } catch (error) {');
      console.log('    console.error("Error:", error);');
      console.log('    res.status(500).json({ error: "Server error" });');
      console.log('  }');
      console.log('});');
      console.log('```');
      console.log('');
      console.log('3. Reinicia el backend');
      console.log('4. Ejecuta: node test-video-settings-backend.js');
      console.log('');
      
      // Mostrar alternativa temporal con localStorage
      console.log('🔄 [ALTERNATIVA TEMPORAL]');
      console.log('');
      console.log('Mientras implementas el endpoint, el frontend funcionará con localStorage.');
      console.log('');
      console.log('Para testear ahora:');
      console.log('1. Abre la web como administrador');
      console.log('2. Cambia el estado del video (activar/desactivar)');
      console.log('3. Recarga la página o abre en otra pestaña');
      console.log('4. El estado debería mantenerse via localStorage');
      console.log('');
      console.log('⚠️  IMPORTANTE: Sin el endpoint público, los usuarios normales');
      console.log('   no verán los cambios que hagas como admin hasta que recarguen.');
    }
  }
}

main().catch(console.error);
