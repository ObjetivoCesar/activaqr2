const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addSlugColumn() {
  console.log('Attempting to add slug column to activaqr2_tenants...');
  
  // Try to use RPC if available or raw query if supported
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: 'ALTER TABLE public.activaqr2_tenants ADD COLUMN IF NOT EXISTS slug text;'
  });

  if (error) {
    console.error('Error adding column via RPC:', error);
    console.log('Falling back to a different approach...');
    
    // If RPC fails, we might not have a way to run raw SQL from here without a specific endpoint.
    // However, we can use the JSON field as fallback in the code.
  } else {
    console.log('Successfully added slug column.');
  }
}

addSlugColumn();
