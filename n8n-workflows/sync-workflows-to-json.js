const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNTllZmU0OC05MjljLTQxMTYtYjhhNC0wMWJiZTliYmIxMmQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4NjQwMDM3fQ.F0qupDY-TTRqZ0uCy3SVRTIKjpD_rN2enQg8cSBEX34';
const BASE_URL = 'n8n.srv965476.hstgr.cloud';

function request(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function main() {
  const outputDir = path.join(__dirname, 'workflows');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Fetching all Madplan workflows...\n');

  const list = await request('GET', '/api/v1/workflows?limit=200');

  const madplanWorkflows = (list.data || []).filter(wf =>
    wf.name.startsWith('Madplan -')
  );

  console.log('Found ' + madplanWorkflows.length + ' Madplan workflows\n');

  let exported = 0;

  for (const wf of madplanWorkflows) {
    console.log('Exporting: ' + wf.name);

    try {
      const fullWorkflow = await request('GET', '/api/v1/workflows/' + wf.id);

      // Remove sensitive/volatile data
      const cleanWorkflow = {
        name: fullWorkflow.name,
        nodes: fullWorkflow.nodes,
        connections: fullWorkflow.connections,
        settings: fullWorkflow.settings,
        staticData: fullWorkflow.staticData,
        pinData: fullWorkflow.pinData
      };

      const filename = sanitizeFilename(wf.name) + '-' + wf.id + '.json';
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(cleanWorkflow, null, 2));
      console.log('  -> ' + filename);
      exported++;
    } catch (e) {
      console.log('  Error: ' + e.message);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n=== Summary ===');
  console.log('Exported: ' + exported + ' workflows to ' + outputDir);
}

main().catch(console.error);
