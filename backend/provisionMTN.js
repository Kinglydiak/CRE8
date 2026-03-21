const https = require('https');
const subscriptionKey = '77a3e51b754e4da3bcd91be7626ed9c7';
const userId = '83f0d8a7-c034-4a41-889b-f8cd5d56e099';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function provision() {
  console.log('Creating sandbox user with ID:', userId);

  const r1 = await request({
    hostname: 'sandbox.momodeveloper.mtn.com',
    path: '/v1_0/apiuser',
    method: 'POST',
    headers: {
      'X-Reference-Id': userId,
      'X-Target-Environment': 'sandbox',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ providerCallbackHost: 'localhost' }));

  console.log('Create user status:', r1.status, r1.body);
  if (r1.status !== 201) { console.error('Failed to create user'); return; }

  const r2 = await request({
    hostname: 'sandbox.momodeveloper.mtn.com',
    path: '/v1_0/apiuser/' + userId + '/apikey',
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json'
    }
  }, ' ');

  console.log('Get API key status:', r2.status, r2.body);
  const parsed = JSON.parse(r2.body);

  console.log('\n=== ADD THESE TO YOUR .env ===');
  console.log('MTN_USER_ID=' + userId);
  console.log('MTN_API_KEY=' + parsed.apiKey);
  console.log('MTN_SUBSCRIPTION_KEY=' + subscriptionKey);
  console.log('MTN_TARGET_ENVIRONMENT=sandbox');
  console.log('MTN_BASE_URL=https://sandbox.momodeveloper.mtn.com');
}

provision().catch(console.error);
