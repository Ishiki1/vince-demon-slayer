import fs from 'node:fs';
import http from 'node:http';

const LOG_PATH = '/opt/cursor/logs/debug.log';
const PORT = 3001;

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || 'http://localhost:3000';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method !== 'POST' || req.url !== '/__debug_log') {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try {
      const parsed = JSON.parse(body || '{}');
      fs.mkdirSync('/opt/cursor/logs', { recursive: true });
      fs.appendFileSync(LOG_PATH, JSON.stringify(parsed) + '\n');
      res.writeHead(204);
      res.end();
    } catch (_) {
      res.writeHead(400);
      res.end('bad request');
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`debug-log-server listening on http://127.0.0.1:${PORT}`);
});
