const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && !key.startsWith('#')) acc[key.trim()] = val.join('=').trim().replace(/['"]/g, '');
  return acc;
}, {});

const headers = { 
  'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function updateIds() {
  const cases = [
    { id: "6dd90f43-4b10-4086-96c6-58e7a036d7f6", yt: "XG91y24268g" },
    { id: "1ed95683-4d6b-4322-9203-cde2c6f2feb7", yt: "WgEYzgrNvy0" },
    { id: "07f86fa9-0b74-4d86-98e8-b026ffdc6956", yt: "1N49G7m7n4o" },
    { id: "b2500263-202b-481d-86c4-2fe8ae03e178", yt: "HhN1wD42T40" },
    { id: "bc381998-4449-4acb-ace0-68ef52a2595a", yt: "YSiyuHoit9s" }
  ];

  for (const c of cases) {
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/authorities?id=eq.${c.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ youtube_id: c.yt })
    });
    const data = await res.json();
    console.log(`Updated ${c.id}: ${res.status}`, data);
  }
}

updateIds();
