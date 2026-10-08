import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const webBuild = new URL('apps/web/dist/', root);
const demoDir = new URL('./', import.meta.url);
const html = await readFile(new URL('index.html', webBuild), 'utf8');
const jsPath = html.match(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/)?.[1];
const cssPath = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if (!jsPath || !cssPath) throw new Error('Could not find the built JavaScript and CSS bundles.');

const assetName = (path) => path.slice(path.lastIndexOf('/') + 1);
const jsAsset = `./assets/${assetName(jsPath)}`;
const cssAsset = `./assets/${assetName(cssPath)}`;
await rm(new URL('assets/', demoDir), { recursive: true, force: true });
await mkdir(new URL('assets/', demoDir), { recursive: true });
await cp(new URL('assets/', webBuild), new URL('assets/', demoDir), { recursive: true });

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0d12" />
    <meta name="color-scheme" content="dark" />
    <meta name="description" content="An interactive, local-only DockPilot demo. Do not enter real credentials." />
    <meta name="demo-mode" content="browser-local-only" />
    <title>DockPilot — Docker, without the guessing.</title>
    <link rel="icon" href="data:," />
    <link rel="stylesheet" crossorigin href="${cssAsset}" />
    <script src="./mock-api.js"></script>
    <style>
      .demo-signin { display: block; margin: 14px auto 0; padding: 7px 12px; color: #9cb2d0; border: 1px solid #2b3543; border-radius: 5px; background: #141a23; font: 10px ui-monospace, monospace; cursor: pointer; }
      .demo-signin:hover { color: #fff; border-color: #4776ae; }
    </style>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'demo-signin';
        button.textContent = 'Open demo dashboard';
        button.addEventListener('click', async () => {
          button.disabled = true;
          button.textContent = 'Opening demo…';
          try {
            const response = await fetch('/api/v1/auth/setup-status');
            const status = await response.json();
            if (status.setupRequired) {
              const setup = await fetch('/api/v1/auth/setup', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'demo@dockpilot.local', password: 'DockPilotDemoPassword2026!', name: 'Demo Operator', organizationName: 'DockPilot Demo' }),
              });
              if (!setup.ok) throw new Error('Could not create the local demo account.');
            } else {
              const login = await fetch('/api/v1/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'demo@dockpilot.local', password: 'DockPilotDemoPassword2026!' }),
              });
              if (!login.ok) throw new Error('Could not sign into the local demo.');
            }
            location.reload();
          } catch (error) {
            button.disabled = false;
            button.textContent = error instanceof Error ? error.message : 'Demo sign-in failed';
          }
        });
        const addButton = () => {
          const card = document.querySelector('.auth-card-wrap');
          if (card && !card.querySelector('.demo-signin')) card.append(button);
        };
        addButton();
        new MutationObserver(addButton).observe(document.body, { childList: true, subtree: true });
      });
    </script>
    <script type="module" crossorigin src="${jsAsset}"></script>
  </head>
  <body><div id="root"></div></body>
</html>
`;
await writeFile(new URL('index.html', demoDir), page);
console.log(`Prepared Pages demo using ${jsAsset} and ${cssAsset}.`);
