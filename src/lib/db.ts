import mysql from "mysql2/promise";

// Database connection configuration
const dbConfig = {
  // Support both naming conventions: MYSQLHOST or MYSQL_HOST
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT) || 3307,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || "root",
  // Allow MYSQLPASSWORD or MYSQL_PASSWORD
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || "hubproject",
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
