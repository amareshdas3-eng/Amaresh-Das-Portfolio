"""
generate_playbook_master.py: Compiles the complete publication-grade HTML master eBook
'Capital Infrastructure & Plant Reliability Playbook' by Amaresh Das, PMP®.
Includes print CSS @page rules, running headers/footers, table of contents,
10 technical chapters, diagrams, checklists, and live interactive prototype showcases.
"""

import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

PLAYBOOK_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Capital Infrastructure &amp; Plant Reliability Playbook — Amaresh Das, PMP®</title>
  <meta name="description" content="Field-Tested Frameworks, Commissioning Risk Elimination, and Agentic AI Controls for Heavy Industrial Engineering. By Amaresh Das, PMP®.">
  
  <!-- Typography: Source Sans 3 & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'JetBrains Mono', monospace;
        font-size: 9pt;
        color: #64748b;
      }
      @bottom-left {
        content: "Amaresh Das, PMP® · Capital Infrastructure Playbook";
        font-family: 'Source Sans 3', sans-serif;
        font-size: 8.5pt;
        color: #94a3b8;
      }
    }

    :root {
      --navy: #0c2038;
      --navy-deep: #081627;
      --accent-blue: #0284c7;
      --sky: #38bdf8;
      --outcome-green: #15803d;
      --outcome-bg: #f0fdf4;
      --danger-red: #b91c1c;
      --danger-bg: #fef2f2;
      --warning-amber: #b45309;
      --warning-bg: #fffbeb;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --bg-alt: #f8fafc;
      --font-body: 'Source Sans 3', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', Consolas, monospace;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: var(--font-body);
      font-size: 10.5pt;
      line-height: 1.6;
      color: var(--text);
      background: #ffffff;
    }

    /* Print & Page Break Helpers */
    .page-break { page-break-before: always; }
    .avoid-break { page-break-inside: avoid; }
    
    /* Cover Page */
    .cover-page {
      min-height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20mm 10mm 15mm 10mm;
      background: linear-gradient(175deg, #081627 0%, #0c2038 55%, #132e52 100%);
      color: #ffffff;
      border-radius: 4px;
      page-break-after: always;
    }

    .cover-eyebrow {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--sky);
      margin-bottom: 12mm;
      padding: 4px 10px;
      background: rgba(56, 189, 248, 0.12);
      border-left: 3px solid var(--sky);
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      margin-bottom: 6mm;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 400;
      line-height: 1.5;
      color: #94a3b8;
      max-width: 170mm;
      margin-bottom: 12mm;
    }

    .cover-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15mm;
    }

    .cover-badge {
      font-family: var(--font-mono);
      font-size: 8.5pt;
      font-weight: 600;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 3px;
      color: #e2e8f0;
    }

    .cover-badge.highlight {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #a7f3d0;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 8mm;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .author-name {
      font-size: 14pt;
      font-weight: 700;
      color: #ffffff;
    }

    .author-title {
      font-size: 9.5pt;
      color: #94a3b8;
      margin-top: 2px;
    }

    .edition-info {
      text-align: right;
      font-family: var(--font-mono);
      font-size: 8.5pt;
      color: #64748b;
    }

    /* Standard Layout */
    .book-container {
      max-width: 190mm;
      margin: 0 auto;
      padding: 4mm 0;
    }

    h1, h2, h3, h4 {
      color: var(--navy);
      font-weight: 700;
      line-height: 1.25;
    }

    h1 {
      font-size: 20pt;
      border-bottom: 2px solid var(--border);
      padding-bottom: 4mm;
      margin-top: 6mm;
      margin-bottom: 5mm;
    }

    h2 {
      font-size: 14pt;
      margin-top: 7mm;
      margin-bottom: 3mm;
      color: var(--navy-deep);
    }

    h3 {
      font-size: 11.5pt;
      margin-top: 5mm;
      margin-bottom: 2mm;
    }

    p { margin-bottom: 3.5mm; text-align: justify; }

    ul, ol {
      margin-left: 6mm;
      margin-bottom: 4mm;
    }

    li { margin-bottom: 1.5mm; }

    /* Callout Boxes */
    .callout {
      border-left: 4px solid var(--accent-blue);
      background: var(--bg-alt);
      padding: 3.5mm 4.5mm;
      margin: 4mm 0;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
    }

    .callout.danger {
      border-left-color: var(--danger-red);
      background: var(--danger-bg);
      color: #7f1d1d;
    }

    .callout.success {
      border-left-color: var(--outcome-green);
      background: var(--outcome-bg);
      color: #14532d;
    }

    .callout.warning {
      border-left-color: var(--warning-amber);
      background: var(--warning-bg);
      color: #78350f;
    }

    .callout-title {
      font-weight: 700;
      font-size: 9.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1.5mm;
      display: block;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 4mm 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 2.5mm 3.5mm;
      text-align: left;
    }

    th {
      background: var(--bg-alt);
      color: var(--navy);
      font-weight: 700;
    }

    tr:nth-child(even) { background: #fafafa; }

    /* ASCII / Code blocks */
    pre, code {
      font-family: var(--font-mono);
      font-size: 8.5pt;
    }

    pre {
      background: #0f172a;
      color: #f1f5f9;
      padding: 4mm;
      border-radius: 4px;
      overflow-x: auto;
      margin: 4mm 0;
      page-break-inside: avoid;
      line-height: 1.45;
    }

    /* Table of Contents */
    .toc {
      margin: 6mm 0 10mm 0;
      padding: 5mm;
      background: var(--bg-alt);
      border: 1px solid var(--border);
      border-radius: 4px;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted var(--border);
      padding: 2mm 0;
      font-size: 9.5pt;
    }

    .toc-item strong { color: var(--navy); }

    /* Links */
    a {
      color: var(--accent-blue);
      text-decoration: none;
      font-weight: 600;
    }
    a:hover { text-decoration: underline; }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2mm;
      margin-bottom: 6mm;
      font-size: 8pt;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div>
      <span class="cover-eyebrow">FIELD ENGINEERING PLAYBOOK · FIRST EDITION</span>
      <h1 class="cover-title">CAPITAL INFRASTRUCTURE &amp;<br>PLANT RELIABILITY PLAYBOOK</h1>
      <p class="cover-subtitle">
        Field-tested engineering frameworks, commissioning risk elimination, and agentic AI controls for heavy industrial power systems, substations, and multi-million dollar CAPEX delivery.
      </p>

      <div class="cover-badges">
        <span class="cover-badge highlight">23+ Years Heavy Industrial CAPEX</span>
        <span class="cover-badge highlight">$200M+ Infrastructure Delivered</span>
        <span class="cover-badge">PMP® Certified</span>
        <span class="cover-badge">IEEE C37.2 &amp; IEC 60255</span>
        <span class="cover-badge">IEC 62271-200 Switchgear</span>
        <span class="cover-badge">DCMA 14-Point P6 Forensics</span>
        <span class="cover-badge">6 Shipped Agentic AI Systems</span>
      </div>
    </div>

    <div class="cover-footer">
      <div>
        <div class="author-name">Amaresh Das, PMP®</div>
        <div class="author-title">Principal Electrical Engineer &amp; Capital Projects Director</div>
        <div style="font-size:8.5pt;color:#94a3b8;margin-top:2px;">
          Email: <a href="mailto:amaresh.das3@gmail.com" style="color:#7dd3fc;">amaresh.das3@gmail.com</a> | Web: <a href="https://amaresh-das.netlify.app/portfolio.html" style="color:#7dd3fc;">amaresh-das.netlify.app</a>
        </div>
      </div>
      <div class="edition-info">
        <div>Published: November 2026</div>
        <div>Audited Executive Release</div>
      </div>
    </div>
  </div>

  <div class="book-container">

    <!-- ==================== EXECUTIVE PREFACE ==================== -->
    <div class="header-bar">
      <span>EXECUTIVE PREFACE</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h1>Executive Preface: The 23-Year Thesis</h1>

    <p>
      In twenty-three years of directing heavy electrical infrastructure programs across metal complexes, power substations, captive generation plants, and chemical processing facilities, I have watched multi-million dollar capital budgets bleed from an identical, recurring set of blind spots.
    </p>

    <p>
      <strong>Industrial projects do not fail because engineers don't understand Ohm's Law or Maxwell's Equations. They fail at the unmanaged technical interfaces.</strong>
    </p>

    <p>
      They fail when a switchgear manufacturer's secondary wiring schematic uses a different tap polarity than the field protection engineer assumed. They fail when an EPC contractor updates a drawing to Revision 04 while the field team installs to Revision 02. They fail when a contractor masks negative critical-path float in Primavera P6 with artificial relationship lags—deferring discovery of an unavoidable commissioning collision until 48 hours before the plant's scheduled commercial operation date.
    </p>

    <div class="callout warning">
      <span class="callout-title">The High-Stakes Reality of Capital Projects</span>
      When a 33kV main breaker trips during energization, downtime costs do not scale linearly—they compound exponentially: $45,000 in utility re-scheduling penalties, $32,000/day in idle testing crews, and upwards of $150,000/day in deferred manufacturing revenue.
    </div>

    <p>
      This Playbook was authored as a practical, actionable field manual for Project Directors, VPs of Capital Engineering, Lead Owner's Engineers, and Reliability Specialists. It distills empirical failure investigations, standardized prevention checklists, and cutting-edge agentic AI engineering workflows designed to eliminate risk before capital is committed.
    </p>

    <!-- Table of Contents -->
    <div class="toc avoid-break">
      <h3 style="margin-top:0;margin-bottom:3mm;color:var(--navy);">Table of Contents</h3>
      <div class="toc-item"><span><strong>Module 1: Forensic Engineering Teardowns (Failure Post-Mortems)</strong></span><span>P. 3</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 1: Why 33kV Switchgear Commissioning Delays are 80% Avoidable</span><span>P. 4</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 2: The Anatomy of EPC Change-Order Blowouts</span><span>P. 7</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 3: Preventing Substation Tripping Cascades</span><span>P. 10</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 4: Industrial Grid Decarbonization &amp; Fast Islanding</span><span>P. 13</span></div>
      <div class="toc-item"><span><strong>Module 2: Field Checklists &amp; Operational Diagnostics</strong></span><span>P. 16</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 5: Pre-Bid Specification Review Checklist (The 20-Point Trap Filter)</span><span>P. 17</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 6: Plant Reliability &amp; Failure Mode Evaluation Matrix (FMEA/MTBF)</span><span>P. 20</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 7: DCMA 14-Point Schedule Integrity Diagnostic (P6 Forensics)</span><span>P. 23</span></div>
      <div class="toc-item"><span><strong>Module 3: Modern Agentic AI &amp; Digital Engineering Controls</strong></span><span>P. 26</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 8: Automated Spec Cross-Referencing &amp; Drawing Takeoff Automation</span><span>P. 27</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 9: The Six Production Engineering Prototypes</span><span>P. 30</span></div>
      <div class="toc-item"><span><strong>Module 4: Professional Engagement Pathways</strong></span><span>P. 33</span></div>
      <div class="toc-item"><span>&nbsp;&nbsp;• Chapter 10: How We Can Work Together &amp; Executive Roster</span><span>P. 34</span></div>
    </div>

    <!-- ==================== MODULE 1 ==================== -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 1 · FORENSIC ENGINEERING TEARDOWNS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h1>Module 1: Forensic Engineering Teardowns</h1>
    <p><em>Post-mortems of high-consequence electrical infrastructure failures and the definitive protocols to prevent them.</em></p>

    <!-- Chapter 1 -->
    <h2>Chapter 1: Why 33kV Switchgear Commissioning Delays are 80% Avoidable</h2>
    
    <p>
      In modern substation delivery, Day 180 is often where projects encounter catastrophic delays. Civil works are complete; gas-insulated switchgear (GIS) or metal-clad lineups are installed on concrete pads; the utility tie-in is scheduled for a strict 48-hour window.
    </p>

    <p>
      The crew closes the main incoming breaker. Within 420 milliseconds, the upstream protection trips on instantaneous overcurrent (ANSI 50). The plant goes dark.
    </p>

    <pre>
[OEM FACTORY FAT]               [EPC INTERFACE]                [FIELD ENERGIZATION]
Relay programmed with      -->  Single-Line Diagram updated    --> Transformer magnetizing inrush
factory default pickup (5A).    to Rev 04; field relay         peaks at 8x FLA for 100ms.
CT wired to 600:5 tap.          installed with Rev 02 curve.   Instantaneous trip occurs!
    </pre>

    <h3>The 3 Root Culprits Isolated in Field Audits</h3>
    
    <ol>
      <li>
        <strong>The "Default Parameter" Trap:</strong> During Factory Acceptance Testing (FAT) at the switchgear plant, numerical relays (SEL, Schneider, ABB, Siemens) are routinely powered up and tested using OEM default curves. Site-specific Time-Current Curves (TCC)—derived from the actual ETAP or SKM short-circuit and arc flash study—are deferred to site commissioning. When site schedules compress, this step is rushed or skipped entirely.
      </li>
      <li>
        <strong>CT Ratio &amp; Tap Alignment Errors:</strong> Current transformers on 33kV incomers are multi-ratio (e.g. 600/1200/2000:5A). Design specifies 1200:5A; shop technicians land wiring on the 600:5A tap. Because secondary injection during FAT is applied directly to the relay terminals (bypassing the CT secondary loop), this wiring error stays dormant until full primary load current energizes the bus.
      </li>
      <li>
        <strong>Transformer Inrush Blindness:</strong> Power transformers exhibit magnetizing inrush currents reaching 8 to 12 times Full Load Amperes (FLA) for 6 to 10 cycles. If second-harmonic restraint (ANSI 87/68) is not coordinated or harmonic blocking thresholds are disabled, the incomer relay misidentifies normal inrush as an internal bus fault.
      </li>
    </ol>

    <div class="callout success">
      <span class="callout-title">The 5-Step Commissioning Prevention Protocol</span>
      Deploy this mandatory hold-point checklist before applying primary voltage:
      <ol style="margin-bottom:0;">
        <li><strong>ETAP Model Lock:</strong> Lock short-circuit study Rev 00 and export signed relay setting files directly into the relay configuration software.</li>
        <li><strong>Primary Injection Loop Test:</strong> Inject primary current through the primary bus and verify secondary current ratio and phase polarity at the relay terminals.</li>
        <li><strong>Secondary Trip &amp; Interlock Verification:</strong> Physically trip every circuit breaker from the relay output contacts (ANSI 86 lockout relay trip coil verification).</li>
        <li><strong>Inrush Restraint Simulation:</strong> Confirm second-harmonic restraint (87H/68) is active on all differential and instantaneous overcurrent elements.</li>
        <li><strong>24-Hour Soak Authorization:</strong> Sign off all DC auxiliary battery bank load tests (IEEE 450) prior to first energization.</li>
      </ol>
    </div>

    <!-- Chapter 2 -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 1 · FORENSIC ENGINEERING TEARDOWNS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>Chapter 2: The Anatomy of EPC Change-Order Blowouts</h2>

    <p>
      In heavy industrial power systems ($20M to $200M CAPEX), unmanaged contractor change orders routinely erode 8% to 15% of project margins. Forensic analysis reveals these claims rarely stem from unforeseen subsurface conditions; they stem from <strong>vague contract battery limits and uncoordinated vendor interface matrices</strong>.
    </p>

    <table>
      <thead>
        <tr>
          <th>Interface Boundary</th>
          <th>Typical Ambiguity</th>
          <th>Financial Consequence</th>
          <th>Owner's Defense Mechanism</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Switchgear to Power Transformer</strong></td>
          <td>Cable termination kit supply vs. installation omitted from scope split.</td>
          <td>$45,000–$120,000 claim + 3-week delay for high-voltage stress cones.</td>
          <td>Enforce IEC 60137 terminal boundary schedule with signed vendor split.</td>
        </tr>
        <tr>
          <td><strong>SCADA / DCS Gateway to Relays</strong></td>
          <td>Contract specifies "Modbus communication" without defining register map or IEC 61850 dataset.</td>
          <td>$80,000 software variation + commissioning hold.</td>
          <td>Mandate pre-bid ICD/CID file submittals and standardized data point lists.</td>
        </tr>
        <tr>
          <td><strong>Civil Pad to Equipment Base</strong></td>
          <td>Anchor bolt embedment tolerances (±5mm) clash with heavy steel base channel dimensions.</td>
          <td>$60,000 concrete chipping, chemical anchor retrofits, seismic re-certification.</td>
          <td>Require OEM certified General Arrangement (GA) drawings before foundation pours.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout danger">
      <span class="callout-title">Forensic Claim Defense Protocol</span>
      When an EPC contractor submits an unbudgeted variation claim for "site interface clashes":
      1. Audit the original Request for Proposal (RFP) specification against Division 26 battery-limit clauses.
      2. Verify whether the contractor issued an RFI within the mandatory 14-day discovery window.
      3. Cross-reference the engineering submittal register: if the contractor proceeded to procure or fabricate prior to receiving an Approved for Construction (AFC) stamp, the rework liability remains 100% with the contractor.
    </div>

    <!-- Chapter 3 -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 1 · FORENSIC ENGINEERING TEARDOWNS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>Chapter 3: Preventing Substation Tripping Cascades</h2>

    <p>
      A tripping cascade occurs when a localized feeder fault fails to clear within its designated zone, forcing upstream bus-tie or incomer circuit breakers to trip and knocking out the entire facility.
    </p>

    <pre>
   [Utility 132kV Grid]
           |
       [Incomer CB] ---- Relays: 50/51, 67, 87T (Time Delay: 800ms)
           |
     [33kV Main Bus]
      /           \
[Feeder 1]     [Feeder 2] --- Relays: 50/51, 67N (Time Delay: 300ms)
    |               |
[Motor MCC]   [Transformer]
    </pre>

    <h3>Critical Protective Coordination Rules (IEEE C37.2 &amp; IEC 60255)</h3>
    <ul>
      <li>
        <strong>Minimum Grading Margin (&Delta;t &ge; 250ms–300ms):</strong> To ensure selective tripping between downstream vacuum contactors and upstream circuit breakers, maintain a strict 250ms grading margin to account for breaker mechanical opening time (50ms), relay overshoot (30ms), and CT saturation safety buffer.
      </li>
      <li>
        <strong>Directional Overcurrent (ANSI 67/67N) on Parallel Incomers:</strong> When two transformers feed a common bus with bus-tie closed, a fault on one incoming cable will draw fault current from the healthy incomer across the bus. Without directional relays sensing reverse current flow, both incomers trip simultaneously, triggering total blackout.
      </li>
      <li>
        <strong>Restricted Earth Fault (REF / ANSI 87N) Zone Boundary:</strong> Always configure high-impedance or low-impedance REF on transformer star windings to achieve sub-40ms tripping for ground faults near the neutral point without nuisance tripping on external through-faults.
      </li>
    </ul>

    <!-- Chapter 4 -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 1 · FORENSIC ENGINEERING TEARDOWNS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>Chapter 4: Industrial Grid Decarbonization &amp; Fast Islanding</h2>

    <p>
      As industrial plants integrate on-site solar PV, battery energy storage (BESS), and captive gas turbines to meet decarbonization mandates, the electrical system faces a dangerous loss of <strong>rotational physical inertia</strong>.
    </p>

    <div class="callout warning">
      <span class="callout-title">The Low-Inertia Instability Risk</span>
      Inverter-based renewable resources provide zero physical inertia. When a sudden utility grid disturbance occurs, the Rate of Change of Frequency (ROCOF, df/dt) accelerates rapidly. Traditional under-frequency relays (ANSI 81U) cannot shed load fast enough to prevent captive turbine trip-outs.
    </div>

    <h3>The 3 Pillars of Resilient Microgrid Islanding</h3>
    <ol>
      <li>
        <strong>High-Speed ROCOF Protection (ANSI 81R):</strong> Configure 81R relays with dynamic window filtering (typically 5 to 10 cycles) set between 0.5 Hz/s and 1.2 Hz/s to initiate breaker trip within 40ms of utility grid loss, preventing out-of-phase islanding.
      </li>
      <li>
        <strong>Synchrocheck Auto-Transfer (ANSI 25):</strong> Prevent damaging out-of-phase reclosure when islanded captive generation reconnects to the utility. Enforce strict phase angle (&le; 10&deg;), voltage slip (&le; 0.1 Hz), and voltage differential (&le; 5%) interlocks.
      </li>
      <li>
        <strong>Fast Under-Frequency Load Shedding (UFLS):</strong> Group plant motor loads into 3 priority tiers. Tier 1 (non-essential cooling, water treatment) sheds at 49.2 Hz; Tier 2 (auxiliary processing) sheds at 48.8 Hz; preserving Tier 3 (critical safety drives, furnace cooling) at 48.4 Hz.
      </li>
    </ol>

    <!-- ==================== MODULE 2 ==================== -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 2 · FIELD CHECKLISTS &amp; DIAGNOSTICS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h1>Module 2: Field Checklists &amp; Operational Diagnostics</h1>
    <p><em>Standardized gate review frameworks to protect capital investments from pre-bid to commercial operation.</em></p>

    <!-- Chapter 5 -->
    <h2>Chapter 5: Pre-Bid Specification Review Checklist (The 20-Point Trap Filter)</h2>

    <p>
      Reviewing multi-thousand page tender specifications under tight bid deadlines is a high-risk endeavor. This 20-point filter flags the most dangerous scope traps before bid submission:
    </p>

    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Inspection Point</th>
          <th>Risk Level</th>
          <th>Action Required</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Environmental</strong></td>
          <td>Ambient temperature rating (&gt; 45&deg;C) and de-rating factors applied to switchgear busbars.</td>
          <td>HIGH</td>
          <td>Verify busbar cross-section accommodates heat dissipation without exceeding 105&deg;C limit.</td>
        </tr>
        <tr>
          <td><strong>Short Circuit</strong></td>
          <td>Short circuit withstand rating (31.5kA / 40kA for 3 sec) verified against utility maximum fault level.</td>
          <td>CRITICAL</td>
          <td>Confirm circuit breaker symmetrical breaking capacity exceeds grid contribution + 10% safety margin.</td>
        </tr>
        <tr>
          <td><strong>Protection</strong></td>
          <td>CT secondary ratings (1A vs 5A) and knee-point voltage (Vk) requirements for differential schemes.</td>
          <td>CRITICAL</td>
          <td>Calculate CT burden and verify saturation will not occur during maximum through-fault current.</td>
        </tr>
        <tr>
          <td><strong>Cable Entry</strong></td>
          <td>Top vs. bottom cable entry and requirement for non-magnetic gland plates on single-core cables.</td>
          <td>MEDIUM</td>
          <td>Prevent eddy current heating by mandating aluminum gland plates on all cables &gt; 300mm&sup2;.</td>
        </tr>
        <tr>
          <td><strong>Auxiliary Power</strong></td>
          <td>DC control supply voltage (110V vs 220V DC) and dual trip coil redundancy specification.</td>
          <td>HIGH</td>
          <td>Ensure battery bank capacity (AH) supports 8-hour autonomy + emergency trip-close-trip duty.</td>
        </tr>
      </tbody>
    </table>

    <!-- Chapter 6 -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 2 · FIELD CHECKLISTS &amp; DIAGNOSTICS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>Chapter 6: Plant Reliability &amp; Failure Mode Evaluation Matrix</h2>

    <p>
      Ensuring 98%+ plant availability requires transitioning from reactive maintenance to an <strong>evidence-constrained reliability program</strong>.
    </p>

    <table>
      <thead>
        <tr>
          <th>Critical Asset</th>
          <th>Primary Failure Mode</th>
          <th>Lead Diagnostic Indicator</th>
          <th>Standard / Threshold</th>
          <th>Intervention Protocol</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>11kV / 3.3kV Motors</strong></td>
          <td>Stator winding insulation degradation.</td>
          <td>Partial Discharge (PD) &amp; Insulation Resistance (IR).</td>
          <td>IEEE 43: IR &ge; 100 M&Omega;; Polarization Index (PI) &gt; 2.0.</td>
          <td>Schedule dry-out bake or vacuum pressure impregnation (VPI) overhaul.</td>
        </tr>
        <tr>
          <td><strong>Power Transformers</strong></td>
          <td>Thermal degradation of cellulose paper insulation.</td>
          <td>Dissolved Gas Analysis (DGA) in mineral oil.</td>
          <td>IEEE C57.104: Acetylene (C2H2) &gt; 1 ppm indicates arcing.</td>
          <td>De-energize for immediate internal inspection and tap changer contact check.</td>
        </tr>
        <tr>
          <td><strong>33kV Switchgear</strong></td>
          <td>Busbar contact overheating &amp; partial discharge.</td>
          <td>Infrared Thermography &amp; Transient Earth Voltage (TEV).</td>
          <td>NFPA 70B: &Delta;T &gt; 15&deg;C between phases indicates critical resistance.</td>
          <td>Torque bolts to OEM specification and re-silver plate mating contact surfaces.</td>
        </tr>
      </tbody>
    </table>

    <!-- Chapter 7 -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 2 · FIELD CHECKLISTS &amp; DIAGNOSTICS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>Chapter 7: DCMA 14-Point Schedule Integrity Diagnostic (Primavera P6 Forensics)</h2>

    <p>
      Primavera P6 schedules submitted by EPC contractors often hide critical delays through artificial logic tricks. The Defense Contract Management Agency (DCMA) 14-point assessment provides an objective audit baseline:
    </p>

    <pre>
[DCMA 14-POINT HEALTH SCORECARD]
1. Logic: > 95% of activities must have predecessor and successor logic ties.
2. Leads (Negative Lag): 0% permitted. Negative lags are schedule manipulation.
3. Lags: < 5% of relationships may use positive lags.
4. Relationship Types: > 90% must be Finish-to-Start (FS).
5. Hard Constraints: < 5% of uncompleted activities may have mandatory constraints.
6. High Float: < 5% of activities may have Total Float > 44 working days.
7. Negative Float: 0% permitted. Negative float indicates an impossible schedule.
8. Critical Path Test: Introducing a 10-day delay on the critical path must extend completion date by 10 days.
    </pre>

    <div class="callout success">
      <span class="callout-title">The Critical Path Length Index (CPLI) Formula</span>
      <p style="margin-bottom:2mm;">Evaluate overall project schedule health using the CPLI ratio:</p>
      <code>CPLI = (Critical Path Length + Total Float) / Critical Path Length</code>
      <p style="margin-top:2mm;margin-bottom:0;">A CPLI &ge; 1.0 indicates schedule health. A CPLI &lt; 0.95 indicates a compromised critical path requiring immediate work-package re-sequencing.</p>
    </div>

    <!-- ==================== MODULE 3 ==================== -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 3 · AGENTIC AI &amp; DIGITAL CONTROLS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h1>Module 3: Modern Agentic AI &amp; Digital Engineering Controls</h1>
    <p><em>Pioneering production-grade multi-agent autonomous engineering intelligence for industrial project controls.</em></p>

    <!-- Chapter 8 -->
    <h2>Chapter 8: Automated Spec Cross-Referencing &amp; Drawing Takeoffs</h2>

    <p>
      Legacy EPC workflows waste thousands of senior engineering hours manually cross-checking tender specifications against drawings, vendor submittals, and international codes.
    </p>

    <pre>
   [Tender Specifications]           [Single-Line Diagrams]
   (Multi-thousand page PDF)          (AutoCAD / PDF / DWG)
              \                             /
               \                           /
        +-----------------------------------------+
        |   Deterministic Schema Extraction Gate  |
        |   • Regex &amp; Epistemic Validation Engine |
        |   • Zod Schema Evidence Contracts       |
        +-----------------------------------------+
                            |
                            v
        +-----------------------------------------+
        |   Discrepancy Cross-Referencing Graph   |
        |   • CT Tap vs. Relay Setting Mismatch   |
        |   • Cable Size vs. Breaker Rating Gap   |
        |   • Missing Standards References        |
        +-----------------------------------------+
                            |
                            v
        [Actionable Discrepancy Matrix (CSV/JSON)]
    </pre>

    <p>
      By enforcing <strong>Zod schema evidence contracts</strong>, AI engineering tools eliminate hallucination risks. Every claim must cite an exact drawing callout or specification clause ID, reducing document review latency by 40% while preserving statutory engineering rigor.
    </p>

    <!-- Chapter 9 -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 3 · AGENTIC AI &amp; DIGITAL CONTROLS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>Chapter 9: The Six Production Engineering Prototypes</h2>

    <p>
      These fully deployed, browser-executable platforms demonstrate the fusion of heavy industrial electrical engineering with modern autonomous multi-agent systems:
    </p>

    <table>
      <thead>
        <tr>
          <th>System &amp; Technology</th>
          <th>Core Engineering Capability</th>
          <th>Live Interactive URL</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Engineering Delivery Intelligence (EDI)</strong><br><span style="font-size:8pt;color:#64748b;">React 19, TypeScript, Lucide</span></td>
          <td>Deterministic project assurance engine verifying EPC deliverables and contractor progress claims.</td>
          <td><a href="https://amareshdas3-eng.github.io/engineering-delivery-intelligence/" target="_blank">Launch EDI ⚡</a></td>
        </tr>
        <tr>
          <td><strong>20 Construction AI Skills Suite</strong><br><span style="font-size:8pt;color:#64748b;">100% Local Multi-Agent Suite</span></td>
          <td>Zero-cloud engineering workbench automating spec review, drawing takeoffs, and P6 audits.</td>
          <td><a href="https://amareshdas3-eng.github.io/construction-ai-20-skills/" target="_blank">Launch Suite 🏗️</a></td>
        </tr>
        <tr>
          <td><strong>Industrial Electrical Agentic RCA</strong><br><span style="font-size:8pt;color:#64748b;">FastAPI, React, IEEE C37.2</span></td>
          <td>Single-Line Diagram root-cause analysis engine reconstructing relay trip cascades.</td>
          <td><a href="https://amareshdas3-eng.github.io/industrial-electrical-agentic-rca/" target="_blank">Launch RCA ⚡</a></td>
        </tr>
        <tr>
          <td><strong>Multi-Agent Predictive Maintenance</strong><br><span style="font-size:8pt;color:#64748b;">LangGraph, SQLite 3, CMMS</span></td>
          <td>Autonomous condition monitoring for 11kV transformers, MCCs, and VFD drives.</td>
          <td><a href="https://amareshdas3-eng.github.io/multiagent-predictive-maintenance/" target="_blank">Launch PdM 🏭</a></td>
        </tr>
        <tr>
          <td><strong>Industrial Failure Intelligence (IFIA)</strong><br><span style="font-size:8pt;color:#64748b;">Zod Contracts, Popperian RCA</span></td>
          <td>Evidence-constrained failure intelligence engine refuting false trip hypotheses.</td>
          <td><a href="https://amareshdas3-eng.github.io/IFIA/" target="_blank">Launch IFIA 🛡️</a></td>
        </tr>
        <tr>
          <td><strong>Remote Job Accelerator (Career OS)</strong><br><span style="font-size:8pt;color:#64748b;">Next.js 14, TailwindCSS</span></td>
          <td>Autonomous career OS matching senior capital project leadership with remote opportunities.</td>
          <td><a href="https://rja-accelerator-v43.netlify.app" target="_blank">Launch RJA 🎯</a></td>
        </tr>
      </tbody>
    </table>

    <!-- ==================== MODULE 4 ==================== -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>MODULE 4 · PROFESSIONAL ENGAGEMENT PATHWAYS</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h1>Module 4: Professional Engagement Pathways</h1>

    <p>
      I partner with industrial asset owners, infrastructure investment funds, EPC contractors, and technology leaders across three primary engagement structures:
    </p>

    <!-- Model 1 -->
    <div class="callout" style="border-left-color:var(--navy);">
      <span class="callout-title">Model 1: Owner's Engineer &amp; Technical Advisor (Fractional Retainer)</span>
      <p style="margin-bottom:2mm;">
        <strong>Commitment:</strong> 10 to 20 reserved hours per month.<br>
        <strong>Scope:</strong> Independent review of tender specifications, vendor package technical due diligence (FAT/SAT), commissioning hold-point verification, and monthly contractor invoice audit against verified IFC deliverables.<br>
        <strong>Ideal For:</strong> Private Equity operating partners and plant owners preparing for major electrical expansions or plant turnarounds.
      </p>
      <a href="mailto:amaresh.das3@gmail.com?subject=Inquiry:%20Fractional%20Technical%20Advisory">Inquire About Fractional Advisory &rarr;</a>
    </div>

    <!-- Model 2 -->
    <div class="callout success">
      <span class="callout-title">Model 2: Root Cause Analysis &amp; Diagnostic Sprint (Focused Turnaround)</span>
      <p style="margin-bottom:2mm;">
        <strong>Commitment:</strong> 2- to 4-week fixed-scope intervention.<br>
        <strong>Scope:</strong> Urgent on-site or remote post-mortem of recurring breaker trips, arc-flash incidents, or motor stator failures. Includes sub-second sequence of events (SOE) reconstruction, relay setting re-calculation (IEEE C37.2 / IEC 60255), and definitive corrective action roadmap.<br>
        <strong>Ideal For:</strong> Operating facilities experiencing unscheduled production outages or commissioning holds.
      </p>
      <a href="mailto:amaresh.das3@gmail.com?subject=Inquiry:%20Technical%20RCA%20%26%20Diagnostic%20Review">Request Technical RCA Review &rarr;</a>
    </div>

    <!-- Model 3 -->
    <div class="callout warning">
      <span class="callout-title">Model 3: Program Director / Senior Remote PM (Full-Time Remote Leadership)</span>
      <p style="margin-bottom:2mm;">
        <strong>Commitment:</strong> Full-time long-term contract or executive employment.<br>
        <strong>Scope:</strong> Complete end-to-end management of multi-million dollar capital programs ($25M+ to $100M+ CAPEX) from FEED through EPC contractor management, asynchronous cross-border engineering governance, and statutory commercial handover.<br>
        <strong>Ideal For:</strong> International EPCMs and energy transition developers executing high-consequence capital packages.
      </p>
      <a href="mailto:amaresh.das3@gmail.com?subject=Leadership:%20Senior%20Remote%20Program%20Director%20Role">Discuss Leadership Role &rarr;</a>
    </div>

    <!-- Author Bio & Directory -->
    <div class="page-break"></div>
    <div class="header-bar">
      <span>AUTHOR BIOGRAPHY &amp; DIRECTORY</span>
      <span>CAPITAL INFRASTRUCTURE PLAYBOOK</span>
    </div>

    <h2>About the Author</h2>

    <p>
      <strong>Amaresh Das, MBA, AMIE, PMP®</strong> is a Principal Electrical Engineer, Senior Capital Projects Director, and Industrial AI Systems Architect with over 23 years of hands-on experience directing high-consequence heavy industrial electrical engineering, power substations (33kV/11kV), and $200M+ EPC capital delivery across global jurisdictions.
    </p>

    <p>
      He has successfully led major engineering packages and project controls across Tier-1 industrial conglomerates (including Aditya Birla Group, Deepak Mining, and ABB partner projects), maintaining a 100% statutory safety track record and delivering 98%+ plant availability across continuous 24/7 operating environments.
    </p>

    <div class="callout" style="background:#f1f5f9;border-left-color:var(--navy-deep);">
      <span class="callout-title">Executive Contact &amp; Portfolio Directory</span>
      <ul style="margin-bottom:0;">
        <li>🏛️ <strong>Master Executive Portfolio:</strong> <a href="https://amaresh-das.netlify.app/portfolio.html" target="_blank">https://amaresh-das.netlify.app/portfolio.html</a></li>
        <li>📄 <strong>2-Page Executive Capability Deck:</strong> <a href="https://amaresh-das.netlify.app/deck" target="_blank">https://amaresh-das.netlify.app/deck</a></li>
        <li>💻 <strong>GitHub Authority Systems:</strong> <a href="https://github.com/amareshdas3-eng" target="_blank">https://github.com/amareshdas3-eng</a></li>
        <li>💼 <strong>LinkedIn Profile:</strong> <a href="https://linkedin.com/in/amaresh-das" target="_blank">https://linkedin.com/in/amaresh-das</a></li>
        <li>📧 <strong>Direct Email:</strong> <a href="mailto:amaresh.das3@gmail.com">amaresh.das3@gmail.com</a></li>
        <li>📞 <strong>Direct Phone:</strong> +91 94370 85609 / +1 628 296 2962</li>
      </ul>
    </div>

    <p style="text-align:center;font-size:8.5pt;color:var(--text-muted);margin-top:12mm;">
      &copy; 2026 Amaresh Das, PMP®. All rights reserved. Free for commercial and private engineering use.<br>
      Published via the Capital Projects Authority Platform.
    </p>

  </div>

</body>
</html>
"""

def generate_playbook():
    output_html = "D:/Amaresh-Das-Portfolio/industrial_capital_projects_playbook.html"
    with open(output_html, "w", encoding="utf-8") as f:
        f.write(PLAYBOOK_HTML)
    print(f"Generated Playbook HTML Master at: {output_html} ({len(PLAYBOOK_HTML)} chars)")

    # Also sync into d:\PM\06_Conversion_and_Engagement_Infrastructure
    pm_html = "d:/PM/06_Conversion_and_Engagement_Infrastructure/industrial_capital_projects_playbook.html"
    os.makedirs(os.path.dirname(pm_html), exist_ok=True)
    with open(pm_html, "w", encoding="utf-8") as f:
        f.write(PLAYBOOK_HTML)
    print(f"Synchronized into PM Workspace at: {pm_html}")

if __name__ == "__main__":
    generate_playbook()

