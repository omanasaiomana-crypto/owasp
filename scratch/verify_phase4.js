const http = require('http');
const { spawn } = require('child_process');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('--- Launching Chrome for Phase 4 verification ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--window-size=1400,900',
    'http://localhost:8080'
  ]);

  await sleep(2500);

  const targets = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9225/json', (res) => {
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

  const errors = [];

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

  console.log('1. Testing Login Card & Initial State...');
  const introVisible = await evaluate(`!document.getElementById('intro').classList.contains('hide')`);
  console.log('Intro visible on load:', introVisible);
  if (!introVisible) throw new Error('Intro login card should be visible on load');

  const startBtnDisabled = await evaluate(`document.getElementById('startBtn').disabled`);
  console.log('Start button initially disabled:', startBtnDisabled);

  console.log('2. Testing Validation of Hunter Name...');
  // Type 1 char
  let validationResult = await evaluate(`(() => {
    const inp = document.getElementById('hunterNameInput');
    inp.value = 'A';
    inp.dispatchEvent(new Event('input'));
    return {
      err: document.getElementById('nameError').textContent,
      disabled: document.getElementById('startBtn').disabled
    };
  })()`);
  console.log('Validation test 1 (1 char):', validationResult);

  // Type invalid char
  validationResult = await evaluate(`(() => {
    const inp = document.getElementById('hunterNameInput');
    inp.value = 'BladeRen!';
    inp.dispatchEvent(new Event('input'));
    return {
      err: document.getElementById('nameError').textContent,
      disabled: document.getElementById('startBtn').disabled
    };
  })()`);
  console.log('Validation test 2 (invalid chars):', validationResult);

  // Type valid name
  validationResult = await evaluate(`(() => {
    const inp = document.getElementById('hunterNameInput');
    inp.value = 'Shadow Blade';
    inp.dispatchEvent(new Event('input'));
    return {
      err: document.getElementById('nameError').textContent,
      disabled: document.getElementById('startBtn').disabled
    };
  })()`);
  console.log('Validation test 3 (valid name):', validationResult);

  console.log('3. Testing Emblem Picker & Custom Login...');
  const customLoginResult = await evaluate(`(() => {
    // Select moon emblem
    const moonBtn = document.querySelector('.emblem-btn[data-emblem="moon"]');
    moonBtn.click();
    
    // Click Begin the hunt
    document.getElementById('startBtn').click();
    
    return {
      introHidden: document.getElementById('intro').classList.contains('hide'),
      hunterName: document.getElementById('hunterNameDisplay').textContent,
      emblemHref: document.getElementById('hunterProfileEmblem').querySelector('use').getAttribute('href')
    };
  })()`);
  console.log('Custom login result:', customLoginResult);
  if (customLoginResult.hunterName !== 'Shadow Blade' || customLoginResult.emblemHref !== '#emblem-moon') {
    throw new Error('Custom login failed: ' + JSON.stringify(customLoginResult));
  }

  console.log('4. Testing Switch Hunter button...');
  const switchResult = await evaluate(`(() => {
    document.getElementById('switchHunterBtn').click();
    return {
      introVisible: !document.getElementById('intro').classList.contains('hide'),
      prefilledVal: document.getElementById('hunterNameInput').value
    };
  })()`);
  console.log('Switch hunter result:', switchResult);

  console.log('5. Testing "Play as guest" button...');
  const guestResult = await evaluate(`(() => {
    document.getElementById('guestBtn').click();
    return {
      introHidden: document.getElementById('intro').classList.contains('hide'),
      hunterName: document.getElementById('hunterNameDisplay').textContent
    };
  })()`);
  console.log('Guest login result:', guestResult);
  if (guestResult.hunterName !== 'Guest Hunter') {
    throw new Error('Guest login failed');
  }

  console.log('6. Testing Scoreboard Open & Populate...');
  const scoreboardResult = await evaluate(`(() => {
    document.getElementById('openScoreboardBtn').click();
    const overlay = document.getElementById('scoreboardOverlay');
    const rows = [...document.querySelectorAll('#scoreTableBody tr')];
    const playerRow = document.querySelector('#scoreTableBody tr.player-row');
    const medals = document.querySelectorAll('#scoreTableBody .medal');
    return {
      isOpen: overlay.classList.contains('show'),
      rowCount: rows.length,
      hasPlayerRow: !!playerRow,
      playerText: playerRow ? playerRow.textContent.replace(/\\s+/g, ' ').trim() : null,
      medalCount: medals.length
    };
  })()`);
  console.log('Scoreboard result:', scoreboardResult);
  if (scoreboardResult.rowCount !== 8) throw new Error('Expected 8 rows (7 sample + 1 player), got ' + scoreboardResult.rowCount);
  if (!scoreboardResult.hasPlayerRow) throw new Error('Missing highlighted player row');
  if (scoreboardResult.medalCount !== 3) throw new Error('Expected 3 medals for top 3');

  console.log('7. Testing Scoreboard Tab Switch (Session vs All-time)...');
  const tabResult = await evaluate(`(() => {
    document.getElementById('tabSession').click();
    const rowsSession = [...document.querySelectorAll('#scoreTableBody tr')].map(r => r.cells[4].textContent);
    document.getElementById('tabAllTime').click();
    const rowsAllTime = [...document.querySelectorAll('#scoreTableBody tr')].map(r => r.cells[4].textContent);
    return { rowsSession, rowsAllTime };
  })()`);
  console.log('Tab toggle rows XP:', tabResult);

  console.log('8. Testing "Reset my score" in-page confirmation dialog...');
  const resetDialogResult = await evaluate(`(() => {
    const dialog = document.getElementById('resetConfirmDialog');
    document.getElementById('resetScoreBtn').click();
    const dialogOpen = !dialog.classList.contains('hidden');
    
    // Test cancel
    document.getElementById('cancelResetBtn').click();
    const dialogCanceled = dialog.classList.contains('hidden');
    
    // Reopen and confirm
    document.getElementById('resetScoreBtn').click();
    document.getElementById('confirmResetBtn').click();
    const dialogDone = dialog.classList.contains('hidden');
    
    return {
      dialogOpen,
      dialogCanceled,
      dialogDone,
      playerXP: window.__bingo.state.xp,
      playerWins: window.__bingo.state.wins
    };
  })()`);
  console.log('Reset score result:', resetDialogResult);
  if (!resetDialogResult.dialogOpen || !resetDialogResult.dialogCanceled || resetDialogResult.playerXP !== 0) {
    throw new Error('Reset dialog test failed');
  }

  // Close scoreboard
  await evaluate(`document.getElementById('closeScoreboardBtn').click()`);
  const isClosed = await evaluate(`!document.getElementById('scoreboardOverlay').classList.contains('show')`);
  console.log('Scoreboard closed successfully:', isClosed);

  console.log('9. Testing Judge Verification Path (Guest -> tick Row 1 -> BINGO -> quiet mode -> fresh card)...');
  // Row 1 indices: 0, 1, 2, 3, 4
  for (let i = 0; i < 5; i++) {
    await evaluate(`window.__bingo.toggle(${i})`);
    await sleep(80);
  }
  await sleep(600);

  const bingoState = await evaluate(`(() => {
    const overlay = document.getElementById('overlay');
    const modalScoreBtn = document.getElementById('modalScoreBtn');
    return {
      modalShown: overlay.classList.contains('show'),
      hasScoreBtn: !!modalScoreBtn,
      wins: window.__bingo.state.wins,
      xp: window.__bingo.state.xp,
      bestCombo: window.__bingo.state.bestCombo
    };
  })()`);
  console.log('Bingo state after row complete:', bingoState);
  if (!bingoState.modalShown) throw new Error('BINGO win modal not shown');
  if (bingoState.bestCombo < 1) throw new Error('bestCombo was not tracked properly');

  // Test opening scoreboard from BINGO modal button
  console.log('10. Testing opening Scoreboard from BINGO modal...');
  const modalScoreOpen = await evaluate(`(() => {
    document.getElementById('modalScoreBtn').click();
    return document.getElementById('scoreboardOverlay').classList.contains('show');
  })()`);
  console.log('Opened scoreboard from BINGO modal:', modalScoreOpen);
  if (!modalScoreOpen) throw new Error('Failed to open scoreboard from BINGO modal');

  // Return to hunt
  await evaluate(`document.getElementById('returnGameBtn').click()`);

  // Toggle Quiet Classroom mode
  console.log('11. Testing Quiet Classroom mode toggle...');
  const quietResult = await evaluate(`(() => {
    document.getElementById('quietBtn').click();
    return {
      quiet: window.__bingo.state.quiet,
      bodyHasClass: document.body.classList.contains('quiet')
    };
  })()`);
  console.log('Quiet mode result:', quietResult);
  if (!quietResult.quiet || !quietResult.bodyHasClass) throw new Error('Quiet mode failed to engage');

  // Generate fresh card
  console.log('12. Testing "Generate fresh card"...');
  const freshResult = await evaluate(`(() => {
    const oldSeed = window.__bingo.state.seed;
    document.getElementById('newCardBtn').click();
    return {
      newSeed: window.__bingo.state.seed,
      seedChanged: window.__bingo.state.seed !== oldSeed,
      tickedCount: Object.keys(window.__bingo.state.ticked).length
    };
  })()`);
  console.log('Fresh card result:', freshResult);
  if (!freshResult.seedChanged || freshResult.tickedCount !== 1) throw new Error('Fresh card failed');

  console.log('Console errors during run:', errors);
  if (errors.length > 0) throw new Error('Console errors encountered: ' + errors.join('; '));

  console.log('ALL PHASE 4 TESTS PASSED PERFECTLY!');

  ws.close();
  chrome.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
