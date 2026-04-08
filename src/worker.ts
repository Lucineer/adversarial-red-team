export interface Env {
  ATTACK_QUEUE: Queue;
  ATTACK_RESULTS: KVNamespace;
}

interface AttackRequest {
  persona: string;
  target: string;
  intensity: number;
}

interface AttackRecord {
  id: string;
  persona: string;
  target: string;
  intensity: number;
  timestamp: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  findings?: string[];
}

const ATTACK_PERSONAS = {
  "stealth-scanner": {
    name: "Stealth Scanner",
    description: "Low-and-slow reconnaissance, evades detection",
    techniques: ["Port scanning", "Service fingerprinting", "Subdomain enumeration"]
  },
  "payload-injector": {
    name: "Payload Injector",
    description: "Attempts code/command injection vulnerabilities",
    techniques: ["SQLi", "XSS", "Command injection", "Template injection"]
  },
  "auth-cracker": {
    name: "Authentication Cracker",
    description: "Tests authentication and session mechanisms",
    techniques: ["Credential stuffing", "Session hijacking", "JWT tampering"]
  },
  "resource-stressor": {
    name: "Resource Stressor",
    description: "Overwhelms system resources to test resilience",
    techniques: ["Memory exhaustion", "CPU saturation", "Connection flooding"]
  }
};

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adversarial Red Team | Cloudflare Worker</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0f;
            color: #e5e5e5;
            line-height: 1.6;
            min-height: 100vh;
            padding: 20px;
        }
        @font-face {
            font-family: 'Inter';
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhiI2B.woff2) format('woff2');
            font-display: swap;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            border-bottom: 2px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        h1 {
            color: #dc2626;
            font-size: 2.8rem;
            margin-bottom: 10px;
        }
        .tagline {
            color: #a1a1aa;
            font-size: 1.2rem;
            margin-bottom: 30px;
        }
        .section {
            background: #161622;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #dc2626;
        }
        h2 {
            color: #f4f4f5;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        h3 {
            color: #dc2626;
            margin: 15px 0 10px;
        }
        .personas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .persona-card {
            background: #1e1e2e;
            padding: 20px;
            border-radius: 8px;
            border-top: 3px solid #dc2626;
        }
        .persona-name {
            font-weight: bold;
            font-size: 1.2rem;
            margin-bottom: 8px;
        }
        .persona-desc {
            color: #a1a1aa;
            font-size: 0.95rem;
            margin-bottom: 12px;
        }
        .techniques {
            font-size: 0.85rem;
            color: #d4d4d8;
        }
        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .step {
            background: #1e1e2e;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .step-number {
            background: #dc2626;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-weight: bold;
        }
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-card {
            background: #1e1e2e;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-value {
            font-size: 2.5rem;
            color: #dc2626;
            font-weight: bold;
        }
        .stat-label {
            color: #a1a1aa;
            margin-top: 5px;
        }
        .api-endpoints {
            margin-top: 20px;
        }
        .endpoint {
            background: #1e1e2e;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-family: monospace;
            border-left: 3px solid #3b82f6;
        }
        .method {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
        }
        .fleet-footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
            border-top: 1px solid #2d2d3a;
            padding-top: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #f4f4f5;
        }
        select, input {
            width: 100%;
            padding: 12px;
            background: #1e1e2e;
            border: 1px solid #3f3f46;
            border-radius: 6px;
            color: white;
            font-size: 1rem;
        }
        button {
            background: #dc2626;
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        button:hover {
            opacity: 0.9;
        }
        .attack-form {
            background: #161622;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .intensity-display {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            color: #a1a1aa;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Adversarial Red Team</h1>
            <div class="tagline">Auto-spawn attacker agents to harden fleet before threats</div>
        </header>

        <div class="attack-form">
            <h2>Launch Attack Simulation</h2>
            <form id="attackForm">
                <div class="form-group">
                    <label for="persona">Attack Persona</label>
                    <select id="persona" name="persona" required>
                        <option value="">Select a persona...</option>
                        <option value="stealth-scanner">Stealth Scanner</option>
                        <option value="payload-injector">Payload Injector</option>
                        <option value="auth-cracker">Authentication Cracker</option>
                        <option value="resource-stressor">Resource Stressor</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="target">Target URL/Endpoint</label>
                    <input type="text" id="target" name="target" placeholder="https://example.com/api" required>
                </div>
                <div class="form-group">
                    <label for="intensity">Attack Intensity: <span id="intensityValue">5</span></label>
                    <input type="range" id="intensity" name="intensity" min="1" max="10" value="5">
                    <div class="intensity-display">
                        <span>Low</span>
                        <span>Medium</span>
                        <span>High</span>
                    </div>
                </div>
                <button type="submit">Launch Attack Simulation</button>
            </form>
        </div>

        <div class="section">
            <h2>Attack Personas</h2>
            <div class="personas-grid">
                <div class="persona-card">
                    <div class="persona-name">Stealth Scanner</div>
                    <div class="persona-desc">Low-and-slow reconnaissance, evades detection</div>
                    <div class="techniques">Techniques: Port scanning, Service fingerprinting, Subdomain enumeration</div>
                </div>
                <div class="persona-card">
                    <div class="persona-name">Payload Injector</div>
                    <div class="persona-desc">Attempts code/command injection vulnerabilities</div>
                    <div class="techniques">Techniques: SQLi, XSS, Command injection, Template injection</div>
                </div>
                <div class="persona-card">
                    <div class="persona-name">Authentication Cracker</div>
                    <div class="persona-desc">Tests authentication and session mechanisms</div>
                    <div class="techniques">Techniques: Credential stuffing, Session hijacking, JWT tampering</div>
                </div>
                <div class="persona-card">
                    <div class="persona-name">Resource Stressor</div>
                    <div class="persona-desc">Overwhelms system resources to test resilience</div>
                    <div class="techniques">Techniques: Memory exhaustion, CPU saturation, Connection flooding</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>How It Works</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <h3>Define Attack</h3>
                    <p>Select persona, target, and intensity for simulation</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <h3>Spawn Agents</h3>
                    <p>Worker spawns attacker agents with specified parameters</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <h3>Execute Simulation</h3>
                    <p>Agents perform controlled attacks against target</p>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <h3>Report Findings</h3>
                    <p>Vulnerabilities and resilience data collected</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Security Dashboard</h2>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-value" id="totalAttacks">0</div>
                    <div class="stat-label">Total Attacks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="activeAgents">0</div>
                    <div class="stat-label">Active Agents</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="vulnerabilities">0</div>
                    <div class="stat-label">Vulnerabilities Found</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="avgIntensity">0</div>
                    <div class="stat-label">Avg. Intensity</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>API Endpoints</h2>
            <div class="api-endpoints">
                <div class="endpoint">
                    <span class="method">POST</span> /api/attack - Launch new attack simulation
                </div>
                <div class="endpoint">
                    <span class="method">GET</span> /api/attacks - List all attack simulations
                </div>
                <div class="endpoint">
                    <span class="method">GET</span> /api/dashboard - Get security dashboard data
                </div>
                <div class="endpoint">
                    <span class="method">GET</span> /health - Health check endpoint
                </div>
            </div>
        </div>

        <div class="fleet-footer">
            Adversarial Red Team | Fleet Hardening System | Cloudflare Worker
        </div>
    </div>

    <script>
        document.getElementById('intensity').addEventListener('input', function(e) {
            document.getElementById('intensityValue').textContent = e.target.value;
        });

        document.getElementById('attackForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const attackData = {
                persona: formData.get('persona'),
                target: formData.get('target'),
                intensity: parseInt(formData.get('intensity'))
            };

            const button = this.querySelector('button');
            button.disabled = true;
            button.textContent = 'Launching...';

            try {
                const response = await fetch('/api/attack', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(attackData)
                });
                
                if (response.ok) {
                    alert('Attack simulation launched successfully!');
                    this.reset();
                    document.getElementById('intensityValue').textContent = '5';
                    updateDashboard();
                } else {
                    const error = await response.text();
                    alert('Error: ' + error);
                }
            } catch (err) {
                alert('Network error: ' + err.message);
            } finally {
                button.disabled = false;
                button.textContent = 'Launch Attack Simulation';
            }
        });

        async function updateDashboard() {
            try {
                const response = await fetch('/api/dashboard');
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('totalAttacks').textContent = data.totalAttacks;
                    document.getElementById('activeAgents').textContent = data.activeAgents;
                    document.getElementById('vulnerabilities').textContent = data.vulnerabilitiesFound;
                    document.getElementById('avgIntensity').textContent = data.averageIntensity.toFixed(1);
                }
            } catch (err) {
                console.error('Failed to update dashboard:', err);
            }
        }

        // Initial dashboard load
        updateDashboard();
        // Refresh dashboard every 30 seconds
        setInterval(updateDashboard, 30000);
    </script>
</body>
</html>
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Security headers
    const securityHeaders = {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.gstatic.com; font-src https://fonts.gstatic.com;",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Health endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { 'Content-Type': 'application/json', ...securityHeaders }
      });
    }

    // API: Launch attack
    if (path === '/api/attack' && request.method === 'POST') {
      try {
        const attackData: AttackRequest = await request.json();
        
        if (!ATTACK_PERSONAS[attackData.persona as keyof typeof ATTACK_PERSONAS]) {
          return new Response(JSON.stringify({ error: 'Invalid attack persona' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders }
          });
        }

        if (attackData.intensity < 1 || attackData.intensity > 10) {
          return new Response(JSON.stringify({ error: 'Intensity must be between 1-10' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...securityHeaders }
          });
        }

        const attackId = `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const attackRecord: AttackRecord = {
          id: attackId,
          persona: attackData.persona,
          target: attackData.target,
          intensity: attackData.intensity,
          timestamp: Date.now(),
          status: 'queued',
          findings: []
        };

        // Store in KV
        await env.ATTACK_RESULTS.put(attackId, JSON.stringify(attackRecord), {
          metadata: { timestamp: Date.now() }
        });

        // Queue for processing
        await env.ATTACK_QUEUE.send({
          attackId,
          ...attackData
        });

        return new Response(JSON.stringify({ 
          message: 'Attack simulation queued', 
          attackId,
          record: attackRecord 
        }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        });
      }
    }

    // API: List attacks
    if (path === '/api/attacks' && request.method === 'GET') {
      try {
        const list = await env.ATTACK_RESULTS.list();
        const attacks: AttackRecord[] = [];
        
        for (const key of list.keys) {
          const record = await env.ATTACK_RESULTS.get(key.name, 'json');
          if (record) {
            attacks.push(record as AttackRecord);
          }
        }

        // Sort by timestamp descending
        attacks.sort((a, b) => b.timestamp - a.timestamp);

        return new Response(JSON.stringify({ attacks }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to retrieve attacks' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        });
      }
    }

    // API: Dashboard data
    if (path === '/api/dashboard' && request.method === 'GET') {
      try {
        const list = await env.ATTACK_RESULTS.list();
        const attacks: AttackRecord[] = [];
        let totalIntensity = 0;
        let vulnerabilitiesFound = 0;
        let activeAgents = 0;

        for (const key of list.keys) {
          const record = await env.ATTACK_RESULTS.get(key.name, 'json') as AttackRecord;
          if (record) {
            attacks.push(record);
            totalIntensity += record.intensity;
            
            if (record.findings && record.findings.length > 0) {
              vulnerabilitiesFound += record.findings.length;
            }
            
            if (record.status === 'running') {
              activeAgents++;
            }
          }
        }

        const averageIntensity = attacks.length > 0 ? totalIntensity / attacks.length : 0;

        return new Response(JSON.stringify({
          totalAttacks: attacks.length,
          activeAgents,
          vulnerabilitiesFound,
          averageIntensity,
          recentAttacks: attacks.slice(0, 5)
        }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          totalAttacks: 0,
          activeAgents: 0,
          vulnerabilitiesFound: 0,
          averageIntensity: 0,
          recentAttacks: []
        }), {
          headers: { 'Content-Type': 'application/json', ...securityHeaders }
        });
      }
    }

    // Main HTML page
    if (path === '/' && request.method === 'GET') {
      return new Response(HTML_TEMPLATE, {
        headers: { 
          'Content-Type': 'text/html;charset=UTF-8',
          ...securityHeaders
        }
      });
    }

    // 404 for all other routes
    return new Response('Not Found', { 
      status: 404,
      headers: securityHeaders
    });
  },

  async queue(batch: MessageBatch<Error>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const attackData = message.body;
        
        // Update status to running
        const record = await env.ATTACK_RESULTS.get(attackData.attackId, 'json') as AttackRecord;
        if (record) {
          record.status = 'running';
          await env.ATTACK_RESULTS.put(attackData.attackId, JSON.stringify(record));
        }

        // Simulate attack execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate simulated findings
        const findings = simulateAttackFindings(attackData.persona);
        
        // Update record with findings
        if (record) {
          record.status = 'completed';
          record.findings = findings;
          await env.ATTACK_RESULTS.put(attackData.attackId, JSON.stringify(record));
        }
        
        message.ack();
      } catch (error) {
        console.error('Failed to process attack:', error);
        message.retry();
      }
    }
  }
};

function simulateAttackFindings(persona: string): string[] {
  const findings: string[] = [];
  
  switch (persona) {
    case 'stealth-scanner':
      if (Math.random() > 0.3) findings.push('Open port 22 detected');
      if (Math.random() > 0.5) findings.push('Outdated service version identified');
      if (Math.random() > 0.7) findings.push('Exposed admin interface found');
      break;
    case 'payload-injector':
      if (Math.random() > 0.6) findings.push('Potential SQL injection vector');
      if (Math.random() > 0.4) findings.push('Reflected XSS possible in query parameter');
      break;
    case 'auth-cracker':
      if (Math.random() > 0.5) findings.push('Weak password policy detected');
      if (Math.random() > 0.8) findings.push('Session timeout too long');
      break;
    case 'resource-stressor':
      if (Math.random() > 0.3) findings.push('Service degraded under load');
      if (Math.random() > 0.6) findings.push('Memory leak detected during stress test');
      break;
  }
  
  if (findings.length === 0) {
    findings.push('No critical vulnerabilities detected');
  }
  
  return findings;
}
};