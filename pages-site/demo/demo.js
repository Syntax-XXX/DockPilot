(() => {
  'use strict';
  const STORE = 'dockpilot-demo-console-v1';
  const initialState = () => ({
    paused: false,
    events: [
      {
        time: Date.now() - 45000,
        icon: '↻',
        title: 'Container restarted',
        detail: 'paperless · cedar-nas',
        kind: 'good',
      },
      {
        time: Date.now() - 4 * 60000,
        icon: '⬡',
        title: 'New image pulled',
        detail: 'ghcr.io/home-assistant/home-assistant:stable',
        kind: 'blue',
      },
      {
        time: Date.now() - 12 * 60000,
        icon: '⇄',
        title: 'Node heartbeat received',
        detail: 'cedar-nas · local agent',
        kind: 'good',
      },
      {
        time: Date.now() - 25 * 60000,
        icon: '⚠',
        title: 'Image update available',
        detail: 'postgres:16.2 → postgres:16.4',
        kind: 'amber',
      },
    ],
    containers: [
      {
        id: 'c1',
        name: 'paperless',
        image: 'ghcr.io/paperless-ngx/paperless-ngx:2.14',
        node: 'cedar-nas',
        state: 'Running',
        cpu: 4.2,
        memory: 412,
        uptime: '12d 04h',
      },
      {
        id: 'c2',
        name: 'home-assistant',
        image: 'ghcr.io/home-assistant/home-assistant:stable',
        node: 'cedar-nas',
        state: 'Running',
        cpu: 8.7,
        memory: 682,
        uptime: '8d 11h',
      },
      {
        id: 'c3',
        name: 'postgres',
        image: 'postgres:16.2-alpine',
        node: 'cedar-nas',
        state: 'Running',
        cpu: 1.3,
        memory: 238,
        uptime: '12d 04h',
      },
      {
        id: 'c4',
        name: 'caddy',
        image: 'caddy:2.8-alpine',
        node: 'cedar-nas',
        state: 'Running',
        cpu: 0.7,
        memory: 54,
        uptime: '24d 19h',
      },
      {
        id: 'c5',
        name: 'immich-server',
        image: 'ghcr.io/immich-app/immich-server:release',
        node: 'maple-mini',
        state: 'Running',
        cpu: 12.6,
        memory: 1054,
        uptime: '3d 07h',
      },
      {
        id: 'c6',
        name: 'redis',
        image: 'redis:7-alpine',
        node: 'maple-mini',
        state: 'Running',
        cpu: 0.4,
        memory: 42,
        uptime: '3d 07h',
      },
      {
        id: 'c7',
        name: 'uptime-kuma',
        image: 'louislam/uptime-kuma:1',
        node: 'maple-mini',
        state: 'Running',
        cpu: 1.1,
        memory: 116,
        uptime: '18d 02h',
      },
      {
        id: 'c8',
        name: 'whoami',
        image: 'traefik/whoami:latest',
        node: 'birch-pi',
        state: 'Stopped',
        cpu: 0,
        memory: 0,
        uptime: '—',
      },
    ],
    hosts: [
      {
        id: 'h1',
        name: 'cedar-nas',
        label: 'Primary · Debian 12',
        address: '192.168.1.20',
        cpu: 31,
        memory: 62,
        disk: 71,
        temp: 48,
        containers: 4,
        status: 'Online',
        arch: 'x86_64',
        docker: '27.5.1',
        uptime: '24d 19h',
      },
      {
        id: 'h2',
        name: 'maple-mini',
        label: 'Compute · Ubuntu 24.04',
        address: '192.168.1.31',
        cpu: 42,
        memory: 54,
        disk: 38,
        temp: 56,
        containers: 3,
        status: 'Online',
        arch: 'aarch64',
        docker: '27.5.1',
        uptime: '18d 02h',
      },
      {
        id: 'h3',
        name: 'birch-pi',
        label: 'Edge · Raspberry Pi OS',
        address: '192.168.1.42',
        cpu: 16,
        memory: 39,
        disk: 44,
        temp: 51,
        containers: 1,
        status: 'Online',
        arch: 'aarch64',
        docker: '26.1.4',
        uptime: '9d 13h',
      },
    ],
    hiddenBanner: false,
    securityEnabled: true,
  });
  function readState() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE));
      if (data && Array.isArray(data.containers) && Array.isArray(data.hosts)) return data;
    } catch {
      /* start a clean browser-only preview */
    }
    return initialState();
  }
  let state = readState();
  let page = 'overview';
  let search = '';
  let containerFilter = 'all';
  const content = document.querySelector('#page-content');
  const modal = document.querySelector('#modal');
  const toastRegion = document.querySelector('#toast-region');
  const save = () => localStorage.setItem(STORE, JSON.stringify(state));
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  const host = (id) => state.hosts.find((item) => item.id === id);
  const countRunning = () => state.containers.filter((item) => item.state === 'Running').length;
  const countUpdatable = () =>
    staticResources.images.filter((item) => item[3] === 'Update available').length;
  function toast(message) {
    const element = document.createElement('div');
    element.className = 'toast';
    element.textContent = message;
    toastRegion.append(element);
    window.setTimeout(() => element.remove(), 2700);
  }
  function addEvent(title, detail, icon = '•', kind = 'blue') {
    state.events.unshift({ time: Date.now(), title, detail, icon, kind });
    state.events = state.events.slice(0, 24);
    save();
  }
  function timeAgo(time) {
    const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }
  function heading(eyebrow, title, subtitle, action = '') {
    return `<header class="page-heading"><div><div class="eyebrow"><i class="pulse-dot"></i>${eyebrow}</div><h1>${title}</h1><p>${subtitle}</p></div>${action}</header>`;
  }
  function actionButton(action, label, cls = '') {
    return `<button class="button ${cls}" data-action="${action}">${label}</button>`;
  }
  function renderOverview() {
    const running = countRunning();
    const updatable = countUpdatable();
    return `${heading('YOUR INFRASTRUCTURE / LIVE OVERVIEW', `Good ${greeting()}, Demo Operator.`, 'Your simulated homelab at a glance.', actionButton('refresh', '↻ &nbsp; Refresh overview'))}
      <section class="metrics">
        <article class="metric"><div class="metric-top"><span>CONNECTED NODES</span><span class="metric-icon">▣</span></div><strong class="metric-value">${state.hosts.filter((item) => item.status === 'Online').length}<small style="font-size:13px;color:#7c8da0"> / ${state.hosts.length}</small></strong><span class="metric-note good">All agents reporting</span></article>
        <article class="metric"><div class="metric-top"><span>RUNNING CONTAINERS</span><span class="metric-icon">▤</span></div><strong class="metric-value">${running}<small style="font-size:13px;color:#7c8da0"> / ${state.containers.length}</small></strong><span class="metric-note">Across all nodes</span></article>
        <article class="metric"><div class="metric-top"><span>NEEDS ATTENTION</span><span class="metric-icon">⚠</span></div><strong class="metric-value warn">${updatable}</strong><span class="metric-note">Image updates available</span></article>
        <article class="metric"><div class="metric-top"><span>SECURITY POSTURE</span><span class="metric-icon">⬡</span></div><strong class="metric-value good">A−</strong><span class="metric-note">${state.hosts.length} demo nodes scanned</span></article>
      </section>
      <section class="hero-card"><div class="hero-copy"><div class="eyebrow">✣ &nbsp; YOUR HOMELAB IS CONNECTED</div><h2>Three nodes. One clear picture.</h2><p>Live demo telemetry from a simulated homelab. Explore containers, inspect node metrics, and try safe actions—everything is local to this browser and resets anytime.</p><button class="button primary" data-page="hosts">Explore connected nodes &nbsp; →</button></div><div class="network-art" aria-label="Three connected demo nodes"><svg viewBox="0 0 190 128"><line x1="95" y1="24" x2="43" y2="92"/><line x1="95" y1="24" x2="155" y2="92"/><line x1="43" y1="92" x2="155" y2="92"/></svg><span class="net-node n1">▣</span><span class="net-node n2">▣</span><span class="net-node n3">▣</span></div></section>
      <div class="section-row"><h2>Connected nodes</h2><button class="text-link" data-page="hosts">View all nodes →</button></div>
      <section class="nodes-grid">${state.hosts.map(nodeCard).join('')}</section>
      <section class="columns"><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">EVENT STREAM</p><h2>Recent activity</h2></div><button class="text-link" data-page="activity">View all →</button></div>${renderEvents(4)}</article><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">HEALTH CHECK</p><h2>System status</h2></div><span class="online-pill"><i></i> OPERATIONAL</span></div>${healthRows()}</article></section>`;
  }
  function greeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  }
  function nodeCard(node) {
    const cpuWidth = node.cpu;
    return `<article class="node-card"><div class="node-head"><span class="node-icon">▣</span><span class="node-title"><strong>${escapeHtml(node.name)}</strong><small>${escapeHtml(node.label)}</small></span><span class="online-pill"><i></i> LIVE</span></div><div class="node-stats"><span>CPU <strong>${node.cpu.toFixed(1)}%</strong></span><span>MEMORY <strong>${node.memory}%</strong></span><span>CONTAINERS <strong>${state.containers.filter((item) => item.node === node.name && item.state === 'Running').length} / ${node.containers}</strong></span><span>UPTIME <strong>${node.uptime}</strong></span></div><div class="node-load"><i style="width:${cpuWidth}%"></i></div><button class="text-link" style="margin-top:10px;padding:0" data-node="${node.id}">Node details →</button></article>`;
  }
  function healthRows() {
    return `<div class="health-row"><i class="status-indicator"></i><span>Demo API</span><span>Connected</span></div><div class="health-row"><i class="status-indicator"></i><span>Node agents</span><span>3 reporting</span></div><div class="health-row"><i class="status-indicator"></i><span>Database</span><span>Demo storage ready</span></div><div class="health-row"><i class="status-indicator amber"></i><span>Image updates</span><span>2 available</span></div>`;
  }
  function renderEvents(limit = 30) {
    return `<div class="activity-list">${state.events
      .slice(0, limit)
      .map(
        (event) =>
          `<div class="activity-row"><span class="activity-icon ${event.kind === 'amber' ? 'warn' : event.kind === 'good' ? 'good' : ''}">${event.icon}</span><span class="activity-copy"><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.detail)}</small></span><time class="activity-time">${timeAgo(event.time)}</time></div>`,
      )
      .join('')}</div>`;
  }
  function nodeDetails(node) {
    if (!node) return;
    modal.querySelector('#modal-content').innerHTML =
      `<p class="section-eyebrow">NODE DETAILS · LIVE DEMO</p><h2>${escapeHtml(node.name)}</h2><p>${escapeHtml(node.label)} · ${escapeHtml(node.address)}</p><div class="settings-grid"><div class="mini-panel" style="padding:13px"><p class="section-eyebrow">PROCESSOR</p><strong>${node.cpu.toFixed(1)}%</strong><div class="node-load"><i style="width:${node.cpu}%"></i></div></div><div class="mini-panel" style="padding:13px"><p class="section-eyebrow">MEMORY</p><strong>${node.memory}%</strong><div class="node-load"><i style="width:${node.memory}%"></i></div></div><div class="mini-panel" style="padding:13px"><p class="section-eyebrow">DISK</p><strong>${node.disk}%</strong><div class="node-load"><i style="width:${node.disk}%"></i></div></div><div class="mini-panel" style="padding:13px"><p class="section-eyebrow">TEMPERATURE</p><strong>${node.temp}°C</strong></div></div><p>Docker ${node.docker} · ${node.arch} · Up ${node.uptime}. Metrics update automatically in this simulated demo.</p><button class="button" type="button" data-dialog-action="node-refresh" data-node="${node.id}">↻ Refresh metrics</button><button class="button danger" type="button" data-dialog-action="node-disconnect" data-node="${node.id}">Disconnect demo node</button>`;
    modal.showModal();
  }
  function renderHosts() {
    return `${heading('INFRASTRUCTURE', 'Connected nodes', `${state.hosts.length} simulated Docker hosts are online and reporting live demo metrics.`, actionButton('add-node', '+ &nbsp; Add demo node', 'primary'))}<div class="node-page-grid">${state.hosts.map(nodeCard).join('')}</div><section class="columns"><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">CONNECTION MAP</p><h2>Node topology</h2></div><span class="online-pill"><i></i> ${state.hosts.length} CONNECTED</span></div><div class="hero-card" style="margin:0;min-height:170px"><div class="hero-copy"><h2>All nodes reporting</h2><p>Last heartbeat received seconds ago. Demo agents send simulated health and inventory telemetry.</p></div><div class="network-art"><svg viewBox="0 0 190 128"><line x1="95" y1="24" x2="43" y2="92"/><line x1="95" y1="24" x2="155" y2="92"/><line x1="43" y1="92" x2="155" y2="92"/></svg><span class="net-node n1">▣</span><span class="net-node n2">▣</span><span class="net-node n3">▣</span></div></div></article><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">AGENT HEALTH</p><h2>Connection status</h2></div></div>${state.hosts.map((node) => `<div class="health-row"><i class="status-indicator"></i><span>${escapeHtml(node.name)}</span><span>Online · ${timeAgo(Date.now() - Math.floor(Math.random() * 15000))}</span></div>`).join('')}</article></section>`;
  }
  function renderContainers() {
    const rows = state.containers.filter(
      (item) =>
        (containerFilter === 'all' || item.state.toLowerCase() === containerFilter) &&
        `${item.name} ${item.image} ${item.node}`.toLowerCase().includes(search.toLowerCase()),
    );
    return `${heading('INFRASTRUCTURE', 'Containers', `${countRunning()} running across ${state.hosts.length} connected nodes. Actions are simulated and safe.`, actionButton('deploy', '+ &nbsp; Deploy demo container', 'primary'))}<div class="toolbar"><input class="search" id="container-search" placeholder="⌕  Search containers..." value="${escapeHtml(search)}"><select class="filter" id="container-filter"><option value="all">All states</option><option value="running" ${containerFilter === 'running' ? 'selected' : ''}>Running</option><option value="stopped" ${containerFilter === 'stopped' ? 'selected' : ''}>Stopped</option></select><span class="spacer"></span><span class="metric-note">${rows.length} containers</span></div><div class="table-card table-scroll"><table><thead><tr><th>CONTAINER</th><th>IMAGE</th><th>NODE</th><th>CPU</th><th>MEMORY</th><th>STATE</th><th>ACTIONS</th></tr></thead><tbody>${rows.map((item) => `<tr><td><span class="container-name"><span class="container-glyph">▤</span><strong>${escapeHtml(item.name)}</strong></span></td><td class="mono">${escapeHtml(item.image)}</td><td>${escapeHtml(item.node)}</td><td>${item.cpu.toFixed(1)}%</td><td>${item.memory} MB</td><td><span class="state ${item.state === 'Stopped' ? 'stopped' : ''}">${item.state}</span></td><td><span class="row-actions"><button class="tiny-action" title="${item.state === 'Running' ? 'Stop' : 'Start'}" aria-label="${item.state === 'Running' ? 'Stop' : 'Start'} ${escapeHtml(item.name)}" data-container-action="toggle" data-id="${item.id}">${item.state === 'Running' ? 'Ⅱ' : '▶'}</button><button class="tiny-action" title="Restart" aria-label="Restart ${escapeHtml(item.name)}" data-container-action="restart" data-id="${item.id}">↻</button><button class="tiny-action" title="View logs" aria-label="View logs for ${escapeHtml(item.name)}" data-container-action="logs" data-id="${item.id}">≡</button><button class="tiny-action danger-text" title="Remove demo container" aria-label="Remove ${escapeHtml(item.name)}" data-container-action="remove" data-id="${item.id}">×</button></span></td></tr>`).join('')}</tbody></table>${rows.length ? '' : '<div class="empty"><strong>No containers found</strong><p>Try another search or filter.</p></div>'}</div>`;
  }
  const staticResources = {
    images: [
      ['ghcr.io/paperless-ngx/paperless-ngx:2.14', 'cedar-nas', '2.14', 'Update available'],
      ['ghcr.io/home-assistant/home-assistant:stable', 'cedar-nas', '2025.2.1', 'Current'],
      ['postgres:16.2-alpine', 'cedar-nas', '16.2', 'Update available'],
      ['ghcr.io/immich-app/immich-server:release', 'maple-mini', 'v1.125.7', 'Current'],
      ['redis:7-alpine', 'maple-mini', '7.4.2', 'Current'],
      ['caddy:2.8-alpine', 'cedar-nas', '2.8.4', 'Current'],
      ['traefik/whoami:latest', 'birch-pi', 'latest', 'Current'],
    ],
    volumes: [
      ['paperless_data', 'cedar-nas', '4.8 GB', 'paperless, postgres'],
      ['homeassistant_config', 'cedar-nas', '1.2 GB', 'home-assistant'],
      ['immich_uploads', 'maple-mini', '28.4 GB', 'immich-server'],
      ['redis_data', 'maple-mini', '64 MB', 'redis'],
      ['caddy_data', 'cedar-nas', '18 MB', 'caddy'],
      ['media_library', 'birch-pi', '12.1 GB', '—'],
    ],
    networks: [
      ['bridge', 'cedar-nas', 'bridge', '4 containers'],
      ['paperless_default', 'cedar-nas', 'bridge', '2 containers'],
      ['proxy', 'cedar-nas', 'bridge', '3 containers'],
      ['immich_default', 'maple-mini', 'bridge', '2 containers'],
      ['bridge', 'maple-mini', 'bridge', '3 containers'],
      ['bridge', 'birch-pi', 'bridge', '1 container'],
    ],
  };
  function renderResources(type) {
    const title = type[0].toUpperCase() + type.slice(1);
    const data = staticResources[type];
    const explanation = {
      images: 'Image inventory across all connected nodes. Two updates are available.',
      volumes: 'Persistent Docker volumes and their attached containers.',
      networks: 'Docker network topology and connected workloads.',
    }[type];
    const cols = {
      images: ['IMAGE', 'NODE', 'TAG', 'UPDATE'],
      volumes: ['VOLUME', 'NODE', 'SIZE', 'USED BY'],
      networks: ['NETWORK', 'NODE', 'DRIVER', 'CONTAINERS'],
    }[type];
    return `${heading('INFRASTRUCTURE', title, explanation, actionButton(type === 'images' ? 'pull-image' : 'resource-info', type === 'images' ? '↓ &nbsp; Pull image' : '＋ &nbsp; Demo action'))}<div class="toolbar"><input class="search resource-search" placeholder="⌕  Filter ${type}..." value="${escapeHtml(search)}"><span class="spacer"></span><span class="metric-note">${data.length} ${type}</span></div><div class="table-card table-scroll"><table><thead><tr>${cols.map((col) => `<th>${col}</th>`).join('')}<th>ACTION</th></tr></thead><tbody>${data
      .filter((row) => row.join(' ').toLowerCase().includes(search.toLowerCase()))
      .map(
        (row, index) =>
          `<tr>${row.map((cell, i) => `<td class="${i === 0 ? 'mono' : ''}">${escapeHtml(cell)}</td>`).join('')}<td><button class="tiny-action" data-resource-action="inspect" data-index="${index}" aria-label="Inspect ${escapeHtml(row[0])}">⌕</button> <button class="tiny-action" data-resource-action="action" data-index="${index}" aria-label="Action on ${escapeHtml(row[0])}">···</button></td></tr>`,
      )
      .join('')}</tbody></table></div>`;
  }
  function renderActivity() {
    const filter = document.querySelector('#event-filter')?.value || 'all';
    const events = state.events.filter(
      (event) =>
        (filter === 'all' || event.kind === filter) &&
        `${event.title} ${event.detail}`.toLowerCase().includes(search.toLowerCase()),
    );
    return `${heading('OPERATIONS', 'Activity stream', 'A local timeline of simulated node, container, and operator events.', actionButton('export-events', '↓ &nbsp; Export'))}<div class="toolbar"><input class="search event-search" placeholder="⌕  Search events..." value="${escapeHtml(search)}"><select class="filter" id="event-filter"><option value="all" ${filter === 'all' ? 'selected' : ''}>All event types</option><option value="good" ${filter === 'good' ? 'selected' : ''}>Healthy</option><option value="amber" ${filter === 'amber' ? 'selected' : ''}>Attention</option></select><span class="spacer"></span>${actionButton('clear-events', 'Clear activity')}</div><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">LIVE EVENT STREAM</p><h2>${events.length} events</h2></div><span class="online-pill"><i></i> UPDATING</span></div>${events.length ? `<div class="activity-list">${events.map((event) => `<div class="activity-row"><span class="activity-icon ${event.kind === 'amber' ? 'warn' : event.kind === 'good' ? 'good' : ''}">${event.icon}</span><span class="activity-copy"><strong>${escapeHtml(event.title)}</strong><small>${escapeHtml(event.detail)}</small></span><time class="activity-time">${timeAgo(event.time)}</time></div>`).join('')}</div>` : '<div class="empty"><strong>No matching activity</strong><p>Try another filter or reset the demo.</p></div>'}</article>`;
  }
  function renderSecurity() {
    return `${heading('OPERATIONS', 'Security overview', 'Demo-only posture checks and safe recommendations for this simulated environment.', actionButton('security-scan', '⌕ &nbsp; Run demo scan', 'primary'))}<section class="metrics"><article class="metric"><div class="metric-top"><span>POSTURE SCORE</span><span class="metric-icon">⬡</span></div><strong class="metric-value good">A−</strong><span class="metric-note">Good · 82 / 100</span></article><article class="metric"><div class="metric-top"><span>CRITICAL</span><span class="metric-icon">!</span></div><strong class="metric-value good">0</strong><span class="metric-note">Nothing critical</span></article><article class="metric"><div class="metric-top"><span>WARNINGS</span><span class="metric-icon">⚠</span></div><strong class="metric-value warn">2</strong><span class="metric-note">Recommendations</span></article><article class="metric"><div class="metric-top"><span>SCANNED NODES</span><span class="metric-icon">▣</span></div><strong class="metric-value">3</strong><span class="metric-note">All agents reporting</span></article></section><div class="section-row"><h2>Recommendations</h2><small>Demo simulation · not a real security audit</small></div><section class="columns"><article class="panel"><div class="activity-row"><span class="activity-icon warn">⚠</span><span class="activity-copy"><strong>Pin image tags for production services</strong><small>Mutable tags like :latest can change without notice.</small></span><button class="text-link" data-action="security-detail">Details</button></div><div class="activity-row"><span class="activity-icon warn">⬡</span><span class="activity-copy"><strong>Review exposed ports on cedar-nas</strong><small>2 services bind to all interfaces in this sample.</small></span><button class="text-link" data-action="security-detail">Details</button></div><div class="activity-row"><span class="activity-icon good">✓</span><span class="activity-copy"><strong>No privileged containers detected</strong><small>All simulated workloads use default isolation.</small></span></div></article><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">POLICY</p><h2>Demo monitoring</h2></div><span class="online-pill"><i></i> ENABLED</span></div><div class="setting-row"><span><strong>Show demo alerts</strong><small>Include simulated security events.</small></span><button class="switch ${state.securityEnabled ? '' : 'off'}" data-setting="security" aria-label="Toggle demo alerts"></button></div><div class="setting-row"><span><strong>Refresh demo telemetry</strong><small>Automatic simulated metrics.</small></span><button class="switch ${state.paused ? 'off' : ''}" data-setting="pause" aria-label="Toggle live demo"></button></div></article></section>`;
  }
  function renderSettings() {
    return `${heading('WORKSPACE', 'Demo settings', 'Customize this browser-only preview. No server configuration is changed.', actionButton('reset', '↻ &nbsp; Reset demo'))}<div class="settings-grid"><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">DEMO ENVIRONMENT</p><h2>Preview controls</h2></div></div><div class="setting-row"><span><strong>Live telemetry</strong><small>Simulate node metric updates.</small></span><button class="switch ${state.paused ? 'off' : ''}" data-setting="pause" aria-label="Toggle live telemetry"></button></div><div class="setting-row"><span><strong>Security alerts</strong><small>Show simulated findings.</small></span><button class="switch ${state.securityEnabled ? '' : 'off'}" data-setting="security" aria-label="Toggle security alerts"></button></div><div class="setting-row"><span><strong>Demo data persistence</strong><small>Keep your actions in this browser.</small></span><button class="switch" data-action="persistence" aria-label="Demo storage info"></button></div></article><article class="panel"><div class="panel-heading"><div><p class="section-eyebrow">ABOUT THIS PREVIEW</p><h2>Safe to explore</h2></div><span class="metric-icon">ⓘ</span></div><p class="metric-note" style="line-height:1.8">This static demonstration runs entirely in your browser. It never connects to Docker, an API, or a database. Actions update sample records saved in this browser's local storage.</p><button class="button" data-action="data-info">What data is stored?</button><button class="button danger" data-action="reset">Reset all demo data</button></article></div>`;
  }
  function render() {
    document
      .querySelectorAll('[data-page]')
      .forEach((item) => item.classList.toggle('active', item.dataset.page === page));
    const titles = {
      overview: 'Overview',
      hosts: 'Hosts',
      containers: 'Containers',
      images: 'Images',
      volumes: 'Volumes',
      networks: 'Networks',
      activity: 'Activity',
      security: 'Security',
      settings: 'Settings',
    };
    document.querySelector('#crumb-title').textContent = titles[page] || 'Overview';
    const pages = {
      overview: renderOverview,
      hosts: renderHosts,
      containers: renderContainers,
      images: () => renderResources('images'),
      volumes: () => renderResources('volumes'),
      networks: () => renderResources('networks'),
      activity: renderActivity,
      security: renderSecurity,
      settings: renderSettings,
    };
    content.innerHTML = (pages[page] || renderOverview)();
  }
  function showLogs(item) {
    modal.querySelector('#modal-content').innerHTML =
      `<p class="section-eyebrow">CONTAINER LOGS · SIMULATED</p><h2>${escapeHtml(item.name)}</h2><pre>${new Date().toISOString()}  INFO  Starting ${escapeHtml(item.name)}\n${new Date(Date.now() - 4000).toISOString()}  INFO  Health check passed\n${new Date(Date.now() - 12000).toISOString()}  INFO  Connected to ${escapeHtml(item.node)}\n${new Date(Date.now() - 21000).toISOString()}  INFO  Ready to serve requests\n\nDemo logs are generated locally. No real container output is available.</pre><button class="button" type="button" data-dialog-action="copy-logs">Copy demo logs</button>`;
    modal.showModal();
  }
  const confirmCallbacks = new Map();
  function confirmAction(title, text, confirmLabel, onConfirm) {
    const key = `confirm-${Date.now()}-${Math.random()}`;
    confirmCallbacks.set(key, onConfirm);
    modal.querySelector('#modal-content').innerHTML =
      `<p class="section-eyebrow">DEMO ACTION</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p><button class="button primary" type="button" data-dialog-action="confirm" data-confirm-key="${key}">${escapeHtml(confirmLabel)}</button><button class="button" type="button" data-dialog-action="cancel">Cancel</button>`;
    modal.showModal();
  }
  function doContainerAction(action, id) {
    const item = state.containers.find((entry) => entry.id === id);
    if (!item) return;
    if (action === 'logs') return showLogs(item);
    if (action === 'toggle') {
      item.state = item.state === 'Running' ? 'Stopped' : 'Running';
      item.cpu = item.state === 'Running' ? 2.4 : 0;
      item.memory = item.state === 'Running' ? 96 : 0;
      addEvent(
        `Container ${item.state.toLowerCase()}`,
        `${item.name} · ${item.node}`,
        item.state === 'Running' ? '▶' : 'Ⅱ',
        'good',
      );
      toast(`${item.name} ${item.state.toLowerCase()} (demo)`);
      return render();
    }
    if (action === 'restart') {
      item.state = 'Running';
      item.cpu = 2.1;
      addEvent('Container restarted', `${item.name} · ${item.node}`, '↻', 'good');
      toast(`${item.name} restarted (demo)`);
      return render();
    }
    if (action === 'remove')
      confirmAction(
        'Remove demo container?',
        `${item.name} will be removed from the local demo inventory. This does not affect any real container.`,
        'Remove from demo',
        () => {
          state.containers = state.containers.filter((entry) => entry.id !== id);
          const owningHost = state.hosts.find((entry) => entry.name === item.node);
          if (owningHost) owningHost.containers = Math.max(0, owningHost.containers - 1);
          addEvent('Demo container removed', `${item.name} · ${item.node}`, '×', 'amber');
          save();
          render();
          toast(`${item.name} removed from demo`);
        },
      );
  }
  function onAction(action) {
    if (action === 'refresh') {
      if (!state.paused) tickMetrics();
      addEvent('Overview refreshed', 'Demo telemetry updated locally', '↻', 'good');
      render();
      toast('Demo overview refreshed');
    } else if (action === 'add-node') {
      const name = `spruce-node-${Date.now().toString().slice(-4)}`;
      const id = `h${Date.now()}`;
      state.hosts.push({
        id,
        name,
        label: 'New demo node · Debian 12',
        address: `192.168.1.${20 + state.hosts.length * 7}`,
        cpu: 8 + Math.round(Math.random() * 30),
        memory: 38 + Math.round(Math.random() * 25),
        disk: 22 + Math.round(Math.random() * 30),
        temp: 41 + Math.round(Math.random() * 17),
        containers: 0,
        status: 'Online',
        arch: 'x86_64',
        docker: '27.5.1',
        uptime: '0d 00h',
      });
      addEvent('Demo node connected', `${name} · simulated agent`, '▣', 'good');
      render();
      toast(`${name} connected (demo)`);
    } else if (action === 'deploy') {
      modal.querySelector('#modal-content').innerHTML =
        `<p class="section-eyebrow">DEMO DEPLOYMENT</p><h2>Deploy a sample container</h2><p>Choose a simulated node. This creates a local demo inventory row only.</p><label class="section-eyebrow" for="deploy-node">TARGET NODE</label><select id="deploy-node" class="filter" style="display:block;width:100%;margin:8px 0 15px">${state.hosts.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join('')}</select><button class="button primary" type="button" data-dialog-action="deploy">Deploy demo container</button>`;
      modal.showModal();
    } else if (action === 'pull-image') {
      confirmAction(
        'Pull a sample image?',
        'Simulate pulling nginx:alpine to cedar-nas. No network image pull occurs.',
        'Simulate image pull',
        () => {
          staticResources.images.unshift(['nginx:alpine', 'cedar-nas', 'alpine', 'Current']);
          addEvent('Image pulled', 'nginx:alpine · cedar-nas', '⬡', 'good');
          render();
          toast('Image pull simulated');
        },
      );
    } else if (action === 'resource-info')
      toast('Resource action is available through the demo table buttons.');
    else if (action === 'export-events') {
      const blob = new Blob(
        [
          JSON.stringify(
            state.events.map((item) => ({ ...item, time: new Date(item.time).toISOString() })),
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      );
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'dockpilot-demo-activity.json';
      link.click();
      URL.revokeObjectURL(link.href);
      toast('Demo event export downloaded');
    } else if (action === 'clear-events')
      confirmAction(
        'Clear demo activity?',
        'This removes local demo activity entries. Node and container state will remain.',
        'Clear activity',
        () => {
          state.events = [];
          save();
          render();
          toast('Demo activity cleared');
        },
      );
    else if (action === 'security-scan') {
      addEvent(
        'Demo security scan complete',
        '3 simulated nodes · 0 critical · 2 recommendations',
        '⬡',
        'good',
      );
      render();
      toast('Demo scan complete: 0 critical, 2 recommendations');
    } else if (action === 'security-detail')
      showModal(
        'Recommendation details',
        'This demo finding is illustrative only. A real DockPilot deployment would inspect your configured Docker hosts and report observed settings.',
      );
    else if (action === 'reset')
      confirmAction(
        'Reset this browser demo?',
        'All demo node, container, and activity changes in this browser will return to the sample state.',
        'Reset demo',
        () => {
          state = initialState();
          save();
          page = 'overview';
          render();
          toast('Demo reset to sample data');
        },
      );
    else if (action === 'dismiss-banner') {
      document.querySelector('.demo-banner').remove();
      state.hiddenBanner = true;
      save();
    } else if (action === 'workspace')
      showModal(
        'Demo homelab',
        'This preview contains one simulated workspace: Demo homelab. Workspace switching is not connected to a server.',
      );
    else if (action === 'help')
      showModal(
        'Demo controls',
        'Every action in this preview is simulated in this browser. Explore the sidebar pages, start and stop sample containers, inspect sample logs, add a demo node, and reset the demo whenever you like.',
      );
    else if (action === 'notifications')
      showModal(
        'Notifications',
        'Two sample image updates are available. No real infrastructure is connected.',
      );
    else if (action === 'profile')
      showModal(
        'Demo Operator',
        'You are exploring a local-only preview. There is no sign-in and no account is created.',
      );
    else if (action === 'persistence' || action === 'data-info')
      showModal(
        'Local demo data',
        'Demo actions are saved in this browser’s local storage so the preview survives a refresh. Nothing is sent to a server. Use Reset demo to restore the original sample state.',
      );
  }
  function showModal(title, body) {
    modal.querySelector('#modal-content').innerHTML =
      `<p class="section-eyebrow">DOCKPILOT DEMO</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p><button class="button" type="button" data-dialog-action="cancel">Got it</button>`;
    modal.showModal();
  }
  function tickMetrics() {
    if (state.paused) return;
    state.hosts.forEach((item) => {
      item.cpu = Math.max(3, Math.min(86, item.cpu + (Math.random() - 0.48) * 6));
      item.memory = Number(
        Math.max(24, Math.min(91, item.memory + (Math.random() - 0.5) * 1.2)).toFixed(1),
      );
      item.temp = Math.max(38, Math.min(74, Math.round(item.temp + (Math.random() - 0.5) * 2)));
    });
    state.containers
      .filter((item) => item.state === 'Running')
      .forEach((item) => {
        item.cpu = Math.max(0.1, Math.min(28, item.cpu + (Math.random() - 0.5) * 1.6));
      });
    save();
  }
  content.addEventListener('click', (event) => {
    const target = event.target.closest('button,a');
    if (!target) return;
    if (target.dataset.page) {
      event.preventDefault();
      page = target.dataset.page;
      search = '';
      render();
      content.focus({ preventScroll: true });
      return;
    }
    if (target.dataset.action) {
      onAction(target.dataset.action, target);
      return;
    }
    if (target.dataset.node) {
      nodeDetails(host(target.dataset.node));
      return;
    }
    if (target.dataset.containerAction) {
      doContainerAction(target.dataset.containerAction, target.dataset.id);
      return;
    }
    if (target.dataset.resourceAction) {
      const type = page;
      const row = staticResources[type]?.[Number(target.dataset.index)];
      if (target.dataset.resourceAction === 'inspect')
        showModal(
          'Resource details',
          `${row?.[0] || 'Demo resource'} · ${row?.slice(1).join(' · ') || 'Sample inventory item'}. This detail is simulated.`,
        );
      else toast(`Demo ${type.slice(0, -1)} menu opened`);
    }
  });
  content.addEventListener('input', (event) => {
    if (event.target.matches('#container-search,.resource-search,.event-search')) {
      search = event.target.value;
      const pos = event.target.selectionStart;
      render();
      const replacement =
        content.querySelector(`#${event.target.id}`) ||
        content.querySelector(`.${event.target.classList[0]}`);
      replacement?.focus();
      replacement?.setSelectionRange(pos, pos);
    }
  });
  content.addEventListener('change', (event) => {
    if (event.target.id === 'container-filter') {
      containerFilter = event.target.value;
      render();
    }
    if (event.target.id === 'event-filter') {
      render();
    }
  });
  content.addEventListener('click', (event) => {
    const setting = event.target.closest('[data-setting]');
    if (setting) {
      if (setting.dataset.setting === 'pause') state.paused = !state.paused;
      else state.securityEnabled = !state.securityEnabled;
      save();
      render();
      toast(
        setting.dataset.setting === 'pause'
          ? state.paused
            ? 'Live demo paused'
            : 'Live demo resumed'
          : 'Demo alert preference updated',
      );
    }
  });
  modal.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-dialog-action]');
    if (!target) return;
    const action = target.dataset.dialogAction;
    if (action === 'cancel') {
      modal.close();
      return;
    }
    if (action === 'confirm') {
      const callback = confirmCallbacks.get(target.dataset.confirmKey);
      confirmCallbacks.delete(target.dataset.confirmKey);
      modal.close();
      callback?.();
      return;
    }
    if (action === 'deploy') {
      const targetNode = document.querySelector('#deploy-node')?.value || state.hosts[0]?.name;
      const name = `demo-service-${state.containers.length + 1}`;
      state.containers.unshift({
        id: `c${Date.now()}`,
        name,
        image: 'nginx:alpine',
        node: targetNode,
        state: 'Running',
        cpu: 0.3,
        memory: 18,
        uptime: '0m',
      });
      const selectedHost = state.hosts.find((item) => item.name === targetNode);
      if (selectedHost) selectedHost.containers++;
      addEvent('Demo container deployed', `${name} · ${targetNode}`, '▶', 'good');
      modal.close();
      page = 'containers';
      render();
      toast(`${name} deployed (demo)`);
      return;
    }

    if (action === 'copy-logs') {
      try {
        await navigator.clipboard.writeText(document.querySelector('.modal pre').textContent);
        toast('Demo logs copied');
      } catch {
        toast('Clipboard unavailable in this browser');
      }
    }
    if (action === 'node-refresh') {
      const node = host(target.dataset.node);
      if (node) {
        tickMetrics();
        nodeDetails(node);
      }
    }
    if (action === 'node-disconnect') {
      const node = host(target.dataset.node);
      if (!node) return;
      modal.close();
      confirmAction(
        'Disconnect demo node?',
        `Remove ${node.name} from this local sample.`,
        'Disconnect node',
        () => {
          state.hosts = state.hosts.filter((item) => item.id !== node.id);
          state.containers = state.containers.filter((item) => item.node !== node.name);
          addEvent('Demo node disconnected', `${node.name} removed from sample`, '×', 'amber');
          save();
          render();
          toast(`${node.name} disconnected (demo)`);
        },
      );
    }
  });
  document.addEventListener('click', (event) => {
    const homeLink = event.target.closest('a[href="#overview"]');
    if (homeLink) {
      event.preventDefault();
      page = 'overview';
      search = '';
      render();
      content.focus({ preventScroll: true });
      return;
    }
    const pageTarget = event.target.closest('[data-page]');
    if (pageTarget && !content.contains(pageTarget)) {
      event.preventDefault();
      page = pageTarget.dataset.page;
      search = '';
      render();
      content.focus({ preventScroll: true });
      return;
    }
    const target = event.target.closest('[data-action]');
    if (target && !target.closest('#page-content')) onAction(target.dataset.action, target);
  });
  if (state.hiddenBanner) document.querySelector('.demo-banner')?.remove();
  render();
  window.setInterval(() => {
    tickMetrics();
    if (page === 'overview' || page === 'hosts') render();
  }, 5000);
})();
