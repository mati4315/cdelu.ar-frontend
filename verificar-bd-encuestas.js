const mysql = require('mysql2/promise');

// Configuración de la base de datos (ajusta según tu configuración)
const dbConfig = {
  host: 'localhost',
  user: 'root', // Cambia por tu usuario
  password: '', // Cambia por tu contraseña
  database: 'cdelu_db' // Cambia por tu base de datos
};

async function verificarBaseDatos() {
  console.log('🔍 Verificando estado de la base de datos de encuestas...\n');
  
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a la base de datos establecida');
    
    // 1. Verificar si las tablas existen
    console.log('\n1️⃣ Verificando tablas de encuestas...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'survey%'
    `);
    
    if (tables.length === 0) {
      console.log('❌ No se encontraron tablas de encuestas');
      console.log('💡 Ejecuta: node setup-surveys-database.js');
      return;
    }
    
    console.log('✅ Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // 2. Verificar encuestas existentes
    console.log('\n2️⃣ Verificando encuestas existentes...');
    const [surveys] = await connection.execute(`
      SELECT id, title, status, total_votes FROM surveys
    `);
    
    if (surveys.length === 0) {
      console.log('❌ No hay encuestas en la base de datos');
      console.log('💡 Crea algunas encuestas de prueba');
    } else {
      console.log(`✅ Encuestas encontradas: ${surveys.length}`);
      surveys.forEach(survey => {
        console.log(`   - ID: ${survey.id}, Título: "${survey.title}", Estado: ${survey.status}, Votos: ${survey.total_votes}`);
      });
    }
    
    // 3. Verificar opciones de encuesta
    console.log('\n3️⃣ Verificando opciones de encuesta...');
    const [options] = await connection.execute(`
      SELECT survey_id, COUNT(*) as options_count FROM survey_options GROUP BY survey_id
    `);
    
    if (options.length === 0) {
      console.log('❌ No hay opciones de encuesta');
    } else {
      console.log('✅ Opciones por encuesta:');
      options.forEach(option => {
        console.log(`   - Encuesta ${option.survey_id}: ${option.options_count} opciones`);
      });
    }
    
    // 4. Verificar votos existentes
    console.log('\n4️⃣ Verificando votos existentes...');
    const [votes] = await connection.execute(`
      SELECT survey_id, COUNT(*) as votes_count FROM survey_votes GROUP BY survey_id
    `);
    
    if (votes.length === 0) {
      console.log('ℹ️ No hay votos registrados');
    } else {
      console.log('✅ Votos por encuesta:');
      votes.forEach(vote => {
        console.log(`   - Encuesta ${vote.survey_id}: ${vote.votes_count} votos`);
      });
    }
    
    // 5. Verificar triggers
    console.log('\n5️⃣ Verificando triggers...');
    const [triggers] = await connection.execute(`
      SHOW TRIGGERS LIKE 'survey%'
    `);
    
    if (triggers.length === 0) {
      console.log('❌ No se encontraron triggers de encuestas');
      console.log('💡 Ejecuta: node setup-surveys-database.js');
    } else {
      console.log('✅ Triggers encontrados:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.Trigger}: ${trigger.Timing} ${trigger.Event} ON ${trigger.Table}`);
      });
    }
    
    // 6. Verificar estructura de tabla survey_votes
    console.log('\n6️⃣ Verificando estructura de tabla survey_votes...');
    const [voteStructure] = await connection.execute(`
      DESCRIBE survey_votes
    `);
    
    console.log('✅ Estructura de survey_votes:');
    voteStructure.forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // 7. Verificar restricciones únicas
    console.log('\n7️⃣ Verificando restricciones únicas...');
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'survey_votes'
    `);
    
    console.log('✅ Restricciones en survey_votes:');
    constraints.forEach(constraint => {
      console.log(`   - ${constraint.CONSTRAINT_NAME}: ${constraint.COLUMN_NAME}`);
    });
    
  } catch (error) {
    console.error('💥 Error verificando base de datos:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔧 Solución: Verifica las credenciales de la base de datos');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Solución: Verifica que MySQL esté corriendo');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🔧 Solución: Verifica que la base de datos existe');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

// Función para crear datos de prueba
async function crearDatosPrueba() {
  console.log('\n🧪 Creando datos de prueba...\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Crear encuesta de prueba
    const [surveyResult] = await connection.execute(`
      INSERT INTO surveys (title, description, question, status, is_multiple_choice, max_votes_per_user, created_by, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Encuesta de Prueba',
      'Esta es una encuesta de prueba',
      '¿Cuál es tu color favorito?',
      'active',
      false,
      1,
      1,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    ]);
    
    const surveyId = surveyResult.insertId;
    console.log(`✅ Encuesta creada con ID: ${surveyId}`);
    
    // Crear opciones
    const options = ['Rojo', 'Azul', 'Verde', 'Amarillo'];
    for (let i = 0; i < options.length; i++) {
      await connection.execute(`
        INSERT INTO survey_options (survey_id, option_text, display_order)
        VALUES (?, ?, ?)
      `, [surveyId, options[i], i + 1]);
    }
    
    console.log(`✅ ${options.length} opciones creadas`);
    console.log('✅ Datos de prueba creados exitosamente');
    
  } catch (error) {
    console.error('💥 Error creando datos de prueba:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar verificación
verificarBaseDatos()
  .then(() => {
    console.log('\n🎯 Verificación completada');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Si hay errores, ejecuta: node setup-surveys-database.js');
    console.log('   2. Si no hay datos, ejecuta: crearDatosPrueba()');
    console.log('   3. Reinicia el servidor backend');
  })
  .catch(error => {
    console.error('💥 Error general:', error);
  }); 