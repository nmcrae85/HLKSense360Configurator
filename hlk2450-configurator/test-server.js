// Simple test server to verify ingress works
const http = require('http');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      ingress: req.headers['x-ingress-path'] || 'none',
      url: req.url,
      headers: req.headers
    }, null, 2));
    return;
  }
  
  // Simple HTML response for any other path
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>HLK2450 Test Server</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        pre { background: #f0f0f0; padding: 10px; }
      </style>
    </head>
    <body>
      <h1>HLK2450 Test Server Running!</h1>
      <p>This confirms the add-on is reachable via ingress.</p>
      <h2>Request Info:</h2>
      <pre>
URL: ${req.url}
Method: ${req.method}
Ingress Path: ${req.headers['x-ingress-path'] || 'Not detected'}
Time: ${new Date().toISOString()}
      </pre>
      <h2>All Headers:</h2>
      <pre>${JSON.stringify(req.headers, null, 2)}</pre>
    </body>
    </html>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server listening on 0.0.0.0:${PORT}`);
});