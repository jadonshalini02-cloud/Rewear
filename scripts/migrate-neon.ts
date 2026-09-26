import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.STORAGE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required. Add the Neon connection string to your environment first.');
  process.exit(1);
}

const sql = neon(databaseUrl);

try {
  await sql`
    CREATE TABLE IF NOT EXISTS rewear_state (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('Neon migration complete: rewear_state is ready.');
  console.log('The first application start will seed the initial ReWear dataset if the table is empty.');
} catch (error) {
  console.error('Neon migration failed:', error);
  process.exit(1);
}
