const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'sa-east-1',
  'ca-central-1'
];

const pass = 'P5Vqn0ALIGxUcJsG';
const ref = 'ijnnazbvnufevfyappts';

async function testAll() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connString = `postgresql://postgres.${ref}:${pass}@${host}:6543/postgres`;
    console.log(`Testing region ${region}...`);

    const client = new Client({
      connectionString: connString,
      connectionTimeoutMillis: 3000
    });

    try {
      await client.connect();
      const res = await client.query('SELECT current_database(), version();');
      console.log(`\n🎉 SUCCESS! Connected to Supabase on region: ${region}`);
      console.log(`Working DATABASE_URL: "${connString}"\n`);
      await client.end();
      process.exit(0);
    } catch (err) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.log(`Potential hit on ${region}:`, err.message);
      }
      await client.end().catch(() => {});
    }
  }
  console.log('Finished testing regions.');
}

testAll();
