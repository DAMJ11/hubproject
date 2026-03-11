import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQLHOST || "localhost",
  port: Number(process.env.MYSQLPORT) || 3307,
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "Duber1037776117*",
  database: process.env.MYSQLDATABASE || "hubproject",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Execute a query
export async function query<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

// Get a single row
export async function queryOne<T>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const results = await query<T[]>(sql, params);
  return Array.isArray(results) && results.length > 0 ? results[0] : null;
}

export default pool;
