const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('slug', 'llm-fine-tuning-from-scratch')
    .single();
  
  console.log("Error:", error);
  console.log("Data:", data ? data.id : null);
}

test();
