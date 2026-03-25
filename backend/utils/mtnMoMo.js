/**
 * MTN Mobile Money API utility
 *
 * Covers:
 *  - Collections  → requestToPay()   (charge a customer)
 *  - Collections  → getPaymentStatus()
 *  - Disbursements → transfer()      (pay out to a mobile number)
 *  - Disbursements → getTransferStatus()
 *
 * MTN Sandbox docs: https://momodeveloper.mtn.com/api-documentation
 */

const https = require('https');
const { randomUUID } = require('crypto');

const BASE_URL = process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.co.rw';
const TARGET_ENV = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalize a phone number to full international MSISDN format.
 * Handles:
 *  - "+250788123456" → "250788123456"
 *  - "0788123456"    → "250788123456"  (Rwandan local format)
 *  - "788123456"     → "250788123456"  (9-digit Rwandan, no leading 0)
 *  - "46733123454"   → "46733123454"   (sandbox test number, untouched)
 */
function normalizePhone(phoneNumber) {
  const digits = phoneNumber.replace(/[^0-9]/g, '');
  const stripped = digits.replace(/^0+/, '');
  // 9 digits = Rwandan local number without country code
  if (stripped.length === 9) return `250${stripped}`;
  return stripped;
}

function httpsRequest(optionsOrUrl, body) {
  return new Promise((resolve, reject) => {
    let options;
    if (typeof optionsOrUrl === 'string') {
      const url = new URL(optionsOrUrl);
      options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET'
      };
    } else {
      options = optionsOrUrl;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = data;
        try { parsed = JSON.parse(data); } catch (_) { /* keep raw string */ }
        resolve({ status: res.statusCode, body: parsed, raw: data });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

/** Build hostname + path from BASE_URL and a given path segment */
function buildOptions(method, path, headers) {
  const url = new URL(BASE_URL);
  return {
    hostname: url.hostname,
    path,
    method,
    headers
  };
}

// ── Token generation ──────────────────────────────────────────────────────────

/**
 * Get a Bearer access token for the Collections product.
 * Token is valid for ~1 hour; for simplicity we fetch a fresh one per request.
 * In production you'd cache this token until it expires.
 */
async function getCollectionsToken() {
  const userId = process.env.MTN_USER_ID;
  const apiKey = process.env.MTN_API_KEY;
  const subKey = process.env.MTN_SUBSCRIPTION_KEY;

  if (!userId || !apiKey || !subKey) {
    throw new Error('MTN MoMo Collections credentials not configured. Set MTN_USER_ID, MTN_API_KEY, MTN_SUBSCRIPTION_KEY in .env');
  }

  const credentials = Buffer.from(`${userId}:${apiKey}`).toString('base64');

  const result = await httpsRequest(buildOptions('POST', '/collection/token/', {
    'Authorization': `Basic ${credentials}`,
    'Ocp-Apim-Subscription-Key': subKey,
    'Content-Length': '0'
  }));

  if (result.status !== 200 || !result.body.access_token) {
    throw new Error(`Failed to get Collections token: ${result.status} ${result.raw}`);
  }
  return result.body.access_token;
}

/**
 * Get a Bearer access token for the Disbursements product.
 */
async function getDisbursementsToken() {
  const userId = process.env.MTN_USER_ID;
  const apiKey = process.env.MTN_API_KEY;
  const subKey = process.env.MTN_DISBURSEMENTS_SUBSCRIPTION_KEY || process.env.MTN_SUBSCRIPTION_KEY;

  if (!userId || !apiKey || !subKey) {
    throw new Error('MTN MoMo Disbursements credentials not configured. Set MTN_USER_ID, MTN_API_KEY, MTN_DISBURSEMENTS_SUBSCRIPTION_KEY in .env');
  }

  const credentials = Buffer.from(`${userId}:${apiKey}`).toString('base64');

  const result = await httpsRequest(buildOptions('POST', '/disbursement/token/', {
    'Authorization': `Basic ${credentials}`,
    'Ocp-Apim-Subscription-Key': subKey,
    'Content-Length': '0'
  }));

  if (result.status !== 200 || !result.body.access_token) {
    throw new Error(`Failed to get Disbursements token: ${result.status} ${result.raw}`);
  }
  return result.body.access_token;
}

// ── Collections (charge a customer) ──────────────────────────────────────────

/**
 * Send a Request-to-Pay to a mobile money subscriber.
 *
 * @param {object} params
 * @param {string} params.amount       - Amount as string e.g. "5000"
 * @param {string} params.currency     - ISO currency code e.g. "EUR" (sandbox only accepts EUR)
 * @param {string} params.phoneNumber  - MSISDN without leading + e.g. "46733123454"
 * @param {string} params.externalId   - Your internal transaction reference
 * @param {string} params.payerMessage - Message shown to payer
 * @param {string} params.payeeNote    - Internal note
 * @returns {string} referenceId (UUID) — use this to poll status
 */
async function requestToPay({ amount, currency, phoneNumber, externalId, payerMessage = 'CRE8 Payment', payeeNote = 'CRE8' }) {
  const token = await getCollectionsToken();
  const referenceId = randomUUID();
  const subKey = process.env.MTN_SUBSCRIPTION_KEY;

  // MTN sandbox only accepts EUR; in production use your country currency
  const sandboxCurrency = TARGET_ENV === 'sandbox' ? 'EUR' : (currency || 'RWF');

  const msisdn = normalizePhone(phoneNumber);

  const body = JSON.stringify({
    amount: String(amount),
    currency: sandboxCurrency,
    externalId,
    payer: { partyIdType: 'MSISDN', partyId: msisdn },
    payerMessage,
    payeeNote
  });

  const result = await httpsRequest(buildOptions('POST', '/collection/v1_0/requesttopay', {
    'Authorization': `Bearer ${token}`,
    'X-Reference-Id': referenceId,
    'X-Target-Environment': TARGET_ENV,
    'X-Callback-Url': process.env.MTN_CALLBACK_URL || '',
    'Ocp-Apim-Subscription-Key': subKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }), body);

  // 202 Accepted = request successfully queued
  if (result.status !== 202) {
    throw new Error(`Request-to-Pay failed: ${result.status} ${result.raw}`);
  }

  return referenceId;
}

/**
 * Poll the status of a Collections request.
 * @param {string} referenceId - UUID returned by requestToPay()
 * @returns {{ status: 'PENDING'|'SUCCESSFUL'|'FAILED', reason?: string }}
 */
async function getPaymentStatus(referenceId) {
  const token = await getCollectionsToken();
  const subKey = process.env.MTN_SUBSCRIPTION_KEY;

  const result = await httpsRequest(buildOptions('GET', `/collection/v1_0/requesttopay/${referenceId}`, {
    'Authorization': `Bearer ${token}`,
    'X-Target-Environment': TARGET_ENV,
    'Ocp-Apim-Subscription-Key': subKey
  }));

  if (result.status !== 200) {
    throw new Error(`Get payment status failed: ${result.status} ${result.raw}`);
  }

  return {
    status: result.body.status,        // PENDING | SUCCESSFUL | FAILED
    reason: result.body.reason || null,
    raw: result.body
  };
}

// ── Disbursements (pay out to a mobile number) ────────────────────────────────

/**
 * Transfer funds to a mobile money subscriber (payout/withdrawal).
 *
 * @param {object} params
 * @param {string} params.amount       - Amount as string
 * @param {string} params.currency     - ISO currency code
 * @param {string} params.phoneNumber  - Recipient MSISDN
 * @param {string} params.externalId   - Your internal reference
 * @param {string} params.payerMessage - Note for the payer
 * @param {string} params.payeeNote    - Internal note
 * @returns {string} referenceId (UUID) — use this to poll transfer status
 */
async function transfer({ amount, currency, phoneNumber, externalId, payerMessage = 'CRE8 Payout', payeeNote = 'CRE8' }) {
  const token = await getDisbursementsToken();
  const referenceId = randomUUID();
  const subKey = process.env.MTN_DISBURSEMENTS_SUBSCRIPTION_KEY || process.env.MTN_SUBSCRIPTION_KEY;

  const sandboxCurrency = TARGET_ENV === 'sandbox' ? 'EUR' : (currency || 'RWF');
  const msisdn = normalizePhone(phoneNumber);

  const body = JSON.stringify({
    amount: String(amount),
    currency: sandboxCurrency,
    externalId,
    payee: { partyIdType: 'MSISDN', partyId: msisdn },
    payerMessage,
    payeeNote
  });

  const result = await httpsRequest(buildOptions('POST', '/disbursement/v1_0/transfer', {
    'Authorization': `Bearer ${token}`,
    'X-Reference-Id': referenceId,
    'X-Target-Environment': TARGET_ENV,
    'X-Callback-Url': process.env.MTN_CALLBACK_URL || '',
    'Ocp-Apim-Subscription-Key': subKey,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }), body);

  if (result.status !== 202) {
    throw new Error(`Transfer failed: ${result.status} ${result.raw}`);
  }

  return referenceId;
}

/**
 * Poll the status of a Disbursements transfer.
 * @param {string} referenceId - UUID returned by transfer()
 * @returns {{ status: 'PENDING'|'SUCCESSFUL'|'FAILED', reason?: string }}
 */
async function getTransferStatus(referenceId) {
  const token = await getDisbursementsToken();
  const subKey = process.env.MTN_DISBURSEMENTS_SUBSCRIPTION_KEY || process.env.MTN_SUBSCRIPTION_KEY;

  const result = await httpsRequest(buildOptions('GET', `/disbursement/v1_0/transfer/${referenceId}`, {
    'Authorization': `Bearer ${token}`,
    'X-Target-Environment': TARGET_ENV,
    'Ocp-Apim-Subscription-Key': subKey
  }));

  if (result.status !== 200) {
    throw new Error(`Get transfer status failed: ${result.status} ${result.raw}`);
  }

  return {
    status: result.body.status,
    reason: result.body.reason || null,
    raw: result.body
  };
}

module.exports = {
  requestToPay,
  getPaymentStatus,
  transfer,
  getTransferStatus
};
