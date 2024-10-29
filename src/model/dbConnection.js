const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectTimeout: 40000,
  acquireTimeout: 40000,
});

// Function to check the database connection
async function checkConnection() {
  try {
    const connection = await db.getConnection(); // Get a connection from the pool
    await connection.query("SELECT 1"); // Simple query to check the connection
    console.log("Database connection successful!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

checkConnection();

module.exports = db;
