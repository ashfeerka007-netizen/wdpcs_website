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
  console.log('Test server active on http://127.0.0.1:8085');
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

        // 1. Desktop capture
        await send('Emulation.setDeviceMetricsOverride', {
          width: 1200,
          height: 920,
          deviceScaleFactor: 1,
          mobile: false
        });

        await send('Runtime.evaluate', {
          expression: `
            const el = document.querySelector('.board-grid');
            if (el) el.scrollIntoView({ block: 'center' });
          `
        });
        await new Promise(r => setTimeout(r, 600));

        const desktopScreenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.resolve('scratch/board_desktop_preview.png'), Buffer.from(desktopScreenshot.data, 'base64'));
        console.log('Saved scratch/board_desktop_preview.png');

        // 2. Mobile capture (390px)
        await send('Emulation.setDeviceMetricsOverride', {
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          mobile: true
        });

        await send('Runtime.evaluate', {
          expression: 'document.querySelector(".director-card.executive-president").scrollIntoView({ block: "center" })'
        });
        await new Promise(r => setTimeout(r, 600));

        const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.resolve('scratch/board_mobile_preview.png'), Buffer.from(mobileScreenshot.data, 'base64'));
        console.log('Saved scratch/board_mobile_preview.png');

        ws.close();
        chromeProc.kill();
        server.close();
        process.exit(0);
      };
    });
  });
});
