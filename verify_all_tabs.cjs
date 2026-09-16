const { spawn } = require('child_process');
const http = require('http');

async function verifyAllTabs() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    'http://localhost:3000',
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\aksha\\AppData\\Local\\Temp\\chrome_test_profile_tabs'
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

  const tabs = [
    'Cascade Simulator',
    'Multi-Corridor',
    'Hospital Access',
    'Interventions',
    'Before vs After',
    'Stress-Test',
    'Guided Demo'
  ];

  console.log('Testing each navigation tab...');
  for (const tabName of tabs) {
    const clickSuccess = await evalInPage((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes(name));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    await new Promise(r => setTimeout(r, 800));

    const check = await evalInPage(() => {
      return {
        bodyLength: document.body.innerText.length,
        hasError: document.body.innerText.includes('Panel Render Exception Handled'),
        rootChildren: document.getElementById('root')?.children.length || 0
      };
    });

    console.log(`Tab [${tabName}]: click=${clickSuccess}, bodyLength=${check.bodyLength}, rootChildren=${check.rootChildren}, hasError=${check.hasError}`);
    if (check.rootChildren === 0 || check.hasError) {
      throw new Error(`Tab ${tabName} crashed!`);
    }
  }

  console.log('All tabs verified clean!');
  console.log('Total exceptions:', errors.length);
  ws.close();
  chrome.kill();
  process.exit(0);
}

verifyAllTabs().catch(err => {
  console.error(err);
  process.exit(1);
});
