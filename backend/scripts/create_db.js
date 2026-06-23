require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    });

    const dbName = process.env.DB_NAME || 'nccs_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
    console.log(`✅ Database ${dbName} created or already exists.`);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('MySQL create DB error:', err.message);
    process.exit(1);
  }
})();
