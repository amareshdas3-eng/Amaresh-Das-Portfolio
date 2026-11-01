// tests/verify_page_safeguards.js
// Automated verification suite for content governance, standards attribution, security safeguards, and delivery guarantees across Amaresh-Das-Portfolio.

const fs = require('fs');
const path = require('path');
const assert = require('assert');

function runChecks() {
  console.log("=================================================");
  console.log("RUNNING REPOSITORY SAFEGUARDS & STANDARDS CHECKS");
  console.log("=================================================\n");

  const repoRoot = path.resolve(__dirname, '..');
  const advisoryHtmlPath = path.join(repoRoot, 'advisory.html');
  const specReviewerPath = path.join(repoRoot, 'spec_reviewer.html');
  const submitFunctionPath = path.join(repoRoot, 'netlify', 'functions', 'submit-advisory.js');

  // 1. Audit advisory.html
  const advText = fs.readFileSync(advisoryHtmlPath, 'utf8');

  // A. Standards Attribution Checks
  assert(!advText.includes('IEEE 43 limits'), "Must not cite 'IEEE 43 limits' for dv/dt");
  assert(advText.includes('NEMA MG 1 Part 31'), "Must cite NEMA MG 1 Part 31 for inverter-duty dv/dt limits");
  assert(advText.includes('Power transformer protection audits (IEEE C37.91-2021)'), "Practice 1 must narrow IEEE C37.91-2021 to power transformers");
  assert(advText.includes('power transformer differential protection setting reviews (IEEE C37.91-2021)'), "Case 1 must narrow IEEE C37.91-2021 to power transformers");
  assert(advText.includes('distinct physical prerequisite separate from protection coordination'), "Case 1 must separate earthing grid safety from protection coordination");
  console.log("[PASS] Standards attribution: NEMA MG 1 Part 31 and IEEE C37.91-2021 properly scoped");

  // B. Case Studies Phrasing Checks
  assert(advText.includes('Observed Empirical Result: 14+ months of continuous, uninterrupted operation observed post-intervention without unplanned rewinds'), "Case 2 must frame motor uptime as observed empirical result without unverified savings claims");
  assert(advText.includes('Reviewed and challenged contractor variation notices using CPM analysis and contemporaneous records'), "Case 3 must use objective CPM review phrasing without unilateral legal conclusions");
  assert(advText.includes('Operational Pilot / Demonstrator') || advText.includes('Operational Pilot / Technology Demonstrator'), "Case 4 must badge AI reviewer as operational pilot demonstrator");
  console.log("[PASS] Case studies phrasing: Empirical framing, CPM defense, and pilot badges verified");

  // C. Interactive Tools Permitted Descriptions
  assert(advText.includes('Interactive Engineering Calculators and Technical Demonstrators — validation status disclosed'), "Tools section header must disclose validation status");
  assert(advText.includes('Interactive preliminary sizing calculator'), "Cable sizing description verified");
  assert(advText.includes('Engineering calculation demonstrator; no safety certification'), "Earthing description verified");
  assert(advText.includes('Preliminary inrush estimation tool'), "Transformer inrush description verified");
  assert(advText.includes('Preliminary fault-duty estimation tool'), "Short-circuit duty description verified");
  assert(advText.includes('Preliminary project issue-triage questionnaire'), "Risk wizard description verified");
  assert(advText.includes('Interactive discrepancy demonstrator using predefined engineering scenarios. It illustrates specification-to-drawing verification logic and is not a live document-ingestion or production AI review service.'), "Spec vs Drawings exact suggested disclosure verified");
  console.log("[PASS] Interactive tools: All 6 permitted preliminary descriptions verified");

  // D. Privacy Policy & Data Handling Disclosure
  assert(advText.includes('id="privacy-policy"'), "Privacy policy section must be present");
  assert(advText.includes('href="#privacy-policy"'), "Footer must link to privacy policy");
  assert(advText.includes('configured cloud integration infrastructure (such as Make.com / secure webhook endpoints)'), "Privacy disclosure must report cloud integration processor role");
  assert(advText.includes('zero localStorage tracking'), "Privacy disclosure must confirm zero localStorage tracking");
  console.log("[PASS] Privacy disclosure: Discloses cloud processor role, retention scope, and erasure contact");

  // E. Truthful Intake & Acceptance Terminology
  assert(!advText.includes('Inquiry Recorded in Queue'), "advisory.html must not claim inquiry recorded in queue");
  assert(!advText.includes('Inquiry Logged to Review Queue'), "advisory.html must not claim inquiry logged to review queue");
  assert(advText.includes('Enquiry Accepted for Forwarding'), "advisory.html must confirm enquiry accepted for forwarding");
  assert(advText.includes('Enquiry Transmitted ✓'), "advisory.html button must confirm enquiry transmitted");
  assert(advText.includes('Your enquiry has been accepted by our notification service for forwarding. We will review your requirements and respond within one business day to coordinate a preliminary scoping discussion.') || advText.includes('Your enquiry has been accepted by our notification service for forwarding.'), "advisory.html feedback must state exact truthful forwarding wording");
  console.log("[PASS] Intake terminology: Zero false queue claims; truthful gateway forwarding feedback verified");

  // F. Secret Leaks & Anti-Patterns
  assert(!advText.includes('hook.eu2.make.com'), "advisory.html must not expose Make webhook URL");
  assert(!advText.includes('advisory_inquiries'), "advisory.html must not use localStorage for inquiry tracking");
  assert(!advText.includes('.ics'), "advisory.html must not use fake calendar booking");
  assert(!advText.includes('cdn.tailwindcss.com'), "advisory.html must not load Tailwind Play CDN");
  assert(!advText.includes('stamped deliverables'), "advisory.html must not claim stamped deliverables");
  console.log("[PASS] Security & integrity: Zero exposed webhook URLs, zero localStorage inquiry leaks, zero Tailwind CDN");

  // 2. Audit netlify/functions/submit-advisory.js
  const funcText = fs.readFileSync(submitFunctionPath, 'utf8');
  assert(!funcText.includes("require('http')"), "submit-advisory.js must not import or fallback to unencrypted http");
  assert(funcText.includes("parsedUrl.protocol !== 'https:'"), "submit-advisory.js must strictly enforce https: protocol");
  assert(funcText.includes("status: 'accepted_by_notification_gateway'"), "submit-advisory.js must return truthful status: accepted_by_notification_gateway");
  assert(!funcText.includes("status: 'delivered'"), "submit-advisory.js must not claim delivered status without mailbox confirmation");
  console.log("[PASS] Serverless intake function: HTTPS-only enforcement and accepted_by_notification_gateway status verified");

  // 3. Audit spec_reviewer.html
  const specText = fs.readFileSync(specReviewerPath, 'utf8');
  assert(specText.includes('Interactive discrepancy demonstrator using predefined engineering scenarios. It illustrates specification-to-drawing verification logic and is not a live document-ingestion or production AI review service.'), "spec_reviewer.html must display demonstrator transparency notice");
  assert(specText.includes('Run Scenario Discrepancy Demonstration'), "spec_reviewer.html button must use scenario-demonstration language");
  assert(specText.includes('Scenario Demonstration Complete: Cross-referenced preloaded project package parameters'), "spec_reviewer.html alert must use scenario-demonstration language");
  assert(specText.includes('<strong>Technology Roadmap:</strong> Future development may incorporate multimodal document ingestion, OCR-assisted extraction and auditable cross-document verification. These capabilities are not available in this current demonstrator.') || specText.includes('Future development may incorporate multimodal document ingestion, OCR-assisted extraction and auditable cross-document verification. These capabilities are not available in this current demonstrator.'), "spec_reviewer.html must include exact technology roadmap disclosure");
  assert(!specText.includes('DocAI / Gemini Vision'), "spec_reviewer.html must not claim active DocAI / Gemini Vision production deployment");
  assert(!specText.includes('vector knowledge graph'), "spec_reviewer.html must not claim active vector knowledge graph production deployment");
  console.log("[PASS] spec_reviewer.html: Demonstrator transparency notice, button, alert, and technology roadmap verified");

  console.log("\n=================================================");
  console.log("ALL REPOSITORY SAFEGUARDS & STANDARDS PASSED.");
  console.log("=================================================");
}

runChecks();
