// tests/test_submit_advisory.js
// Automated verification suite for Netlify serverless intake handler
// Verifies HTTPS-only enforcement, upstream delivery guarantees, 502/503 error handling, timeout events, honeypot, validation, and rate limiting.

const https = require('https');
const assert = require('assert');
const { handler } = require('../netlify/functions/submit-advisory.js');

// Embedded self-signed certificate and key for local HTTPS mock testing
// Eliminates external dependencies while proving end-to-end TLS encryption
const TEST_CERT = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUDyyerEnLwcnMifEin8kxVq+IY30wDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJMTI3LjAuMC4xMB4XDTI2MTEwMTA0NTkwOFoXDTM2MTAy
OTA0NTkwOFowFDESMBAGA1UEAwwJMTI3LjAuMC4xMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAtlWUzGpuCVqM/q7f9SMnj5SN7Mg4RG7CUknSr80s9BSt
vXgN/UddXHIJZEPus+FcEPsnm+pV/G2rcInegSyAS0AVOJqH1TVSr15xxvCJfmBb
DiMkc/Q8gXJhkGsuqef9ST+LEYzmL+LLfsn/5yK/7cPwjVbpauCGlKdjvhg6h4Zu
37orw/bTJ+pN3EVWChumOJd4sFBt2RM2ycRg3gnR/hwViGSIMWfogPrAGv963gxb
N36iz8RyN3awzNYvFNsMJe+O5ziGaG3vuiMyKcD38KITk5+AdE0QrM3W8/KZAkzu
1SKwjGTRkZNgg5SLAj2ihLfA+S7DI6cCgYK/MhE+MQIDAQABo1MwUTAdBgNVHQ4E
FgQUFmTWU26SWZ860nB/LjdzGR1g3qUwHwYDVR0jBBgwFoAUFmTWU26SWZ860nB/
LjdzGR1g3qUwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAf5pQ
PswEm6gZupmLrSQe6L16OebY677Z8qzCzV9WBT5dTKza4FkLsCJ0ESut4sDNZ1OI
iJN2AL2jp+yrWVMqrweKV4AZ077AbCZJq0yQfyYqm1oLocFflLVEFJP2HonjJsK1
m5Z4c9VnQIOUvgjg8YBQ5IcZSk9iPoByOaigVl8yPCcdIKMxD4d9o562W5K7KmMc
NSu8nWKFQ/eW6IBdomODZ/ahQi492dwaeBk6KEJvkOH12IZOy0uuaaFssIzMFeHS
xuQWYcLhbvNFsAAwjPbyuqqrragQ8EZAC3UXImWj9GrbUngWc2MJNLIqbOCOoGdD
qXSY37mjsOzarW2d8w==
-----END CERTIFICATE-----`;

const TEST_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC2VZTMam4JWoz+
rt/1IyePlI3syDhEbsJSSdKvzSz0FK29eA39R11ccglkQ+6z4VwQ+yeb6lX8batw
id6BLIBLQBU4mofVNVKvXnHG8Il+YFsOIyRz9DyBcmGQay6p5/1JP4sRjOYv4st+
yf/nIr/tw/CNVulq4IaUp2O+GDqHhm7fuivD9tMn6k3cRVYKG6Y4l3iwUG3ZEzbJ
xGDeCdH+HBWIZIgxZ+iA+sAa/3reDFs3fqLPxHI3drDM1i8U2wwl747nOIZobe+6
IzIpwPfwohOTn4B0TRCszdbz8pkCTO7VIrCMZNGRk2CDlIsCPaKEt8D5LsMjpwKB
gr8yET4xAgMBAAECggEAC/qTjUTJEw0Tehr1OeFpSgigNLK9vESLjdpC63ZUZ6UL
z14PCzla8/BxAgOS2oH/KVrFZ3v4fLOcIbIJFR2eQHNcFuJ+Hd7ZiQ3Fy08GYBqx
ThHhz/Vh2+juvyJvh82RiXRRgmG/m1yax8BlHc4IY8pC6EI8u7RhsGv5L1C1AwNl
qHLs804t+HrwHj3UW5DcufqlTa/pR81pnGYLFrW51LIzgTJ578sFbOVh3O2+nTJx
qrtT+FJZEXVwMcVf4cxmbTPuucIFEogbv6oG1EmvxM0mAkkIzYK5QzGzAbAthTEO
P7l17xZA5kJFWs2jf2FZYLEPEJe04Z9L62zFBQcH3QKBgQD8eeE9oHC6Thg/EB88
tiND6SF8osQYnXpiVNxYciT+HXXp7Iv4oj2kPw2JMMkgXofhfGYy2Ler2pe5tYoi
7lnNqboPZvNnPTfOy5OjTla+znznEMLuanNkamarESAjMOPRRONdVFSFjFUbJwZq
FNauCn82p/simnfvBbAwY74hdQKBgQC44RQP2jb1FSAGl27Lf8mSzXgeQENBpMas
BtnX1FjlgumDmOnwccLFwuML9UKVmj7GQJkbTaLVMGvG0t3459Mb3+xFL7/tRBBc
fgVPNXFdWUmHVjOL/vK5F57bQhjXPL34V1a/N1G3UOr0PfMiYMOeizWvml97z6VB
c3y20ri2TQKBgAa94mvY2um+qBsW/R6L5okrsn83gXD+04PIrFGYSrCWbM2gSWSM
QIUgQeZF7Tj2DT7SKZB2BQGLxr1owZWJM9CwFY3Pu/QnyFO3T+vubZaOwPsSkYH4
SbiGttMek/McnRi7dC7Lz635P1SISD2Q7OKc2STGe4hDA6zYRAomv675AoGBAIhf
ToMa/aruuD7keQ+W5UNqWI5H7NSBDSNbsljoA+LYHBO8OePopjlmNkBd242qx19J
yyY+sDv9iaKRbLbrmedX11p5jGMh78eqFZSF4WdwMzKnPUKo/rXVXJJzQQuTfLWx
BwXpcld8UrNy9uOG6QULvsAXaRNU6ZtL6tSYvzOJAoGATZ+RXxBFQ0OvZHfC+fTX
njtxXYJ6T6+TuAT48UXiaP0kNyqczDp5amKUiNaMOPkdfWSgrisgreE31ZhPXSN/
YivATUb08zc46XNBEjk/aZlUcCvNklmk/8GeG7DNC3FZGScQAB6/+25kBkQPhEXw
3HVMpjFoc5SjDuKj5iBMQvk=
-----END PRIVATE KEY-----`;

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

  // TEST 6: Insecure plain HTTP dispatch URL strictly rejected with HTTP 500 (HTTPS-only enforcement)
  {
    const originalEnv = process.env.ADVISORY_WEBHOOK_URL;
    process.env.ADVISORY_WEBHOOK_URL = 'http://insecure-gateway.example.com/webhook';

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'Marcus Vance',
        workEmail: 'marcus.http@powergrid-intl.com',
        organization: 'PowerGrid International',
        projectBrief: 'Insecure URL test brief for TLS enforcement.',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 500, "Insecure HTTP URL must return 500");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, false);
    assert(body.error.includes("HTTPS is strictly required"), "Error message must state HTTPS requirement");
    console.log("[PASS] Test 6: Insecure plain HTTP dispatch URL rejected with HTTP 500 (HTTPS-only enforced)");

    process.env.ADVISORY_WEBHOOK_URL = originalEnv;
  }

  // Set up local HTTPS mock server for delivery, timeout, and upstream error testing
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Allow local self-signed cert for testing

  let mockServerStatus = 200;
  let mockServerResponseBody = JSON.stringify({ success: true });
  let mockServerHangup = false;
  let mockServerDelayMs = 0;

  const mockServer = https.createServer({ key: TEST_KEY, cert: TEST_CERT }, (req, res) => {
    if (mockServerHangup) {
      req.destroy();
      return;
    }
    if (mockServerDelayMs > 0) {
      setTimeout(() => {
        if (!res.writableEnded) {
          res.writeHead(mockServerStatus, { 'Content-Type': 'application/json' });
          res.end(mockServerResponseBody);
        }
      }, mockServerDelayMs);
      return;
    }
    res.writeHead(mockServerStatus, { 'Content-Type': 'application/json' });
    res.end(mockServerResponseBody);
  });

  await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
  const port = mockServer.address().port;
  process.env.ADVISORY_WEBHOOK_URL = `https://127.0.0.1:${port}/webhook`;

  // TEST 7: Upstream 500 error returns HTTP 502 Bad Gateway (Zero false success)
  {
    mockServerStatus = 500;
    mockServerResponseBody = JSON.stringify({ error: "Internal Server Error in Make scenario" });
    mockServerHangup = false;
    mockServerDelayMs = 0;

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
    console.log("[PASS] Test 7: Upstream HTTPS 500 error correctly returns HTTP 502 Bad Gateway");
  }

  // TEST 8: Upstream network socket failure / hangup returns HTTP 502 Bad Gateway
  {
    mockServerHangup = true;
    mockServerDelayMs = 0;

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
    console.log("[PASS] Test 8: Upstream network/socket failure correctly returns HTTP 502 Bad Gateway");
  }

  // TEST 9: Upstream timeout event explicitly exercised and returns HTTP 502 Bad Gateway
  {
    mockServerHangup = false;
    mockServerDelayMs = 500;
    process.env.ADVISORY_DISPATCH_TIMEOUT_MS = '150'; // Configure short timeout for test

    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({
        fullName: 'Klaus Fischer',
        workEmail: 'klaus.fischer@rhein-energie.de',
        organization: 'Rhein Energie AG',
        projectBrief: 'Grid interconnect validation study for 400kV gas-insulated substation.',
        consentResponse: true,
        botField: ''
      })
    }, {});

    assert.strictEqual(res.statusCode, 502, "Upstream timeout must return 502 Bad Gateway");
    const body = JSON.parse(res.body);
    assert.strictEqual(body.ok, false);
    assert(body.details.includes('timed out'), "Error details must report timeout");
    console.log("[PASS] Test 9: Upstream HTTPS timeout event explicitly tested and returns HTTP 502 Bad Gateway");

    delete process.env.ADVISORY_DISPATCH_TIMEOUT_MS;
    mockServerDelayMs = 0;
  }

  // TEST 10: Confirmed upstream 200 acceptance returns HTTP 200 with accepted_by_notification_gateway status
  {
    mockServerStatus = 200;
    mockServerResponseBody = JSON.stringify({ accepted: true, id: "msg_98472" });
    mockServerHangup = false;
    mockServerDelayMs = 0;

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
    assert.strictEqual(body.status, 'accepted_by_notification_gateway');
    assert(body.message.includes('accepted by our notification service for forwarding'));
    console.log("[PASS] Test 10: Upstream 200 returns HTTP 200 with status: 'accepted_by_notification_gateway' and truthful message");
  }

  // TEST 11: Rapid duplicate submission caught by rate limiter (HTTP 429)
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
    console.log("[PASS] Test 11: Rapid duplicate submission throttled with HTTP 429");
  }

  mockServer.close();
  console.log("\n=================================================");
  console.log("ALL 11 SERVERLESS DELIVERY & SECURITY TESTS PASSED.");
  console.log("=================================================");
}

main().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
