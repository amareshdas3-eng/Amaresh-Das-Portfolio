// netlify/functions/submit-advisory.js
// Secure server-side intake handler for ProEngineering Advisory inquiries
// Eliminates client-side secrets, enforces HTTPS-only dispatch, honeypot spam protection, server-side validation, and rate limiting.

const https = require('https');
const { URL } = require('url');

// Instance-level in-memory rate limiting (best-effort throttling per container instance; durable rate limiting requires shared Redis/KV store)
const recentSubmissions = new Map();
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30 seconds

exports.handler = async (event, context) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // 2. Parse payload safely
    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch (parseErr) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON payload' })
      };
    }

    const {
      fullName,
      workEmail,
      organization,
      facilityScale,
      enquiryType,
      practiceArea,
      urgency,
      projectBrief,
      consentResponse,
      consentMarketing,
      botField
    } = data;

    // 3. Honeypot check (Spam Protection)
    if (botField) {
      // Quietly acknowledge bot submissions without processing
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, status: 'logged' })
      };
    }

    // 4. Server-side validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Full name is required (min 2 characters)' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!workEmail || typeof workEmail !== 'string' || !emailRegex.test(workEmail.trim())) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'A valid email address is required' })
      };
    }

    if (!organization || typeof organization !== 'string' || organization.trim().length < 2) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Company or organization name is required' })
      };
    }

    if (!projectBrief || typeof projectBrief !== 'string' || projectBrief.trim().length < 10) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Brief project description is required (min 10 characters)' })
      };
    }

    if (!consentResponse) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Consent to respond to your technical inquiry is required' })
      };
    }

    // 5. Rate limiting / Duplicate prevention
    const cleanEmail = workEmail.trim().toLowerCase();
    const now = Date.now();
    if (recentSubmissions.has(cleanEmail)) {
      const lastSub = recentSubmissions.get(cleanEmail);
      if (now - lastSub < RATE_LIMIT_WINDOW_MS) {
        return {
          statusCode: 429,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Too many requests. Please wait a moment before resubmitting.' })
        };
      }
    }
    recentSubmissions.set(cleanEmail, now);

    // Clean up old entries
    for (const [key, timestamp] of recentSubmissions.entries()) {
      if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
        recentSubmissions.delete(key);
      }
    }

    // 6. Build sanitized payload for dispatch
    const sanitizedPayload = {
      fullName: fullName.trim().slice(0, 100),
      workEmail: cleanEmail.slice(0, 120),
      organization: organization.trim().slice(0, 150),
      facilityScale: (facilityScale || '').trim().slice(0, 150),
      enquiryType: (enquiryType || 'General Consultation').slice(0, 80),
      practiceArea: (practiceArea || 'General').slice(0, 80),
      urgency: (urgency || 'Standard').slice(0, 80),
      projectBrief: projectBrief.trim().slice(0, 2000),
      consentMarketing: Boolean(consentMarketing),
      timestamp: new Date().toISOString(),
      source: 'proengineering_advisory_portal'
    };

    // 7. Secure server-side webhook dispatch with strict HTTPS-only enforcement
    const webhookEndpoint = process.env.ADVISORY_WEBHOOK_URL;

    if (!webhookEndpoint) {
      console.warn('[ADVISORY_GATEWAY] ADVISORY_WEBHOOK_URL is not configured on server.');
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Advisory dispatch gateway is temporarily unconfigured. Please email brief directly to amaresh.das3@gmail.com.'
        })
      };
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(webhookEndpoint);
    } catch (urlErr) {
      console.error('[ADVISORY_GATEWAY] Invalid ADVISORY_WEBHOOK_URL:', urlErr.message);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Advisory gateway configuration error: invalid dispatch URL.'
        })
      };
    }

    // Strictly enforce HTTPS-only to prevent transmitting PII over unencrypted channels
    if (parsedUrl.protocol !== 'https:') {
      console.error('[ADVISORY_GATEWAY] Insecure dispatch URL rejected:', parsedUrl.protocol);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Insecure dispatch URL rejected: HTTPS is strictly required for data protection.'
        })
      };
    }

    const dispatchResult = await new Promise((resolve) => {
      try {
        const postData = JSON.stringify(sanitizedPayload);

        const reqOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'ProEngineering-Advisory-Gateway/1.0'
          },
          timeout: parseInt(process.env.ADVISORY_DISPATCH_TIMEOUT_MS || '7000', 10)
        };

        const req = https.request(reqOptions, (res) => {
          let responseBody = '';
          res.on('data', chunk => { responseBody += chunk; });
          res.on('end', () => {
            const code = res.statusCode || 0;
            if (code >= 200 && code < 300) {
              resolve({ success: true, statusCode: code });
            } else {
              resolve({ success: false, statusCode: code, error: `Upstream HTTP ${code}: ${responseBody.slice(0, 100)}` });
            }
          });
        });

        req.on('error', (err) => {
          resolve({ success: false, error: `Socket error: ${err.message}` });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, error: 'Upstream gateway connection timed out' });
        });

        req.write(postData);
        req.end();
      } catch (err) {
        resolve({ success: false, error: `Dispatch error: ${err.message}` });
      }
    });

    // 8. Handle upstream failure truthfully (Return 502 Bad Gateway)
    if (!dispatchResult.success) {
      console.error('[ADVISORY_GATEWAY] Delivery failure:', dispatchResult.error || `HTTP ${dispatchResult.statusCode}`);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Upstream notification delivery failed. Please use the direct email link below.',
          details: dispatchResult.error || `HTTP ${dispatchResult.statusCode}`
        })
      };
    }

    // 9. Return success ONLY upon confirmed upstream gateway acceptance
    console.log('[ADVISORY_GATEWAY] Accepted by notification gateway (HTTP', dispatchResult.statusCode + ')');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        status: 'accepted_by_notification_gateway',
        message: 'Your enquiry has been accepted by our notification service for forwarding. We will review your requirements and respond within one business day.'
      })
    };

  } catch (err) {
    console.error('Server intake exception:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'An internal error occurred while processing your request. Please email amaresh.das3@gmail.com directly.'
      })
    };
  }
};
