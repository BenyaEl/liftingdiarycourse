import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function listTables() {
  try {
    // Query to get all tables in the public schema
    const result = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('\n=== Tables in LiftingDiaryCourse Database ===\n');

    if (result.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      result.forEach((row, index) => {
        console.log(`${index + 1}. ${row.tablename}`);
      });
    }

    console.log(`\nTotal tables: ${result.length}\n`);

    // Get additional info about each table
    for (const row of result) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${row.tablename}
        ORDER BY ordinal_position;
      `;

      console.log(`\n--- ${row.tablename} (${columns.length} columns) ---`);
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
    }

  } catch (error) {
    console.error('Error querying database:', error);
    process.exit(1);
  }
}

listTables();
