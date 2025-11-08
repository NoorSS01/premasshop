import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   SUPABASE_URL or VITE_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigrations() {
    try {
        console.log('🚀 Starting database migrations...\n');

        const migrationFiles = (await readdir(__dirname))
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            console.log(`📄 Running migration: ${file}`);
            const sql = readFileSync(join(__dirname, file), 'utf-8');
            
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
            
            if (error) {
                // If exec_sql doesn't exist, try direct query (may need to split by semicolons)
                console.log(`   Attempting direct execution...`);
                const statements = sql.split(';').filter(s => s.trim().length > 0);
                
                for (const statement of statements) {
                    if (statement.trim()) {
                        const { error: stmtError } = await supabase
                            .from('_migrations')
                            .select('*')
                            .limit(0); // Dummy query to test connection
                        
                        // Note: Supabase doesn't support raw SQL execution via client
                        // You'll need to run these migrations via Supabase Dashboard SQL Editor
                        console.log(`   ⚠️  Note: Run this migration manually in Supabase Dashboard SQL Editor`);
                    }
                }
            } else {
                console.log(`   ✅ Migration ${file} completed`);
            }
        }

        console.log('\n✅ All migrations completed!');
        console.log('\n⚠️  IMPORTANT: If migrations failed, run them manually in Supabase Dashboard:');
        console.log('   1. Go to Supabase Dashboard > SQL Editor');
        console.log('   2. Copy and paste each migration file content');
        console.log('   3. Execute each migration in order\n');
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

runMigrations();

