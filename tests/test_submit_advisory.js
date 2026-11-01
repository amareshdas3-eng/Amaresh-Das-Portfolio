// tests/test_submit_advisory.js
// Automated verification suite for Netlify serverless intake handler
// Verifies end-to-end delivery guarantees, upstream error mapping (502/503), honeypot, validation, and rate limiting.

const http = require('http');
const assert = require('assert');
const { handler } = require('../netlify/functions/submit-advisory.js');

async function main() {
  console.log("=================================================");
  console.log("RUNNING AUTOMATED TESTS: submit-advisory.js");
  console.log("=================================================\n");

  // TEST 1: Reject non-POST HTTP methods
  {
    const res = await handler({ httpMethod: 'GET' }, {});
    assert.strictEqual(res.statusCode, 405, "Non-POST must return 405");
    console.log("[PASS] Test 1: Non-POST method rejected with HTTP 405");
  }

  // TEST 2: Reject invalid / malformed JSON
  {
    const res = await handler({ httpMethod: 'POST', body: 'invalid-json' }, {});
    assert.strictEqual(res.statusCode, 400, "Malformed JSON must return 400");
    console.log("[PASS] Test 2: Malformed JSON payload rejected with HTTP 400");
  }

  // TEST 3: Honeypot silently discards bot submissions
  {
    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ botField: 'automated_spam_bot', fullName: 'Bot' })
    }, {});
    assert.strictEqual(res.statusCode, 200, "Honeypot must return 200 silent acknowledge");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.status, 'logged');
    console.log("[PASS] Test 3: Honeypot trapped bot submission with HTTP 200 silent discard");
  }

  // TEST 4: Input validation rejects missing required fields
  {
    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'A', // too short
        workEmail: 'not-an-email',
        organization: '',
        consentResponse: false
      })
    }, {});
    assert.strictEqual(res.statusCode, 400, "Invalid fields must return 400");
    console.log("[PASS] Test 4: Schema validation rejects invalid/missing fields with HTTP 400");
  }

  // TEST 5: Missing ADVISORY_WEBHOOK_URL returns HTTP 503 Service Unavailable (Zero false queue claim)
  {
    const originalEnv = process.env.ADVISORY_WEBHOOK_URL;
    delete process.env.ADVISORY_WEBHOOK_URL;

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'Marcus Vance',
        workEmail: 'marcus.vance@powergrid-intl.com',
        organization: 'PowerGrid International',
        facilityScale: '132kV Substation',
        enquiryType: 'Industrial Advisory Retainer',
        practiceArea: 'HV Systems & Commissioning',
        urgency: 'Immediate (Next 14 Days)',
        projectBrief: 'Need 132kV switchyard hold-point audit and relay verification.',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 503, "Unconfigured webhook must return 503 Service Unavailable");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, false);
    console.log("[PASS] Test 5: Missing ADVISORY_WEBHOOK_URL returns truthful HTTP 503 Service Unavailable");

    process.env.ADVISORY_WEBHOOK_URL = originalEnv;
  }

  // Set up mock upstream server for delivery testing
  let mockServerStatus = 200;
  let mockServerResponseBody = JSON.stringify({ success: true });
  let mockServerHangup = false;

  const mockServer = http.createServer((req, res) => {
    if (mockServerHangup) {
      req.destroy();
      return;
    }
    res.writeHead(mockServerStatus, { 'Content-Type': 'application/json' });
    res.end(mockServerResponseBody);
  });

  await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
  const port = mockServer.address().port;
  process.env.ADVISORY_WEBHOOK_URL = `http://127.0.0.1:${port}/webhook`;

  // TEST 6: Upstream 500 error returns HTTP 502 Bad Gateway (Zero false success)
  {
    mockServerStatus = 500;
    mockServerResponseBody = JSON.stringify({ error: "Internal Server Error in Make scenario" });
    mockServerHangup = false;

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'Marcus Vance',
        workEmail: 'marcus.upstream500@powergrid-intl.com',
        organization: 'PowerGrid International',
        projectBrief: 'Need 132kV switchyard hold-point audit and relay verification.',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 502, "Upstream 500 must return 502 Bad Gateway");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, false);
    console.log("[PASS] Test 6: Upstream HTTP 500 error correctly returns HTTP 502 Bad Gateway");
  }

  // TEST 7: Upstream network timeout / socket error returns HTTP 502 Bad Gateway
  {
    mockServerHangup = true;

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'Elena Rostova',
        workEmail: 'elena@nordic-renewables.eu',
        organization: 'Nordic Renewables AS',
        projectBrief: 'Urgent 66kV offshore transformer DGA analysis required.',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 502, "Upstream network failure must return 502 Bad Gateway");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, false);
    console.log("[PASS] Test 7: Upstream network/socket failure correctly returns HTTP 502 Bad Gateway");
  }

  // TEST 8: Confirmed upstream 200 acceptance returns HTTP 200 delivered status
  {
    mockServerStatus = 200;
    mockServerResponseBody = JSON.stringify({ accepted: true, id: "msg_98472" });
    mockServerHangup = false;

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'David Sterling, P.E.',
        workEmail: 'sterling@energy-partners.com',
        organization: 'Energy Partners Global Ltd',
        facilityScale: '132kV Substation, 2x50MVA',
        enquiryType: 'Industrial Advisory Retainer',
        practiceArea: 'HV Systems & Commissioning',
        urgency: 'Immediate (Next 14 Days)',
        projectBrief: 'Require urgent independent numerical relay coordination study and 72-hour pre-energization clearance.',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 200, "Upstream 200 must return HTTP 200");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, true);
    assert.strictEqual(body.status, 'delivered');
    console.log("[PASS] Test 8: Upstream 200 acceptance correctly returns HTTP 200 with status: 'delivered'");
  }

  // TEST 9: Rapid duplicate submission caught by rate limiter (HTTP 429)
  {
    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'David Sterling, P.E.',
        workEmail: 'sterling@energy-partners.com',
        organization: 'Energy Partners Global Ltd',
        projectBrief: 'Duplicate submission test',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 429, "Immediate duplicate must return HTTP 429 Too Many Requests");
    console.log("[PASS] Test 9: Rapid duplicate submission throttled with HTTP 429");
  }

  mockServer.close();
  console.log("\n=================================================");
  console.log("ALL 9 SERVERLESS DELIVERY TESTS PASSED.");
  console.log("=================================================");
}

main().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
