const http = require('http');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const rootDir = path.join(projectRoot, 'dist');
const port = Number(process.env.PORT || process.env.WEB_PORT || 3000);
const host = '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function startServer() {
  const server = http.createServer((req, res) => {
    const requestedPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = requestedPath === '/' ? '/index.html' : requestedPath;
    const ext = path.extname(safePath).toLowerCase();

    const candidatePaths = [];
    if (ext) {
      candidatePaths.push(path.normalize(path.join(rootDir, safePath)));
    } else {
      candidatePaths.push(path.normalize(path.join(rootDir, safePath, 'index.html')));
      candidatePaths.push(path.normalize(path.join(rootDir, safePath + '.html')));
      candidatePaths.push(path.normalize(path.join(rootDir, 'index.html')));
    }

    const filePath = candidatePaths.find((candidate) => candidate.startsWith(rootDir) && fs.existsSync(candidate));

    if (!filePath) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }

      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/html; charset=utf-8' });
      res.end(content);
    });
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy, trying ${port + 1}...`);
      const fallbackPort = port + 1;
      server.close(() => {
        const fallbackServer = http.createServer((req, res) => {
          const requestedPath = decodeURIComponent((req.url || '/').split('?')[0]);
          const safePath = requestedPath === '/' ? '/index.html' : requestedPath;
          const ext = path.extname(safePath).toLowerCase();
          const fallbackCandidatePaths = [];
          if (ext) {
            fallbackCandidatePaths.push(path.normalize(path.join(rootDir, safePath)));
          } else {
            fallbackCandidatePaths.push(path.normalize(path.join(rootDir, safePath, 'index.html')));
            fallbackCandidatePaths.push(path.normalize(path.join(rootDir, safePath + '.html')));
            fallbackCandidatePaths.push(path.normalize(path.join(rootDir, 'index.html')));
          }

          const fallbackFilePath = fallbackCandidatePaths.find((candidate) => candidate.startsWith(rootDir) && fs.existsSync(candidate));
          if (!fallbackFilePath) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }

          fs.readFile(fallbackFilePath, (readError, content) => {
            if (readError) {
              res.writeHead(500);
              res.end('Server error');
              return;
            }

            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/html; charset=utf-8' });
            res.end(content);
          });
        });

        fallbackServer.listen(fallbackPort, host, () => {
          console.log(`Static server listening on http://${host}:${fallbackPort}`);
        });
      });
      return;
    }

    throw error;
  });

  server.listen(port, host, () => {
    console.log(`Static server listening on http://${host}:${port}`);
  });
}

startServer();
