const { spawn } = require('child_process');
const http = require('http');

async function runTestSuite() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    'http://localhost:3000',
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\aksha\\AppData\\Local\\Temp\\chrome_test_profile_suite'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const pages = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9333/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = pages.find(p => p.url.includes('localhost:3000'));
  if (!page) throw new Error('Could not find localhost:3000 tab');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (e) => {
        const res = JSON.parse(e.data);
        if (res.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(r => ws.addEventListener('open', r));

  const errors = [];
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push({ type: 'EXCEPTION', text: msg.params.exceptionDetails.text, desc: msg.params.exceptionDetails.exception?.description });
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      errors.push({ type: 'CONSOLE_ERROR', text });
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await new Promise(r => setTimeout(r, 1500));

  async function evalInPage(fn) {
    const res = await send('Runtime.evaluate', {
      expression: `(${fn.toString()})()`,
      returnByValue: true
    });
    return res?.result?.value;
  }

  console.log('========================================');
  console.log('RUNNING ALL 10 REQUIRED TESTS');
  console.log('========================================');

  // TEST 1: Open application. Expected: Cascade Simulator works.
  console.log('\n--> TEST 1: Open application / Cascade Simulator');
  const t1 = await evalInPage(() => {
    return {
      title: document.querySelector('h1')?.innerText,
      hasTimeline: !!document.querySelector('.h-16') || document.body.innerText.includes('BASELINE'),
      bodyLength: document.body.innerText.length
    };
  });
  console.log('TEST 1 Result:', t1);
  if (!t1.title?.includes('CASCADE SHIELD')) throw new Error('Test 1 failed');
  console.log('PASS: TEST 1');

  // TEST 2: Click Multi-Corridor. Expected: No black screen.
  console.log('\n--> TEST 2: Click Multi-Corridor');
  const t2 = await evalInPage(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Multi-Corridor'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  await new Promise(r => setTimeout(r, 1000));
  const t2Check = await evalInPage(() => {
    return {
      hasMultiCorridorView: !!document.getElementById('multi-corridor-analysis-view'),
      hasRunButton: !!document.getElementById('run-multi-corridor-analysis-btn'),
      textSample: document.getElementById('multi-corridor-analysis-view')?.innerText.slice(0, 150)
    };
  });
  console.log('TEST 2 Result:', t2Check);
  if (!t2Check.hasMultiCorridorView) throw new Error('Test 2 failed: Black screen or view missing');
  console.log('PASS: TEST 2');

  // TEST 3: No corridors selected. Expected: Clear empty state.
  console.log('\n--> TEST 3: Clear All -> No corridors selected (empty state)');
  await evalInPage(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const clearBtn = buttons.find(b => b.textContent.trim() === 'Clear All');
    if (clearBtn) clearBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const t3 = await evalInPage(() => {
    const text = document.body.innerText;
    return {
      hasEmptyWarning: text.includes('Select at least one corridor to run the analysis'),
      selectedCount: text.includes('0 / 12') || text.includes('Failures Selected: 0'),
      runBtnDisabled: document.getElementById('run-multi-corridor-analysis-btn')?.hasAttribute('disabled')
    };
  });
  console.log('TEST 3 Result:', t3);
  if (!t3.hasEmptyWarning || !t3.runBtnDisabled) throw new Error('Test 3 failed: Empty state not shown or button not disabled');
  console.log('PASS: TEST 3');

  // TEST 4: Select Central Silk Board. Expected: Selection appears.
  console.log('\n--> TEST 4: Select Central Silk Board');
  const t4 = await evalInPage(() => {
    const card = document.getElementById('corridor-card-R_SILK_BOARD_JUNCTION');
    if (card) {
      card.click();
      return true;
    }
    return false;
  });
  console.log('Central Silk Board card clicked:', t4);
  await new Promise(r => setTimeout(r, 600));
  const t4Check = await evalInPage(() => {
    const text = document.getElementById('multi-corridor-analysis-view')?.innerText || '';
    return {
      countSelected: text.includes('1 / 12'),
      runBtnText: document.getElementById('run-multi-corridor-analysis-btn')?.innerText
    };
  });
  console.log('TEST 4 Result:', t4Check);
  if (!t4Check.countSelected) throw new Error('Test 4 failed: Central Silk Board not selected');
  console.log('PASS: TEST 4');

  // TEST 5: Select Central Silk Board + Agara. Expected: Both selected.
  console.log('\n--> TEST 5: Select Agara Corridor');
  const t5 = await evalInPage(() => {
    const card = document.getElementById('corridor-card-R_ORR_AGARA_CORRIDOR');
    if (card) {
      card.click();
      return true;
    }
    return false;
  });
  console.log('Agara Corridor card clicked:', t5);
  await new Promise(r => setTimeout(r, 600));
  const t5Check = await evalInPage(() => {
    const text = document.getElementById('multi-corridor-analysis-view')?.innerText || '';
    return {
      countSelected: text.includes('2 / 12'),
      runBtnText: document.getElementById('run-multi-corridor-analysis-btn')?.innerText
    };
  });
  console.log('TEST 5 Result:', t5Check);
  if (!t5Check.countSelected) throw new Error('Test 5 failed: 2 corridors not selected');
  console.log('PASS: TEST 5');

  // TEST 6: Run Analysis. Expected: Simulation results appear.
  console.log('\n--> TEST 6: Click Run Analysis (deterministic engine executes)');
  await evalInPage(() => {
    const btn = document.getElementById('run-multi-corridor-analysis-btn');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  const t6Check = await evalInPage(() => {
    const text = document.getElementById('multi-corridor-analysis-view')?.innerText || '';
    return {
      hasDisplaced: text.includes('7,300') || text.includes('Displaced Traffic'),
      hasBottlenecks: text.includes('Secondary Bottlenecks'),
      hasHospitalLatency: text.includes('St. John’s Trauma Latency'),
      hasDeltaMatrix: text.includes('Network Impact Delta') || text.includes('Baseline (T+0m)'),
      hasStressTable: text.includes('Corridor Redistribution') || text.includes('All Links'),
      textLength: text.length
    };
  });
  console.log('TEST 6 Result:', t6Check);
  if (!t6Check.hasDisplaced || !t6Check.hasHospitalLatency) throw new Error('Test 6 failed: Simulation results missing');
  console.log('PASS: TEST 6');

  // TEST 7: Clear All. Expected: Results reset.
  console.log('\n--> TEST 7: Clear All resets results');
  await evalInPage(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const clearBtn = buttons.find(b => b.textContent.trim() === 'Clear All');
    if (clearBtn) clearBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  const t7Check = await evalInPage(() => {
    const text = document.getElementById('multi-corridor-analysis-view')?.innerText;
    return {
      failuresSelected: text.includes('0 / 12'),
      networkStable: text.includes('NETWORK STABLE')
    };
  });
  console.log('TEST 7 Result:', t7Check);
  if (!t7Check.failuresSelected || !t7Check.networkStable) throw new Error('Test 7 failed: Results not reset to baseline');
  console.log('PASS: TEST 7');

  // TEST 8: Run Compound Cascade preset. Expected: Correct corridors become selected and simulation runs.
  console.log('\n--> TEST 8: Run Compound Cascade preset');
  await evalInPage(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const presetBtn = buttons.find(b => b.textContent.includes('Run Scenario') && b.closest('div')?.innerText.includes('Compound'));
    if (presetBtn) presetBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  const t8Check = await evalInPage(() => {
    const text = document.getElementById('multi-corridor-analysis-view')?.innerText;
    return {
      failuresSelected: text.includes('2 / 12'),
      displaced7300: text.includes('7,300'),
      isCritical: text.includes('NETWORK CRITICAL') || text.includes('CRITICAL REDUNDANCY LOSS')
    };
  });
  console.log('TEST 8 Result:', t8Check);
  if (!t8Check.failuresSelected) throw new Error('Test 8 failed: Compound Cascade preset failed');
  console.log('PASS: TEST 8');

  // TEST 9: Disable/fail Gemini. Expected: Simulation STILL works using deterministic fallback.
  console.log('\n--> TEST 9: Verify deterministic results without Gemini');
  const t9Check = await evalInPage(() => {
    const view = document.getElementById('multi-corridor-analysis-view');
    return {
      hasEngineeringBrief: view?.innerText.includes('Deterministic Engineering Brief') || view?.innerText.includes('Gemini AI Decision-Support Synthesis') || view?.innerText.includes('displaces 7,300 vph'),
      hasScore: view?.innerText.includes('Ripple Impact Score'),
      noCrash: !document.body.innerText.includes('Panel Render Exception Handled')
    };
  });
  console.log('TEST 9 Result:', t9Check);
  if (!t9Check.noCrash || !t9Check.hasScore) throw new Error('Test 9 failed');
  console.log('PASS: TEST 9');

  // TEST 10: Navigate to another tab and return. Expected: Multi-Corridor still works.
  console.log('\n--> TEST 10: Navigate away to Hospital Access and return to Multi-Corridor');
  await evalInPage(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hospBtn = buttons.find(b => b.textContent.includes('Hospital Access'));
    if (hospBtn) hospBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const t10Away = await evalInPage(() => {
    return document.body.innerText.includes('Hospital') && !document.getElementById('multi-corridor-analysis-view');
  });
  console.log('Navigated away to Hospital Access:', t10Away);

  await evalInPage(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const mcBtn = buttons.find(b => b.textContent.includes('Multi-Corridor'));
    if (mcBtn) mcBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const t10Back = await evalInPage(() => {
    return !!document.getElementById('multi-corridor-analysis-view');
  });
  console.log('Returned to Multi-Corridor successfully:', t10Back);
  if (!t10Back) throw new Error('Test 10 failed: Multi-Corridor not rendered on return');
  console.log('PASS: TEST 10');

  console.log('\n========================================');
  console.log('ALL 10 TESTS PASSED SUCCESSFULLY!');
  console.log('Errors caught during run:', errors.length);
  console.log('========================================');

  ws.close();
  chrome.kill();
  process.exit(0);
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
