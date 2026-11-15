/**
 * Cool Lyrics - WiZ Smart Bulb Local Bridge
 * 
 * Lightweight zero-dependency bridge using Node.js built-ins (http, dgram, os).
 * Bridges browser HTTP requests from Cool Lyrics to Philips WiZ local UDP protocol (port 38899).
 */

const http = require('http');
const dgram = require('dgram');
const os = require('os');
const fs = require('fs');
const path = require('path');

const HTTP_PORT = 3737;
const WIZ_PORT = 38899;
const CACHE_FILE = path.join(__dirname, '.wiz-cache.json');

let discoveredBulbs = new Map(); // ip -> { ip, mac, moduleName, lastSeen }
let activeBulbIp = null;
let lastPilotState = null;
let udpSocket = null;
let lastSentTime = 0;
const MIN_SEND_INTERVAL_MS = 150; // Throttle to prevent overwhelming the bulb

// Load cached bulb IP if available
try {
  if (fs.existsSync(CACHE_FILE)) {
    const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (data.activeBulbIp) {
      activeBulbIp = data.activeBulbIp;
      console.log(`[WiZ Bridge] Loaded cached bulb: ${activeBulbIp}`);
    }
    if (Array.isArray(data.bulbs)) {
      data.bulbs.forEach(b => discoveredBulbs.set(b.ip, b));
    }
  }
} catch (e) {
  // Ignore cache read errors
}

// Get all IPv4 broadcast addresses across non-internal network adapters
function getBroadcastAddresses() {
  const broadcasts = new Set();
  const ifaces = os.networkInterfaces();

  for (const name in ifaces) {
    for (const net of ifaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        try {
          const ipParts = net.address.split('.').map(Number);
          const maskParts = net.netmask.split('.').map(Number);
          const bcastParts = ipParts.map((part, i) => (part | (~maskParts[i] & 255)));
          broadcasts.add(bcastParts.join('.'));
        } catch (e) {}
      }
    }
  }
  broadcasts.add('255.255.255.255');
  return Array.from(broadcasts);
}

let isSocketBound = false;
let socketBindCallbacks = [];

// Initialize UDP socket for communication with bulbs
function initUdpSocket(readyCallback) {
  if (isSocketBound && udpSocket) {
    if (readyCallback) readyCallback();
    return udpSocket;
  }

  if (readyCallback) socketBindCallbacks.push(readyCallback);
  if (udpSocket) return udpSocket;

  udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

  udpSocket.on('message', (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.method === 'getSystemConfig' && data.result) {
        const info = {
          ip: rinfo.address,
          mac: data.result.mac,
          moduleName: data.result.moduleName,
          fwVersion: data.result.fwVersion,
          lastSeen: Date.now()
        };
        discoveredBulbs.set(rinfo.address, info);
        if (!activeBulbIp) {
          activeBulbIp = rinfo.address;
        }
        saveCache();
        console.log(`[WiZ Bridge] Discovered WiZ bulb at ${rinfo.address} (${info.moduleName || 'RGB'})`);
      } else if (data.method === 'getPilot' && data.result) {
        lastPilotState = data.result;
      }
    } catch (e) {}
  });

  udpSocket.on('error', (err) => {
    console.error('[WiZ Bridge] UDP error:', err.message);
  });

  udpSocket.bind(0, () => {
    isSocketBound = true;
    try {
      udpSocket.setBroadcast(true);
    } catch (e) {}
    const cbs = socketBindCallbacks.slice();
    socketBindCallbacks = [];
    cbs.forEach(cb => cb());
  });

  return udpSocket;
}

function saveCache() {
  try {
    const data = {
      activeBulbIp,
      bulbs: Array.from(discoveredBulbs.values())
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

// Discover WiZ bulbs on local network
function discoverBulbs(callback) {
  initUdpSocket(() => {
    const broadcasts = getBroadcastAddresses();
    const query = JSON.stringify({ method: 'getSystemConfig', params: {} });

    // 1. Broadcast to subnets
    broadcasts.forEach(bcast => {
      try {
        udpSocket.send(query, WIZ_PORT, bcast, (err) => {
          if (err) console.error(`[WiZ Bridge] Broadcast error to ${bcast}:`, err.message);
        });
      } catch (e) {}
    });

    // 2. Also directly query any cached or active bulbs (in case router drops UDP broadcast)
    if (activeBulbIp) {
      try {
        udpSocket.send(query, WIZ_PORT, activeBulbIp);
      } catch (e) {}
    }
    discoveredBulbs.forEach(b => {
      try {
        udpSocket.send(query, WIZ_PORT, b.ip);
      } catch (e) {}
    });

    if (callback) {
      setTimeout(() => {
        callback(Array.from(discoveredBulbs.values()));
      }, 1500);
    }
  });
}

// Send UDP command to a bulb
function sendBulbCommand(ip, params, callback) {
  initUdpSocket(() => {
    const targetIp = ip || activeBulbIp;
    if (!targetIp) {
      if (callback) callback(new Error('No WiZ bulb found or specified'));
      return;
    }

    const payload = JSON.stringify({
      method: 'setPilot',
      params
    });

    udpSocket.send(payload, WIZ_PORT, targetIp, (err) => {
      if (err) {
        console.error(`[WiZ Bridge] Error sending to ${targetIp}:`, err.message);
        if (callback) callback(err);
      } else {
        lastSentTime = Date.now();
        if (callback) callback(null, { success: true, targetIp });
      }
    });
  });
}

// Fetch current bulb state
function fetchBulbState(ip, callback) {
  initUdpSocket();
  const targetIp = ip || activeBulbIp;
  if (!targetIp) return callback && callback(new Error('No bulb available'));

  const payload = JSON.stringify({ method: 'getPilot', params: {} });
  udpSocket.send(payload, WIZ_PORT, targetIp, (err) => {
    if (err && callback) callback(err);
  });
}

// HTTP API Server for Chrome Extension
const server = http.createServer((req, res) => {
  // Enable CORS for Chrome Extension origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${HTTP_PORT}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      online: true,
      activeBulb: activeBulbIp,
      bulbs: Array.from(discoveredBulbs.values()),
      pilot: lastPilotState
    }));
    return;
  }

  if (req.method === 'POST' && pathname === '/discover') {
    discoverBulbs((bulbs) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        activeBulb: activeBulbIp,
        bulbs
      }));
    });
    return;
  }

  if (req.method === 'POST' && (pathname === '/set' || pathname === '/color')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const params = {};

        if (typeof data.state === 'boolean') params.state = data.state;
        if (typeof data.dimming === 'number') params.dimming = Math.max(10, Math.min(100, Math.round(data.dimming)));
        if (typeof data.r === 'number') params.r = Math.max(0, Math.min(255, Math.round(data.r)));
        if (typeof data.g === 'number') params.g = Math.max(0, Math.min(255, Math.round(data.g)));
        if (typeof data.b === 'number') params.b = Math.max(0, Math.min(255, Math.round(data.b)));
        if (typeof data.temp === 'number') params.temp = Math.max(2200, Math.min(6500, Math.round(data.temp)));
        if (typeof data.speed === 'number') params.speed = data.speed;

        sendBulbCommand(data.ip, params, (err, result) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          }
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && (pathname === '/select-bulb' || pathname === '/set-ip')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const newIp = data.ip || data.bulbIp;
        if (newIp) {
          activeBulbIp = newIp;
          discoveredBulbs.set(newIp, {
            ip: newIp,
            mac: data.mac || 'unknown',
            moduleName: data.moduleName || 'WiZ Bulb',
            lastSeen: Date.now()
          });
          saveCache();
          // Query system config & pilot for this bulb
          initUdpSocket(() => {
            udpSocket.send(JSON.stringify({ method: 'getSystemConfig', params: {} }), WIZ_PORT, newIp);
            udpSocket.send(JSON.stringify({ method: 'getPilot', params: {} }), WIZ_PORT, newIp);
          });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, activeBulb: activeBulbIp }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

// Start HTTP Server
server.listen(HTTP_PORT, '127.0.0.1', () => {
  console.log(`\n=================================================`);
  console.log(`💡 Cool Lyrics - WiZ Bulb Bridge running!`);
  console.log(`🌐 Local HTTP API: http://127.0.0.1:${HTTP_PORT}`);
  console.log(`🔍 Scanning network for Philips WiZ smart bulbs...`);
  console.log(`=================================================\n`);

  initUdpSocket();
  discoverBulbs((bulbs) => {
    if (bulbs.length > 0) {
      console.log(`✨ Found ${bulbs.length} WiZ bulb(s):`);
      bulbs.forEach(b => console.log(`   - IP: ${b.ip} | MAC: ${b.mac} (${b.moduleName})`));
      console.log(`🎯 Active target bulb: ${activeBulbIp}`);
    } else {
      console.log(`⚠️ No WiZ bulbs responded to broadcast. Check if bulb is powered on.`);
    }
  });
});
