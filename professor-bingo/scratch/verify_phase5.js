const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('--- Launching Chrome for Phase 5 verification ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--window-size=1440,920',
    'http://localhost:8080'
  ]);

  await sleep(2500);

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9226/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => { ws.onopen = r; });

  let msgId = 1;
  const pending = new Map();
  const errors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Runtime.enable');
  await send('Page.enable');
  await sleep(1000);

  async function evaluate(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception.description);
    }
    return res.result.value;
  }

  async function takeScreenshot(filePath) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath}`);
  }

  const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('1. Capturing Screenshot: Login Screen...');
  await takeScreenshot(path.join(screenshotsDir, '01-hunter-login.png'));

  // Multi-Login Tabs verification
  console.log('1b. Capturing Screenshot: Demon Slayers Quick Logins...');
  await evaluate(`document.getElementById('tabLegends').click()`);
  await sleep(350);
  await takeScreenshot(path.join(screenshotsDir, '01b-login-demon-slayers.png'));

  console.log('1c. Capturing Screenshot: Student Portal Login...');
  await evaluate(`document.getElementById('tabStudent').click()`);
  await sleep(350);
  await takeScreenshot(path.join(screenshotsDir, '01c-login-student-portal.png'));

  // Return to accounts and proceed
  await evaluate(`document.getElementById('tabAccounts').click()`);
  await sleep(250);

  console.log('2. Testing Play as Guest & Capturing Gameplay Board...');
  await evaluate(`document.getElementById('guestBtn').click()`);
  await sleep(500);
  await takeScreenshot(path.join(screenshotsDir, '02-gameplay-board.png'));

  console.log('3. Testing Row Completion -> BINGO celebration with Modal Characters...');
  // Tick row 1: 0, 1, 2, 3, 4
  for (let i = 0; i < 5; i++) {
    await evaluate(`window.__bingo.toggle(${i})`);
    await sleep(90);
  }
  await sleep(700); // Allow modal animation to complete

  const modalState = await evaluate(`(() => {
    const overlay = document.getElementById('overlay');
    const modalLeft = document.getElementById('modalLeft');
    const modalRight = document.getElementById('modalRight');
    const canvasL = modalLeft ? modalLeft.querySelector('canvas') : null;
    const canvasR = modalRight ? modalRight.querySelector('canvas') : null;
    const achItems = [...document.querySelectorAll('#ach li')].map(li => ({
      text: li.textContent,
      on: li.classList.contains('on')
    }));
    return {
      modalShown: overlay.classList.contains('show'),
      hasModalLeftCanvas: !!canvasL,
      hasModalRightCanvas: !!canvasR,
      achItems,
      wins: window.__bingo.state.wins,
      xp: window.__bingo.state.xp
    };
  })()`);
  console.log('Modal celebration state:', modalState);
  if (!modalState.modalShown) throw new Error('BINGO modal failed to display');
  if (!modalState.hasModalLeftCanvas) throw new Error('Missing Kai canvas in #modalLeft');
  if (!modalState.hasModalRightCanvas) throw new Error('Missing Yuki canvas in #modalRight');

  await takeScreenshot(path.join(screenshotsDir, '03-bingo-win-modal.png'));

  console.log('4. Testing Scoreboard View & Capturing Screenshot...');
  await evaluate(`document.getElementById('modalScoreBtn').click()`);
  await sleep(400);

  const scoreboardCheck = await evaluate(`(() => {
    const overlay = document.getElementById('scoreboardOverlay');
    const playerRow = document.querySelector('#scoreTableBody tr.player-row');
    return {
      isOpen: overlay.classList.contains('show'),
      playerFound: !!playerRow,
      playerText: playerRow ? playerRow.textContent.replace(/\\s+/g, ' ').trim() : ''
    };
  })()`);
  console.log('Scoreboard check:', scoreboardCheck);
  if (!scoreboardCheck.isOpen || !scoreboardCheck.playerFound) throw new Error('Scoreboard view failed');

  await takeScreenshot(path.join(screenshotsDir, '04-hall-of-hunters-scoreboard.png'));

  // Close scoreboard
  await evaluate(`document.getElementById('returnGameBtn').click()`);
  await sleep(200);
  await evaluate(`document.getElementById('keepBtn').click()`); // Close bingo modal if still open
  await sleep(200);

  console.log('5. Testing Quiet Classroom Mode & Fresh Card...');
  await evaluate(`document.getElementById('quietBtn').click()`);
  await sleep(300);

  const quietCheck = await evaluate(`(() => {
    return {
      quiet: window.__bingo.state.quiet,
      bodyClass: document.body.className
    };
  })()`);
  console.log('Quiet check:', quietCheck);
  if (!quietCheck.quiet) throw new Error('Quiet mode failed');

  await takeScreenshot(path.join(screenshotsDir, '05-quiet-mode.png'));

  // Fresh card
  const seedBefore = await evaluate(`window.__bingo.state.seed`);
  await evaluate(`document.getElementById('newCardBtn').click()`);
  const seedAfter = await evaluate(`window.__bingo.state.seed`);
  console.log(`Fresh card seeds: before=${seedBefore}, after=${seedAfter}`);
  if (seedBefore === seedAfter) throw new Error('Fresh card did not randomize seed');

  console.log('6. Testing Custom Phrases Validation Error (less than 24 entries)...');
  const validationTest = await evaluate(`(() => {
    const phrases = document.getElementById('phrases');
    phrases.value = "Phrase 1\\nPhrase 2\\nPhrase 3";
    phrases.dispatchEvent(new Event('input'));
    return {
      errText: document.getElementById('err').textContent,
      applyDisabled: document.getElementById('applyBtn').disabled
    };
  })()`);
  console.log('Validation test (<24 phrases):', validationTest);
  if (!validationTest.applyDisabled || !validationTest.errText.includes('Summon 21 more unique phrases')) {
    throw new Error('Custom phrases validation failed: ' + JSON.stringify(validationTest));
  }

  console.log('7. Testing Mobile View at 390px...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(600);

  const mobileCheck = await evaluate(`(() => {
    const stageLeft = document.getElementById('stageLeft');
    const stageRight = document.getElementById('stageRight');
    const modalLeft = document.getElementById('modalLeft');
    const modalRight = document.getElementById('modalRight');
    const getDisp = el => el ? window.getComputedStyle(el).display : null;
    return {
      stageLeftDisp: getDisp(stageLeft),
      stageRightDisp: getDisp(stageRight),
      modalLeftDisp: getDisp(modalLeft),
      modalRightDisp: getDisp(modalRight),
      boardWidth: document.querySelector('.board').clientWidth,
      appScrollWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth
    };
  })()`);
  console.log('Mobile layout check at 390px:', mobileCheck);
  if (mobileCheck.stageLeftDisp !== 'none' || mobileCheck.stageRightDisp !== 'none' || mobileCheck.modalLeftDisp !== 'none') {
    throw new Error('Characters not properly hidden on mobile: ' + JSON.stringify(mobileCheck));
  }

  await takeScreenshot(path.join(screenshotsDir, '06-mobile-view-390px.png'));

  console.log('Console errors encountered during testing:', errors);
  if (errors.length > 0) throw new Error('Console errors: ' + errors.join('; '));

  console.log('>>> ALL PHASE 5 TESTS AND AUDITS PASSED WITH ZERO CONSOLE ERRORS! <<<');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('PHASE 5 VERIFICATION ERROR:', err);
  process.exit(1);
});

