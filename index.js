const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

const targetUrl = 'https://orsons-snorlax.vercel.app';

// Proxy all requests to the target
app.use('/', createProxyMiddleware({
  target: targetUrl,
  changeOrigin: true, // Changes the origin of the host header to the target URL
  secure: true, // Verifies the TLS certificate (set to false if self-signed cert issues)
  pathRewrite: {
    '^/': '/', // Rewrite paths if needed (here it's a direct proxy)
  },
  onProxyReq: (proxyReq, req, res) => {
    // Optional: Add custom headers or logging
    console.log(`Proxying request: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    res.status(500).send('Proxy error');
  }
}));

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
