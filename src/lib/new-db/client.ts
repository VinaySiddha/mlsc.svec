import postgres from 'postgres';

/**
 * MLSC Portal - New Database Client (Without ORM)
 * Powered by postgres.js (Pure SQL with tagged template literals)
 * 
 * Works with:
 * - Supabase PostgreSQL (Free 500MB)
 * - Neon Serverless Postgres (Free 500MB)
 * - Local / Docker PostgreSQL
 */

const connectionString = process.env.DATABASE_URL || '';

// Connection pool configuration for Next.js SSR / Serverless
export const sql = connectionString
  ? postgres(connectionString, {
      max: 10,               // Connection pool size
      idle_timeout: 20,      // Close idle connections after 20s
      connect_timeout: 10,   // Connection timeout in seconds
      ssl: process.env.DATABASE_SSL === 'false' ? false : 'require',
    })
  : (() => {
      // Graceful fallback dummy if DATABASE_URL is not yet configured in .env
      const dummySql = async () => {
        console.warn('DATABASE_URL is not configured. Please set DATABASE_URL in your .env file.');
        return [];
      };
      return dummySql as unknown as postgres.Sql;
    })();

export default sql;
