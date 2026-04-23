const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ilhgwqgouwomehgxivbo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsaGd3cWdvdXdvbWVoZ3hpdmJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIzODU0MiwiZXhwIjoyMDg1ODE0NTQyfQ.FLu-Z2F85-xdpmjuScwzjfbvGp1op5ba0t1qeDbmOSg'
);

async function main() {
  const { data, error } = await supabase
    .from('activaqr2_tenants')
    .update({ brand_color: '#e11d48' })
    .eq('slug', 'transportes-abelito');
    
  if (error) console.error(error);
  else console.log('Successfully updated brand_color for transportes-abelito to #e11d48');
}

main();
