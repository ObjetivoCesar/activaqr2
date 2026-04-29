import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTenant() {
  const { data, error } = await supabase.from('activaqr2_tenants').select('*');
  if (error) {
    console.error("Error fetching tenants:", error);
    return;
  }
  
  const tenant = data.find(t => {
    try {
      if (t.vcard_name?.startsWith('{')) {
        const parsed = JSON.parse(t.vcard_name);
        return parsed.slug === 'transportes-abelito';
      }
    } catch(e) {}
    return false;
  });

  if (tenant) {
    console.log("Found tenant:", tenant.name);
    console.log("vcard_name JSON:", JSON.parse(tenant.vcard_name));
  } else {
    console.log("Tenant 'transportes-abelito' not found.");
  }
}

checkTenant();
