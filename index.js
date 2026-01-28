const express = require('express');
const { createServer } = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;
const target = 'https://rebel-search.onrender.com/';

// Create proxy with optimized agent (connection pooling)
const proxy = httpProxy.createProxyServer({
  target,
  changeOrigin: true,
  secure: true,
  xfwd: true,               // Forward X-Forwarded-For etc.
  preserveHeaderKeyCase: true,
  agent: new https.Agent({
    keepAlive: true,
    maxSockets: 200,        // Increase for better concurrency
    maxFreeSockets: 20,
    timeout: 60000,
    keepAliveMsecs: 1000
  })
});

// Compress responses to reduce transfer size
app.use(compression({ level: 6 }));

// Proxy ALL requests
app.use((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Forward important headers
  req.headers['x-forwarded-host'] = req.headers.host;
  req.headers['x-forwarded-proto'] = req.protocol;

  proxy.web(req, res, {}, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.status(502).send('Proxy error');
    }
  });
});

// Handle WebSocket if your app ever uses it (optional but cheap to include)
app.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const server = createServer(app);
server.listen(port, () => {
  console.log(`Optimized proxy running on port ${port}`);
});
