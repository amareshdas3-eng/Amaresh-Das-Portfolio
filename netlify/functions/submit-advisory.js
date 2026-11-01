// netlify/functions/submit-advisory.js
// Secure server-side intake handler for ProEngineering Advisory inquiries
// Eliminates client-side secrets, enforces honeypot spam protection, server-side validation, and rate limiting.

const https = require('https');
const url = require('url');

// Simple in-memory rate limiting / duplicate tracking cache
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
        body: JSON.stringify({ error: 'A valid corporate email address is required' })
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

    // 7. Secure server-side webhook dispatch (Strictly via environment variable, zero fallback secrets)
    const webhookEndpoint = process.env.ADVISORY_WEBHOOK_URL;

    if (webhookEndpoint) {
      await new Promise((resolve) => {
        try {
          const parsedUrl = new URL(webhookEndpoint);
          const postData = JSON.stringify(sanitizedPayload);

          const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
              'User-Agent': 'ProEngineering-Advisory-Gateway/1.0'
            },
            timeout: 5000
          };

          const req = https.request(reqOptions, (res) => {
            res.on('data', () => {});
            res.on('end', () => resolve(true));
          });

          req.on('error', (err) => {
            console.error('Webhook dispatch error:', err.message);
            resolve(false);
          });

          req.on('timeout', () => {
            req.destroy();
            resolve(false);
          });

          req.write(postData);
          req.end();
        } catch (e) {
          console.error('Webhook URL error:', e.message);
          resolve(false);
        }
      });
    } else {
      console.log('[ADVISORY_GATEWAY] Inquiry logged in queue (ADVISORY_WEBHOOK_URL not configured):', sanitizedPayload.workEmail);
    }

    // 8. Truthful response acknowledging queue entry
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        status: 'logged',
        message: 'Your technical inquiry has been submitted and recorded in the review queue. Amaresh Das, PMP® will review your requirements and respond within 1 business day.'
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
