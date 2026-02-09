const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Budha@123'
    });

    console.log('✅ Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'connectin_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created/verified`);

    
    await connection.end();
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Budha@123',
      database: dbName
    });
    
    console.log(`✅ Connected to database '${dbName}'`);

    // Read and execute schema
    if (fs.existsSync('./schema.sql')) {
      const schema = fs.readFileSync('./schema.sql', 'utf8');
      // Remove comments and split by semicolon
      const statements = schema
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        try {
          await connection.execute(statement);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log(`⚠️  Schema statement failed: ${err.message}`);
          }
        }
      }
      console.log('✅ Schema imported successfully');
    } else {
      console.log('⚠️  schema.sql not found');
    }

    // Read and execute seed data
    if (fs.existsSync('./seed.sql')) {
      const seed = fs.readFileSync('./seed.sql', 'utf8');
      const statements = seed
        .replace(/--.*$/gm, '') // Remove comments
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        try {
          await connection.execute(statement);
        } catch (err) {
          // Ignore duplicate entry errors (in case running multiple times)
          if (!err.message.includes('Duplicate entry') && !err.message.includes('already exists')) {
            console.log(`⚠️  Seed statement failed: ${err.message}`);
          }
        }
      }
      console.log('✅ Seed data imported successfully');
    } else {
      console.log('⚠️  seed.sql not found');
    }

    console.log('\n🎉 Database setup complete!');
    console.log('You can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your .env file credentials');
    console.log('3. Ensure the MySQL user has CREATE DATABASE privileges');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
