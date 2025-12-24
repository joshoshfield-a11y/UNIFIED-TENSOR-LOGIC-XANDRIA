import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');
const dir = path.join(root, 'XANDRIA', 'generated');
const port = parseInt(process.env.PORT || '8080', 10);

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/artifact.json' : req.url;
  const filePath = path.join(dir, urlPath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const type = ext === '.json' ? 'application/json' : 'text/plain';
    res.setHeader('Content-Type', type);
    res.end(data);
  });
});

server.listen(port);

