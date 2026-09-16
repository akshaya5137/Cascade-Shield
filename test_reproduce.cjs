const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    'http://localhost:3000',
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\aksha\\AppData\\Local\\Temp\\chrome_test_profile_9333'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const pages = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9333/json/list', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  console.log('Pages found:', pages.map(p => ({ title: p.title, url: p.url })));
  const page = pages.find(p => p.url.includes('localhost:3000')) || pages[0];
  if (!page) throw new Error('No page found');

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
  console.log('Connected to target page WebSocket');

  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('*** RUNTIME EXCEPTION THROWN ***');
      console.error(msg.params.exceptionDetails.text);
      if (msg.params.exceptionDetails.exception) {
        console.error(msg.params.exceptionDetails.exception.description);
      }
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        console.error('*** CONSOLE ERROR ***:', msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      }
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');

  await new Promise(r => setTimeout(r, 1500));

  console.log('Clicking Multi-Corridor button...');
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const mcBtn = buttons.find(b => b.textContent.includes('Multi-Corridor'));
        if (mcBtn) {
          mcBtn.click();
          return 'Clicked Multi-Corridor button!';
        }
        return 'Multi-Corridor button not found. Buttons: ' + buttons.map(b => b.textContent.trim()).join(' | ');
      })()
    `
  });

  console.log('Click result:', evalResult?.result?.value);

  await new Promise(r => setTimeout(r, 1500));

  // Check what's in the DOM
  const check = await send('Runtime.evaluate', {
    expression: `
      (function() {
        return {
          bodyTextLength: document.body.innerText.length,
          hasMultiCorridorView: !!document.getElementById('multi-corridor-analysis-view'),
          rootChildrenCount: document.getElementById('root') ? document.getElementById('root').children.length : 0,
          rootInnerHTML: document.getElementById('root') ? document.getElementById('root').innerHTML.slice(0, 300) : 'NO ROOT'
        };
      })()
    `,
    returnByValue: true
  });
  console.log('DOM check after click:', check?.result?.value);

  ws.close();
  chrome.kill();
  process.exit(0);
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
