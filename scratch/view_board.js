const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/about.html';
  const filePath = path.join(process.cwd(), reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8085, async () => {
  console.log('Server running on 8085');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    'http://127.0.0.1:8085/about.html'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  // Connect to CDP
  http.get('http://127.0.0.1:9223/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const targets = JSON.parse(data);
      const page = targets.find(t => t.type === 'page');
      if (!page) {
        chromeProc.kill();
        server.close();
        return;
      }
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      ws.onopen = async () => {
        let msgId = 1;
        function send(method, params = {}) {
          return new Promise(resolve => {
            const id = msgId++;
            const handler = (event) => {
              const msg = JSON.parse(event.data);
              if (msg.id === id) {
                ws.removeEventListener('message', handler);
                resolve(msg.result);
              }
            };
            ws.addEventListener('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
          });
        }

        await send('Emulation.setDeviceMetricsOverride', {
          width: 1200,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false
        });

        // Scroll to the board section
        await send('Runtime.evaluate', {
          expression: `
            const el = document.querySelector('.board-grid');
            if (el) el.scrollIntoView({ block: 'center' });
          `
        });

        await new Promise(r => setTimeout(r, 500));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.resolve('scratch/board_current_real.png'), Buffer.from(screenshot.data, 'base64'));
        console.log('Captured scratch/board_current_real.png successfully!');

        ws.close();
        chromeProc.kill();
        server.close();
        process.exit(0);
      };
    });
  });
});
