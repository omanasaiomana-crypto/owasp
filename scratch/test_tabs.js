const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');

async function testTabs() {
  const cdp = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)[0]));
    }).on('error', reject);
  });

  const ws = new WebSocket(cdp.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (msg) => {
      const res = JSON.parse(msg);
      if (res.id === curId) {
        ws.off('message', handler);
        resolve(res.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  // Reopen intro
  await send('Runtime.evaluate', { expression: `document.getElementById('intro').classList.remove('hide')` });
  
  // Click Demon Slayers tab
  await send('Runtime.evaluate', { expression: `document.getElementById('tabLegends').click()` });
  await new Promise(r => setTimeout(r, 400));
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('docs/screenshots/01b-login-demon-slayers.png', Buffer.from(shot2.data, 'base64'));
  console.log('Saved 01b-login-demon-slayers.png');

  // Click Student ID tab
  await send('Runtime.evaluate', { expression: `document.getElementById('tabStudent').click()` });
  await new Promise(r => setTimeout(r, 400));
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('docs/screenshots/01c-login-student-portal.png', Buffer.from(shot3.data, 'base64'));
  console.log('Saved 01c-login-student-portal.png');

  // Reset back to Accounts tab & guest
  await send('Runtime.evaluate', { expression: `document.getElementById('tabAccounts').click()` });
  await send('Runtime.evaluate', { expression: `document.getElementById('guestBtn').click()` });

  ws.close();
}
testTabs().catch(console.error);

