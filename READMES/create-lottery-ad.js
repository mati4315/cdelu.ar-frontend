const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api/v1';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjZGVsdS5hciIsInJvbCI6ImFkbWluIiwiaWF0IjoxNzQ4NjA5ODE0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Token de admin

/**
 * Verifica si hay loterías activas
 */
async function checkActiveLotteries() {
    try {
        console.log('🔍 Verificando loterías activas...');
        
        const response = await axios.get(`${BASE_URL}/lotteries?status=active&limit=50`);
        
        if (response.data.success) {
            const activeLotteries = response.data.data.filter(lottery => {
                // Verificar que la lotería esté realmente activa y en ejecución
                return lottery.status === 'active' && lottery.current_status === 'running';
            });
            
            console.log(`✅ Encontradas ${activeLotteries.length} loterías activas`);
            
            if (activeLotteries.length > 0) {
                console.log('📋 Loterías activas:');
                activeLotteries.forEach(lottery => {
                    console.log(`  - ${lottery.title} (ID: ${lottery.id})`);
                });
                
                return activeLotteries;
            } else {
                console.log('❌ No hay loterías activas en ejecución');
                return [];
            }
        }
        
        return [];
    } catch (error) {
        console.error('❌ Error verificando loterías activas:', error.message);
        return [];
    }
}

/**
 * Crea o actualiza el anuncio especial de lotería
 */
async function createLotteryAd(activeLotteries) {
    try {
        console.log('🎰 Creando anuncio especial de lotería...');
        
        const lotteryAd = {
            titulo: "🎰 ¡Loterías Activas!",
            descripcion: `¡Participa en nuestras loterías activas! Tenemos ${activeLotteries.length} lotería${activeLotteries.length > 1 ? 's' : ''} en ejecución con premios increíbles. ¡No te pierdas la oportunidad de ganar!`,
            enlace_destino: "/lottery.html",
            texto_opcional: `Anuncio dinámico - ${activeLotteries.length} lotería${activeLotteries.length > 1 ? 's' : ''} activa${activeLotteries.length > 1 ? 's' : ''}`,
            categoria: "eventos",
            prioridad: 3,
            activo: true,
            impresiones_maximas: 0
        };
        
        // Verificar si ya existe un anuncio de lotería
        const existingAdsResponse = await axios.get(`${BASE_URL}/ads?categoria=eventos&limit=50`, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        
        let existingLotteryAd = null;
        if (existingAdsResponse.data.success) {
            existingLotteryAd = existingAdsResponse.data.data.find(ad => 
                ad.titulo.includes('🎰') && ad.categoria === 'eventos'
            );
        }
        
        if (existingLotteryAd) {
            console.log('🔄 Actualizando anuncio existente...');
            
            // Actualizar anuncio existente
            const updateResponse = await axios.put(`${BASE_URL}/ads/${existingLotteryAd.id}`, {
                ...lotteryAd,
                activo: activeLotteries.length > 0 // Solo activo si hay loterías
            }, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            
            if (updateResponse.data.success) {
                console.log('✅ Anuncio de lotería actualizado exitosamente');
                console.log(`📊 Estado: ${activeLotteries.length > 0 ? 'ACTIVO' : 'INACTIVO'}`);
                return updateResponse.data.data;
            }
        } else {
            console.log('🆕 Creando nuevo anuncio de lotería...');
            
            // Crear nuevo anuncio
            const createResponse = await axios.post(`${BASE_URL}/ads`, lotteryAd, {
                headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
            });
            
            if (createResponse.data.success) {
                console.log('✅ Anuncio de lotería creado exitosamente');
                console.log(`📊 Estado: ${activeLotteries.length > 0 ? 'ACTIVO' : 'INACTIVO'}`);
                return createResponse.data.data;
            }
        }
        
    } catch (error) {
        console.error('❌ Error creando anuncio de lotería:', error.response?.data || error.message);
    }
}

/**
 * Función principal que ejecuta todo el proceso
 */
async function manageLotteryAd() {
    try {
        console.log('🚀 Iniciando gestión automática de anuncio de lotería...\n');
        
        // 1. Verificar loterías activas
        const activeLotteries = await checkActiveLotteries();
        
        // 2. Crear o actualizar anuncio
        const lotteryAd = await createLotteryAd(activeLotteries);
        
        if (lotteryAd) {
            console.log('\n📋 Resumen del anuncio:');
            console.log(`  Título: ${lotteryAd.titulo}`);
            console.log(`  Estado: ${lotteryAd.activo ? 'ACTIVO' : 'INACTIVO'}`);
            console.log(`  Prioridad: ${lotteryAd.prioridad}`);
            console.log(`  Categoría: ${lotteryAd.categoria}`);
            console.log(`  Enlace: ${lotteryAd.enlace_destino}`);
        }
        
        console.log('\n✅ Proceso completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
    }
}

/**
 * Función para ejecutar en modo automático (cada 5 minutos)
 */
function startAutoMode() {
    console.log('🔄 Modo automático iniciado - ejecutando cada 5 minutos...');
    
    // Ejecutar inmediatamente
    manageLotteryAd();
    
    // Ejecutar cada 5 minutos
    setInterval(manageLotteryAd, 5 * 60 * 1000);
}

// Ejecutar según argumentos
if (process.argv.includes('--auto')) {
    startAutoMode();
} else {
    manageLotteryAd();
}

module.exports = {
    checkActiveLotteries,
    createLotteryAd,
    manageLotteryAd
}; 