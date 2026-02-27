import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function check() {
    console.log('Fetching beauty_services...');
    const { data: b_servs, error: e2 } = await supabase.from('beauty_services').select('*').limit(10).order('id', { ascending: false });
    console.log('beauty_services:', b_servs?.length, e2);
    if (b_servs) {
        console.log(b_servs.map(b => b.servicename).join(', '));
    }
}
check();
