#!/usr/bin/env node

/**
 * 🎥 Test del Sistema de Video Settings - Backend
 * 
 * Este script verifica y crea el endpoint público de video settings
 * Fecha: 29 de Septiembre, 2025
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1';

// Función para testear endpoint público
async function testPublicVideoEndpoint() {
  console.log('🎥 [TEST] Verificando endpoint público de video...');
  
  try {
    const response = await axios.get(`${API_BASE}/video-settings/public`);
    console.log('✅ [SUCCESS] Endpoint público existe y funciona:');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ [ERROR 404] Endpoint público no existe');
      return false;
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ [ERROR] Backend no está corriendo en http://localhost:3001');
      console.log('💡 Asegúrate de que el servidor backend esté iniciado');
      return false;
    } else {
      console.log('❌ [ERROR] Error inesperado:', error.message);
      return false;
    }
  }
}

// Función para testear endpoint de admin
async function testAdminVideoEndpoint() {
  console.log('🎥 [TEST] Verificando endpoint de admin...');
  
  try {
    // Intentar sin token primero para ver si existe
    const response = await axios.get(`${API_BASE}/admin/video-settings`);
    console.log('⚠️ [WARNING] Endpoint admin existe pero no requiere autenticación');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('✅ [SUCCESS] Endpoint admin existe y requiere autenticación (correcto)');
      return true;
    } else if (error.response?.status === 404) {
      console.log('❌ [ERROR 404] Endpoint admin no existe');
      return false;
    } else {
      console.log('❌ [ERROR] Error inesperado:', error.message);
      return false;
    }
  }
}

// Función principal
async function main() {
  console.log('🚀 [INICIO] Test del sistema de video settings');
  console.log('');
  
  // Test 1: Verificar backend corriendo
  console.log('📡 [TEST 1] Verificando que backend esté corriendo...');
  try {
    await axios.get(`${API_BASE}/`);
    console.log('✅ Backend está corriendo en http://localhost:3001');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend NO está corriendo');
      console.log('');
      console.log('🔧 SOLUCIÓN:');
      console.log('1. Ve al directorio del backend');
      console.log('2. Ejecuta: npm run dev o npm start');
      console.log('3. Vuelve a ejecutar este test');
      return;
    }
  }
  
  console.log('');
  
  // Test 2: Endpoint de admin
  const adminExists = await testAdminVideoEndpoint();
  console.log('');
  
  // Test 3: Endpoint público
  const publicExists = await testPublicVideoEndpoint();
  console.log('');
  
  // Resumen y recomendaciones
  console.log('📋 [RESUMEN]');
  console.log(`Admin endpoint: ${adminExists ? '✅ Existe' : '❌ No existe'}`);
  console.log(`Public endpoint: ${publicExists ? '✅ Existe' : '❌ No existe'}`);
  console.log('');
  
  if (!publicExists) {
    console.log('🔧 [ACCIÓN REQUERIDA] Crear endpoint público');
    console.log('');
    console.log('El frontend necesita el endpoint público para funcionar globalmente.');
    console.log('Consulta el archivo BACKEND_VIDEO_REQUIREMENTS.md para implementar.');
    console.log('');
    console.log('📝 Endpoint requerido: GET /api/v1/video-settings/public');
    console.log('🔒 Sin autenticación');
    console.log('📄 Misma respuesta que el endpoint admin');
  } else {
    console.log('🎉 [SUCCESS] Sistema de video completamente funcional!');
  }
}

// Ejecutar test
main().catch(console.error);
