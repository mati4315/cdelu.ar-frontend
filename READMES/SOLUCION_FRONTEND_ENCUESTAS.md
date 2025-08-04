const pool = require('./src/config/database');

async function checkSurveyStatus() {
  console.log('🔍 Verificando estado de las encuestas...\n');
  
  try {
    // 1. Verificar todas las encuestas
    console.log('1️⃣ Todas las encuestas:');
    const [allSurveys] = await pool.execute('SELECT id, question, status, expires_at FROM surveys ORDER BY id');
    console.log(`📊 Total de encuestas: ${allSurveys.length}`);
    
    allSurveys.forEach(survey => {
      console.log(`   - ID: ${survey.id}, Estado: "${survey.status}", Expira: ${survey.expires_at || 'No expira'}`);
    });
    
    // 2. Verificar encuestas activas según la lógica del controlador
    console.log('\n2️⃣ Encuestas que deberían ser activas:');
    const [activeSurveys] = await pool.execute(`
      SELECT id, question, status, expires_at 
      FROM surveys 
      WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY id
    `);
    console.log(`📊 Encuestas activas (según SQL): ${activeSurveys.length}`);
    
    activeSurveys.forEach(survey => {
      console.log(`   - ID: ${survey.id}, Estado: "${survey.status}", Expira: ${survey.expires_at || 'No expira'}`);
    });
    
    // 3. Verificar encuestas con estado 'active' sin filtro de fecha
    console.log('\n3️⃣ Encuestas con estado "active":');
    const [activeStatusSurveys] = await pool.execute(`
      SELECT id, question, status, expires_at 
      FROM surveys 
      WHERE status = 'active'
      ORDER BY id
    `);
    console.log(`📊 Encuestas con estado "active": ${activeStatusSurveys.length}`);
    
    activeStatusSurveys.forEach(survey => {
      console.log(`   - ID: ${survey.id}, Estado: "${survey.status}", Expira: ${survey.expires_at || 'No expira'}`);
    });
    
    // 4. Verificar encuestas que no han expirado
    console.log('\n4️⃣ Encuestas que no han expirado:');
    const [nonExpiredSurveys] = await pool.execute(`
      SELECT id, question, status, expires_at 
      FROM surveys 
      WHERE expires_at IS NULL OR expires_at > NOW()
      ORDER BY id
    `);
    console.log(`📊 Encuestas no expiradas: ${nonExpiredSurveys.length}`);
    
    nonExpiredSurveys.forEach(survey => {
      console.log(`   - ID: ${survey.id}, Estado: "${survey.status}", Expira: ${survey.expires_at || 'No expira'}`);
    });
    
    // 5. Verificar la consulta exacta del controlador
    console.log('\n5️⃣ Consulta exacta del controlador getActiveSurveys:');
    const [controllerQuery] = await pool.execute(`
      SELECT 
        s.id, s.question, s.is_multiple_choice, s.max_votes_per_user,
        COUNT(DISTINCT so.id) as options_count,
        COUNT(DISTINCT sv.id) as total_votes
      FROM surveys s
      LEFT JOIN survey_options so ON s.id = so.survey_id
      LEFT JOIN survey_votes sv ON s.id = sv.survey_id
      WHERE s.status = 'active' AND (s.expires_at IS NULL OR s.expires_at > NOW())
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);
    console.log(`📊 Resultado de la consulta del controlador: ${controllerQuery.length}`);
    
    controllerQuery.forEach(survey => {
      console.log(`   - ID: ${survey.id}, Pregunta: "${survey.question}", Opciones: ${survey.options_count}, Votos: ${survey.total_votes}`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkSurveyStatus()
    .then(() => {
      console.log('\n🏁 Verificación de estado completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error inesperado:', error);
      process.exit(1);
    });
}

module.exports = checkSurveyStatus; 