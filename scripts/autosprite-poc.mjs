import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const API_KEY = process.env.AUTOSPRITE_API_KEY || process.argv[2];
const EXISTING_CHARACTER_ID = process.argv[3] || null;
const MCP_URL = 'https://www.autosprite.io/api/mcp';

if (!API_KEY) {
  console.error('Usage: node scripts/autosprite-poc.mjs <API_KEY> [CHARACTER_ID]');
  process.exit(1);
}

function mcpCall(method, params, id) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', method, params, id });
    const url = new URL(MCP_URL);
    const opts = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk.toString(); });
      res.on('end', () => {
        const lines = raw.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              return resolve(parsed);
            } catch {}
          }
        }
        try { resolve(JSON.parse(raw)); } catch { resolve({ raw }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('Request timed out')); });
    req.write(body);
    req.end();
  });
}

async function callTool(toolName, args, id) {
  const resp = await mcpCall('tools/call', { name: toolName, arguments: args }, id);
  if (resp.error) throw new Error(`MCP error: ${JSON.stringify(resp.error)}`);
  return resp.result || resp;
}

function extractText(result) {
  if (!result || !result.content) return null;
  for (const c of result.content) {
    if (c.type === 'text') return c.text;
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, outputPath).then(resolve).catch(reject);
      }
      const ws = fs.createWriteStream(outputPath);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(outputPath); });
      ws.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
  const referencePath = path.join(projectRoot, 'assets', 'goons', 'toad-reference.png');

  if (!fs.existsSync(referencePath)) {
    console.error('Reference image not found:', referencePath);
    process.exit(1);
  }

  console.log('=== AutoSprite POC: Plague Toad ===\n');

  // Step 1: Initialize
  console.log('[1/7] Initializing MCP session...');
  const initResp = await mcpCall('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'autosprite-poc', version: '1.0' },
  }, 1);
  console.log('  Server:', initResp.result?.serverInfo?.name || 'connected');

  // Step 2: Check account credits
  console.log('[2/7] Checking account credits...');
  const account = await callTool('get_account', {}, 2);
  const accountText = extractText(account);
  console.log('  Account:', accountText || JSON.stringify(account));

  let characterId = EXISTING_CHARACTER_ID;

  if (characterId) {
    console.log('[3/8] Skipping upload -- using provided character ID:', characterId);
    console.log('[4/8] Skipping character creation -- using provided character ID');
  } else {

  // Step 3: Request upload URL
  console.log('[3/8] Requesting upload URL...');
  const uploadUrlResult = await callTool('request_upload_url', {
    fileName: 'toad-reference.png',
    contentType: 'image/png',
  }, 3);
  const uploadUrlText = extractText(uploadUrlResult);
  console.log('  Upload URL result:', uploadUrlText || JSON.stringify(uploadUrlResult, null, 2));

  let uploadUrl = null;
  let uploadKey = null;
  if (uploadUrlText) {
    try {
      const parsed = JSON.parse(uploadUrlText);
      uploadUrl = parsed.url || parsed.uploadUrl;
      uploadKey = parsed.key || parsed.uploadKey;
    } catch {
      const urlMatch = uploadUrlText.match(/https?:\/\/[^\s"']+/i);
      if (urlMatch) uploadUrl = urlMatch[0];
      const keyMatch = uploadUrlText.match(/(?:key|uploadKey)[:\s]*["']?([^\s"',]+)/i);
      if (keyMatch) uploadKey = keyMatch[1];
    }
  }
  console.log('  Upload URL:', uploadUrl ? uploadUrl.substring(0, 80) + '...' : 'not found');
  console.log('  Upload Key:', uploadKey || 'not found');

  // Step 4: Upload file and create character

  if (uploadUrl && uploadKey) {
    console.log('[4/8] Uploading toad reference image to pre-signed URL...');
    const imgBytes = fs.readFileSync(referencePath);
    await new Promise((resolve, reject) => {
      const url = new URL(uploadUrl);
      const proto = url.protocol === 'https:' ? https : http;
      const req = proto.request(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/png', 'Content-Length': imgBytes.length },
      }, (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => { console.log('  Upload status:', res.statusCode); resolve(); });
      });
      req.on('error', reject);
      req.write(imgBytes);
      req.end();
    });

    console.log('  Creating character with uploadKey...');
    const charResult = await callTool('upload_character', {
      name: 'Plague Toad',
      uploadKey,
      isHumanoid: false,
      characterDescription: 'A menacing Plague Toad, a dark-fantasy poisonous swamp creature for RPG combat. Facing left.',
    }, 4);
    const charText = extractText(charResult);
    console.log('  Character result:', charText || JSON.stringify(charResult, null, 2));

    if (charText) {
      try {
        const parsed = JSON.parse(charText);
        characterId = parsed.characterId || parsed.character_id || parsed.id;
      } catch {
        const idMatch = charText.match(/(?:character_?[Ii]d|id)[:\s]*["']?([a-zA-Z0-9_-]{8,})["']?/i);
        if (idMatch) characterId = idMatch[1];
      }
    }
  } else {
    console.log('[4/8] Upload URL not available. Trying create_character from prompt...');
    const createResult = await callTool('create_character', {
      prompt: 'A menacing Plague Toad creature for dark-fantasy RPG combat. Pixel art, facing left.',
      name: 'Plague Toad',
      isHumanoid: false,
    }, 4);
    const createText = extractText(createResult);
    console.log('  Create result:', createText || JSON.stringify(createResult, null, 2));
    if (createText) {
      try {
        const parsed = JSON.parse(createText);
        characterId = parsed.characterId || parsed.character_id || parsed.id;
      } catch {}
    }
  }

  if (!characterId) {
    console.log('  Looking up character by listing...');
    const listResult = await callTool('list_characters', { search: 'Plague Toad' }, 40);
    const listText = extractText(listResult);
    console.log('  Characters:', listText || JSON.stringify(listResult, null, 2));
    if (listText) {
      try {
        const parsed = JSON.parse(listText);
        const chars = parsed.characters || parsed.data || (Array.isArray(parsed) ? parsed : []);
        if (chars.length > 0) {
          characterId = chars[0].characterId || chars[0].character_id || chars[0].id;
        }
      } catch {}
    }
  }

  if (!characterId) {
    console.error('FATAL: Could not obtain a character ID. AutoSprite free tier may not support MCP character creation.');
    console.error('Fallback: Upload your character at https://www.autosprite.io/app manually,');
    console.error('then re-run with: node scripts/autosprite-poc.mjs <API_KEY> <CHARACTER_ID>');
    process.exit(1);
  }

  console.log('  Character ID:', characterId);

  } // end of upload/create block

  // Step 5: Generate idle spritesheet
  console.log('[5/8] Generating IDLE animation spritesheet...');
  const idleResult = await callTool('generate_spritesheet', {
    characterId,
    animations: ['idle'],
  }, 5);
  const idleText = extractText(idleResult);
  console.log('  Idle generation:', idleText || JSON.stringify(idleResult, null, 2));

  // Step 6: Generate attack spritesheet
  console.log('[6/8] Generating ATTACK animation spritesheet...');
  const attackResult = await callTool('generate_spritesheet', {
    characterId,
    animations: ['attack'],
  }, 6);
  const attackText = extractText(attackResult);
  console.log('  Attack generation:', attackText || JSON.stringify(attackResult, null, 2));

  // Step 7: Poll jobs and wait for completion
  console.log('[7/8] Polling for completed jobs...');
  const jobsResult = await callTool('list_jobs', {}, 7);
  const jobsText = extractText(jobsResult);
  console.log('  Jobs:', jobsText || JSON.stringify(jobsResult, null, 2));

  // Wait and poll for spritesheets
  for (let attempt = 0; attempt < 12; attempt++) {
    console.log(`  Polling attempt ${attempt + 1}/12...`);
    await sleep(10000);
    const sheets = await callTool('list_spritesheets', { characterId }, 70 + attempt);
    const sheetsText = extractText(sheets);
    console.log('  Spritesheets:', sheetsText || JSON.stringify(sheets, null, 2));
    if (sheetsText && (sheetsText.includes('idle') || sheetsText.includes('attack'))) {
      console.log('  Spritesheets are ready!');
      break;
    }
  }

  // Step 8: Fetch download URLs
  console.log('[8/8] Fetching download URLs...');
  const allSheets = await callTool('list_spritesheets', { characterId }, 80);
  const allSheetsText = extractText(allSheets);
  console.log('  All spritesheets:', allSheetsText || JSON.stringify(allSheets, null, 2));

  const charDetail = await callTool('get_character', { characterId }, 81);
  const charText = extractText(charDetail);
  console.log('  Character detail:', charText || JSON.stringify(charDetail, null, 2));

  // Extract and download all available spritesheet URLs
  const goonsDir = path.join(projectRoot, 'assets', 'goons');
  const allText = [allSheetsText, charText, idleText, attackText].filter(Boolean).join('\n');
  const urlMatches = allText.match(/https?:\/\/[^\s"',\]})]+/gi) || [];
  console.log('  Found URLs:', urlMatches);

  for (const url of urlMatches) {
    if (!url.includes('png') && !url.includes('sprite') && !url.includes('sheet') && !url.includes('download')) continue;
    const label = url.toLowerCase().includes('attack') ? 'attack' : 'idle';
    const outPath = path.join(goonsDir, `toad_${label}_512x512_sheet.png`);
    console.log(`  Downloading ${label} sheet from ${url}...`);
    try {
      await downloadFile(url, outPath);
      console.log(`  Saved: ${outPath}`);
    } catch (err) {
      console.error(`  Download failed: ${err.message}`);
    }
  }

  console.log('\n=== POC Complete ===');
  console.log('Check assets/goons/ for toad_idle_512x512_sheet.png and toad_attack_512x512_sheet.png');
}

main().catch((err) => {
  console.error('Fatal error:', err.message || err);
  process.exit(1);
});
