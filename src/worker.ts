interface Attack {
  id: string;
  persona: string;
  target: string;
  timestamp: number;
  status: 'running' | 'completed' | 'failed';
  results?: {
    vulnerabilities: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    vaccineGenerated: boolean;
  };
}

interface DashboardData {
  totalAttacks: number;
  activeAttacks: number;
  vulnerabilitiesFound: number;
  criticalVulnerabilities: number;
  recentAttacks: Attack[];
  topPersonas: { persona: string; count: number }[];
}

const ATTACKS_DB: Map<string, Attack> = new Map();
const DASHBOARD_DATA: DashboardData = {
  totalAttacks: 0,
  activeAttacks: 0,
  vulnerabilitiesFound: 42,
  criticalVulnerabilities: 7,
  recentAttacks: [],
  topPersonas: [
    { persona: 'prompt injector', count: 15 },
    { persona: 'privilege escaler', count: 12 },
    { persona: 'role manipulator', count: 8 },
    { persona: 'data exfiltrator', count: 7 },
  ],
};

const PERSONAS = [
  {
    id: 'prompt-injector',
    name: 'Prompt Injector',
    description: 'Attempts to bypass AI safeguards through crafted inputs',
    icon: '💉',
  },
  {
    id: 'role-manipulator',
    name: 'Role Manipulator',
    description: 'Seeks to escalate privileges by assuming unauthorized roles',
    icon: '🎭',
  },
  {
    id: 'privilege-escaler',
    name: 'Privilege Escaler',
    description: 'Exploits permission flaws to gain elevated access',
    icon: '📈',
  },
  {
    id: 'data-exfiltrator',
    name: 'Data Exfiltrator',
    description: 'Attempts to extract sensitive data through various channels',
    icon: '📤',
  },
];

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adversarial Red Team</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #0a0a0f;
            color: #f0f0f0;
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .hero {
            text-align: center;
            padding: 80px 20px;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            border-bottom: 1px solid #222;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(90deg, #dc2626, #ff6b6b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .hero p {
            font-size: 1.5rem;
            color: #aaa;
            max-width: 800px;
            margin: 0 auto 40px;
        }
        
        .cta-button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            background: #b91c1c;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
        }
        
        .section {
            padding: 80px 0;
        }
        
        .section-title {
            font-size: 2.5rem;
            margin-bottom: 40px;
            color: #fff;
            text-align: center;
        }
        
        .personas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        
        .persona-card {
            background: #1a1a2e;
            border-radius: 12px;
            padding: 30px;
            border: 1px solid #333;
            transition: all 0.3s ease;
        }
        
        .persona-card:hover {
            border-color: #dc2626;
            transform: translateY(-5px);
        }
        
        .persona-icon {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        
        .persona-card h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #fff;
        }
        
        .persona-card p {
            color: #aaa;
            font-size: 0.95rem;
        }
        
        .steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        
        .step {
            text-align: center;
            padding: 30px;
            background: #1a1a2e;
            border-radius: 12px;
            border: 1px solid #333;
        }
        
        .step-number {
            display: inline-block;
            width: 50px;
            height: 50px;
            background: #dc2626;
            color: white;
            border-radius: 50%;
            line-height: 50px;
            font-weight: 700;
            font-size: 1.2rem;
            margin-bottom: 20px;
        }
        
        .step h3 {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: #fff;
        }
        
        .step p {
            color: #aaa;
            font-size: 0.95rem;
        }
        
        .dashboard {
            background: #1a1a2e;
            border-radius: 12px;
            padding: 40px;
            border: 1px solid #333;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: #0a0a0f;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #aaa;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .attack-form {
            background: #1a1a2e;
            padding: 40px;
            border-radius: 12px;
            border: 1px solid #333;
            margin-top: 40px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 10px;
            color: #fff;
            font-weight: 500;
        }
        
        .form-group select,
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: #0a0a0f;
            border: 1px solid #333;
            border-radius: 6px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
        }
        
        .form-group select:focus,
        .form-group input:focus {
            outline: none;
            border-color: #dc2626;
        }
        
        footer {
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid #222;
            color: #888;
            margin-top: 80px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-running {
            background: rgba(220, 38, 38, 0.1);
            color: #dc2626;
        }
        
        .status-completed {
            background: rgba(34, 197, 94, 0.1);
            color: #22c55e;
        }
        
        .status-failed {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }
        
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero p {
                font-size: 1.2rem;
            }
            
            .section-title {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <h1>Adversarial Red Team</h1>
            <p>Attack your fleet before someone else does. Auto-spawn attacker agents to harden your systems against real threats.</p>
            <a href="#attack" class="cta-button">Launch Attack Simulation</a>
        </div>
    </div>
    
    <div class="container">
        <section class="section" id="personas">
            <h2 class="section-title">Attack Personas</h2>
            <div class="personas-grid">
                ${PERSONAS.map(persona => `
                    <div class="persona-card">
                        <div class="persona-icon">${persona.icon}</div>
                        <h3>${persona.name}</h3>
                        <p>${persona.description}</p>
                    </div>
                `).join('')}
            </div>
        </section>
        
        <section class="section" id="how-it-works">
            <h2 class="section-title">How It Works</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <h3>Spawn Attackers</h3>
                    <p>Deploy multiple adversarial agents with different attack personas targeting your systems.</p>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <h3>Test Vessel</h3>
                    <p>Agents systematically probe for vulnerabilities across your entire infrastructure.</p>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <h3>Evaluate Results</h3>
                    <p>Analyze attack patterns, successful breaches, and system responses in real-time.</p>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <h3>Generate Vaccine</h3>
                    <p>Automatically create and deploy security patches based on discovered vulnerabilities.</p>
                </div>
            </div>
        </section>
        
        <section class="section" id="dashboard">
            <h2 class="section-title">Security Dashboard</h2>
            <div class="dashboard">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="totalAttacks">0</div>
                        <div class="stat-label">Total Attacks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="activeAttacks">0</div>
                        <div class="stat-label">Active Attacks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="vulnerabilitiesFound">0</div>
                        <div class="stat-label">Vulnerabilities Found</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="criticalVulnerabilities">0</div>
                        <div class="stat-label">Critical Vulnerabilities</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <h3 style="color:#fff; margin-bottom:20px;">Recent Attacks</h3>
                    <div id="recentAttacks">
                        <p style="color:#666; text-align:center;">No attacks launched yet</p>
                    </div>
                </div>
            </div>
        </section>
        
        <section class="section" id="attack">
            <h2 class="section-title">Launch Attack Simulation</h2>
            <div class="attack-form">
                <form id="attackForm">
                    <div class="form-group">
                        <label for="persona">Attack Persona</label>
                        <select id="persona" name="persona" required>
                            <option value="">Select an attack persona</option>
                            ${PERSONAS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="target">Target System</label>
                        <input type="text" id="target" name="target" placeholder="e.g., API Gateway, Auth Service, Database" required>
                    </div>
                    
                    <button type="submit" class="cta-button" style="width:100%;">Launch Attack</button>
                </form>
                <div id="attackResult" style="margin-top:20px;"></div>
            </div>
        </section>
    </div>
    
    <footer>
        <div class="container">
            <p><i style="color:#888">Built with <a href="https://github.com/Lucineer/cocapn-ai" style="color:#dc2626">Cocapn</a></i></p>
        </div>
    </footer>
    
    <script>
        async function updateDashboard() {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();
                
                document.getElementById('totalAttacks').textContent = data.totalAttacks;
                document.getElementById('activeAttacks').textContent = data.activeAttacks;
                document.getElementById('vulnerabilitiesFound').textContent = data.vulnerabilitiesFound;
                document.getElementById('criticalVulnerabilities').textContent = data.criticalVulnerabilities;
                
                const recentAttacks = document.getElementById('recentAttacks');
                if (data.recentAttacks && data.recentAttacks.length > 0) {
                    recentAttacks.innerHTML = data.recentAttacks.map(attack => \`
                        <div style="background:#0a0a0f; padding:15px; border-radius:6px; margin-bottom:10px; border-left:3px solid #dc2626;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <strong style="color:#fff;">\${attack.persona}</strong>
                                    <span style="color:#666; margin-left:10px;">on \${attack.target}</span>
                                </div>
                                <span class="status-badge status-\${attack.status}">\${attack.status}</span>
                            </div>
                            <div style="color:#888; font-size:0.9rem; margin-top:5px;">
                                \${new Date(attack.timestamp).toLocaleString()}
                            </div>
                        </div>
                    \`).join('');
                }
            } catch (error) {
                console.error('Failed to update dashboard:', error);
            }
        }
        
        document.getElementById('attackForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const persona = document.getElementById('persona').value;
            const target = document.getElementById('target').value;
            const resultDiv = document.getElementById('attackResult');
            
            resultDiv.innerHTML = '<p style="color:#dc2626;">Launching attack...</p>';
            
            try {
                const response = await fetch('/api/attack', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ persona, target })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = \`
                        <div style="background:rgba(34,197,94,0.1); padding:15px; border-radius:6px; border:1px solid #22c55e;">
                            <p style="color:#22c55e; margin-bottom:10px;">
                                <strong>Attack launched successfully!</strong>
                            </p>
                            <p style="color:#aaa; font-size:0.9rem;">
                                Attack ID: \${result.attackId}<br>
                                Persona: \${result.persona}<br>
                                Target: \${result.target}
                            </p>
                        </div>
                    \`;
                    updateDashboard();
                } else {
                    resultDiv.innerHTML = \`
                        <div style="background:rgba(239,68,68,0.1); padding:15px; border-radius:6px; border:1px solid #ef4444;">
                            <p style="color:#ef4444;">Error: \${result.error}</p>
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div style="background:rgba(239,68,68,0.1); padding:15px; border-radius:6px; border:1px solid #ef4444;">
                        <p style="color:#ef4444;">Failed to launch attack. Please try again.</p>
                    </div>
                \`;
            }
            
            document.getElementById('attackForm').reset();
        });
        
        updateDashboard();
        setInterval(updateDashboard, 10000);
    </script>
</body>
</html>
`;

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const headers = {
      'Content-Type': 'text/html',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' https://fonts.googleapis.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data:;",
    };
    
    if (path === '/' || path === '') {
      return new Response(html, { headers });
    }
    
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (path === '/api/attack' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { persona, target } = body;
        
        if (!persona || !target) {
          return new Response(JSON.stringify({ error: 'Missing persona or target' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        const attackId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const attack: Attack = {
          id: attackId,
          persona,
          target,
          timestamp: Date.now(),
          status: 'running',
        };
        
        ATTACKS_DB.set(attackId, attack);
        DASHBOARD_DATA.totalAttacks++;
        DASHBOARD_DATA.activeAttacks++;
        DASHBOARD_DATA.recentAttacks.unshift(attack);
        
        if (DASHBOARD_DATA.recentAttacks.length > 5) {
          DASHBOARD_DATA.recentAttacks = DASHBOARD_DATA.recentAttacks.slice(0, 5);
        }
        
        setTimeout(() => {
          const storedAttack = ATTACKS_DB.get(attackId);
          if (storedAttack) {
            storedAttack.status = 'completed';
            storedAttack.results = {
              vulnerabilities: ['Insufficient input validation', 'Missing rate limiting', 'Weak authentication checks'],
              severity: Math.random() > 0.7 ? 'critical' : Math.random() > 0.5 ? 'high' : 'medium',
              vaccineGenerated: true,
            };
            DASHBOARD_DATA.activeAttacks--;
            DASHBOARD_DATA.vulnerabilitiesFound += storedAttack.results.vulnerabilities.length;
            if (storedAttack.results.severity === 'critical') {
              DASHBOARD_DATA.criticalVulnerabilities++;
            }
          }
        }, 5000);
        
        return new Response(JSON.stringify({
          attackId,
          persona,
          target,
          message: 'Attack simulation started',
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    if (path === '/api/attacks' && request.method === 'GET') {
      const attacks = Array.from(ATTACKS_DB.values());
      return new Response(JSON.stringify(attacks), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (path === '/api/dashboard' && request.method === 'GET') {
      return new Response(JSON.stringify(DASHBOARD_DATA), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response('Not Found', { status: 404, headers });
  },
};