(() => {
  const storageKey = 'dockpilot-pages-demo-v1';
  const nativeFetch = window.fetch.bind(window);
  const now = () => new Date().toISOString();
  const makeId = () => crypto.randomUUID();
  const readState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch {
      // Reset malformed demo-only local data.
    }
    return {
      user: null,
      passwordHash: null,
      sessionActive: false,
      credentials: [],
      events: [],
      approvals: [],
    };
  };
  let state = readState();
  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  const error = (code, message, status = 400) => json({ error: code, message }, status);
  const hashPassword = async (password) => {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
      '',
    );
  };
  const token = () =>
    `dpai_demo_${Array.from(crypto.getRandomValues(new Uint8Array(18)), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;

  function addEvent(fields = {}) {
    const event = {
      id: makeId(),
      occurredAt: now(),
      outcome: 'success',
      action: 'mcp.health',
      resourceType: 'mcp_tool',
      resourceId: null,
      correlationId: `demo-${makeId().slice(0, 8)}`,
      aiCredentialId: state.credentials[0]?.id ?? null,
      aiCredentialName: state.credentials[0]?.name ?? null,
      agentIdentity: state.credentials[0]?.agentIdentity ?? 'demo-agent',
      toolName: 'dockpilot_health',
      permissionUsed: 'read',
      targetType: null,
      targetId: null,
      approvalId: null,
      durationMs: 12,
      sourceIp: '127.0.0.1',
      userAgent: 'DockPilot GitHub Pages demo',
      actorUserId: null,
      errorCategory: null,
      inputSummary: {},
      resultSummary: { status: 'ok' },
      metadata: { demo: true },
      ...fields,
    };
    state.events.unshift(event);
    return event;
  }

  function seed() {
    if (!state.user || state.credentials.length || state.events.length || state.approvals.length)
      return;
    const credentialId = makeId();
    const createdAt = new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString();
    state.credentials.push({
      id: credentialId,
      name: 'claude-code-laptop',
      description: 'Read-only demo credential for a local MCP client.',
      agentIdentity: 'claude-code',
      permissionLevel: 'read',
      tokenPrefix: 'dpai_demo_7f2a',
      createdByUserId: state.user.id,
      createdAt,
      lastUsedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      expiresAt: null,
      revokedAt: null,
      disabledAt: null,
      metadata: { demo: true },
    });
    addEvent({
      occurredAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      action: 'mcp.list_users',
      toolName: 'dockpilot_list_users',
      durationMs: 18,
      inputSummary: { limit: 25 },
      resultSummary: { users: 1 },
    });
    addEvent({
      occurredAt: new Date(Date.now() - 1000 * 60 * 33).toISOString(),
      action: 'mcp.health',
      toolName: 'dockpilot_health',
      resultSummary: { status: 'ok', database: 'reachable' },
    });
    addEvent({
      occurredAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
      outcome: 'denied',
      action: 'mcp.request_credential_revocation',
      toolName: 'dockpilot_request_credential_revocation',
      permissionUsed: 'destructive',
      errorCategory: 'approval_required',
      targetType: 'ai_credential',
      targetId: credentialId,
      resultSummary: { approvalRequired: true },
    });
    const approvalId = makeId();
    state.approvals.push({
      id: approvalId,
      toolName: 'dockpilot_request_session_revocation',
      actionType: 'session.revoke',
      permissionLevel: 'destructive',
      targetType: 'session',
      targetId: makeId(),
      arguments: { justification: 'Demo request: revoke an old browser session.' },
      justification: 'Demo request: revoke an old browser session that is no longer in use.',
      status: 'pending',
      requestedByCredentialId: credentialId,
      requestedByCredentialName: 'claude-code-laptop',
      requestedByAgentIdentity: 'claude-code',
      decidedByUserId: null,
      decidedAt: null,
      decisionNote: null,
      executionAuditEventId: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    });
    save();
  }

  function systemStatus() {
    return {
      setupRequired: !state.user,
      service: 'dockpilot-api',
      protocolVersion: 1,
      database: 'reachable',
      mcpEnabled: true,
      counts: {
        users: state.user ? 1 : 0,
        activeSessions: state.sessionActive ? 1 : 0,
        activeAiCredentials: state.credentials.filter((item) => !item.revokedAt && !item.disabledAt)
          .length,
        revokedAiCredentials: state.credentials.filter((item) => item.revokedAt).length,
        pendingApprovals: state.approvals.filter((item) => item.status === 'pending').length,
        auditEvents24h: state.events.length,
      },
      serverTime: now(),
    };
  }

  async function handle(request) {
    const url = new URL(request.url, location.href);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    if (path === '/api/v1/health' && method === 'GET') {
      return json({ status: 'ok', service: 'dockpilot-api', protocolVersion: 1 });
    }
    if (path === '/api/v1/auth/setup-status' && method === 'GET') {
      return json({ setupRequired: !state.user });
    }
    if (path === '/api/v1/auth/me' && method === 'GET') {
      return state.sessionActive && state.user
        ? json({ user: state.user })
        : error('UNAUTHENTICATED', 'Sign in to continue.', 401);
    }
    if (path === '/api/v1/auth/setup' && method === 'POST') {
      if (state.user)
        return error('SETUP_ALREADY_COMPLETE', 'The demo account has already been created.', 409);
      const body = await request.json();
      if (
        !/^\S+@\S+\.\S+$/.test(body.email || '') ||
        !body.name?.trim() ||
        !body.organizationName?.trim() ||
        (body.password || '').length < 12
      ) {
        return error(
          'VALIDATION_ERROR',
          'Enter a valid email, name, organization, and a password with at least 12 characters.',
        );
      }
      state.user = {
        id: makeId(),
        email: body.email.trim().toLowerCase(),
        name: body.name.trim(),
        organizationId: makeId(),
        role: 'owner',
      };
      state.passwordHash = await hashPassword(body.password);
      state.sessionActive = true;
      seed();
      save();
      return json({ user: state.user });
    }
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const body = await request.json();
      if (
        !state.user ||
        body.email?.trim().toLowerCase() !== state.user.email ||
        (await hashPassword(body.password || '')) !== state.passwordHash
      ) {
        return error('INVALID_CREDENTIALS', 'Email or password is incorrect.', 401);
      }
      state.sessionActive = true;
      save();
      return json({ user: state.user });
    }
    if (path === '/api/v1/auth/logout' && method === 'POST') {
      state.sessionActive = false;
      save();
      return json({ ok: true });
    }
    if (!path.startsWith('/api/v1/admin/')) return nativeFetch(request);
    if (!state.sessionActive || !state.user)
      return error('UNAUTHENTICATED', 'Sign in to continue.', 401);
    seed();
    if (path === '/api/v1/admin/system-status' && method === 'GET') return json(systemStatus());
    if (path === '/api/v1/admin/ai-credentials' && method === 'GET') {
      const start = Number(url.searchParams.get('cursor') || 0);
      const page = state.credentials.slice(start, start + 25);
      return json({
        credentials: page,
        nextCursor: start + 25 < state.credentials.length ? String(start + 25) : null,
      });
    }
    if (path === '/api/v1/admin/ai-credentials' && method === 'POST') {
      const body = await request.json();
      if (!body.name?.trim()) return error('VALIDATION_ERROR', 'Credential name is required.');
      const created = {
        id: makeId(),
        name: body.name.trim(),
        description: body.description || null,
        agentIdentity: body.agentIdentity || 'unnamed-agent',
        permissionLevel: body.permissionLevel || 'read',
        tokenPrefix: 'dpai_demo_' + makeId().slice(0, 8),
        createdByUserId: state.user.id,
        createdAt: now(),
        lastUsedAt: null,
        expiresAt: body.expiresInDays
          ? new Date(Date.now() + Number(body.expiresInDays) * 86400000).toISOString()
          : null,
        revokedAt: null,
        disabledAt: null,
        metadata: body.metadata || { demo: true },
      };
      state.credentials.unshift(created);
      addEvent({
        action: 'admin.ai_credential.create',
        toolName: null,
        agentIdentity: null,
        aiCredentialId: created.id,
        aiCredentialName: created.name,
        actorUserId: state.user.id,
        resultSummary: { created: true },
        targetType: 'ai_credential',
        targetId: created.id,
      });
      save();
      return json({ credential: created, token: token() }, 201);
    }
    const revokeMatch = path.match(/^\/api\/v1\/admin\/ai-credentials\/([^/]+)\/revoke$/);
    if (revokeMatch && method === 'POST') {
      const item = state.credentials.find((credential) => credential.id === revokeMatch[1]);
      if (!item) return error('NOT_FOUND', 'Credential not found.', 404);
      item.revokedAt ||= now();
      addEvent({
        action: 'admin.ai_credential.revoke',
        toolName: null,
        agentIdentity: null,
        aiCredentialId: item.id,
        aiCredentialName: item.name,
        actorUserId: state.user.id,
        targetType: 'ai_credential',
        targetId: item.id,
        resultSummary: { revoked: true },
      });
      save();
      return json({ credential: item });
    }
    if (path === '/api/v1/admin/audit-events' && method === 'GET') {
      let events = state.events.slice();
      for (const [key, field] of [
        ['toolName', 'toolName'],
        ['action', 'action'],
        ['outcome', 'outcome'],
        ['aiCredentialId', 'aiCredentialId'],
        ['targetType', 'targetType'],
        ['targetId', 'targetId'],
      ]) {
        const value = url.searchParams.get(key);
        if (value) events = events.filter((item) => String(item[field] || '').includes(value));
      }
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      if (from) events = events.filter((item) => item.occurredAt >= from);
      if (to) events = events.filter((item) => item.occurredAt <= to);
      const start = Number(url.searchParams.get('cursor') || 0);
      const limit = Math.min(Number(url.searchParams.get('limit') || 25), 100);
      const page = events.slice(start, start + limit);
      return json({
        events: page,
        nextCursor: start + limit < events.length ? String(start + limit) : null,
      });
    }
    const eventMatch = path.match(/^\/api\/v1\/admin\/audit-events\/([^/]+)$/);
    if (eventMatch && method === 'GET') {
      const item = state.events.find((event) => event.id === eventMatch[1]);
      return item ? json(item) : error('NOT_FOUND', 'Audit event not found.', 404);
    }
    if (path === '/api/v1/admin/approvals' && method === 'GET') {
      const status = url.searchParams.get('status');
      let approvals = status
        ? state.approvals.filter((item) => item.status === status)
        : state.approvals;
      const start = Number(url.searchParams.get('cursor') || 0);
      const page = approvals.slice(start, start + 25);
      return json({
        approvals: page,
        nextCursor: start + 25 < approvals.length ? String(start + 25) : null,
      });
    }
    const decisionMatch = path.match(/^\/api\/v1\/admin\/approvals\/([^/]+)\/decision$/);
    if (decisionMatch && method === 'POST') {
      const approval = state.approvals.find((item) => item.id === decisionMatch[1]);
      if (!approval) return error('NOT_FOUND', 'Approval not found.', 404);
      if (approval.status !== 'pending')
        return error('CONFLICT', 'This approval has already been decided.', 409);
      const body = await request.json();
      approval.status = body.decision === 'approve' ? 'executed' : 'rejected';
      approval.decidedAt = now();
      approval.decidedByUserId = state.user.id;
      approval.decisionNote = body.note || null;
      const event = addEvent({
        action: `admin.approval.${body.decision}`,
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        targetType: approval.targetType,
        targetId: approval.targetId,
        approvalId: approval.id,
        outcome: body.decision === 'approve' ? 'success' : 'denied',
        resultSummary: { status: approval.status },
      });
      approval.executionAuditEventId = event.id;
      save();
      return json({ approval });
    }
    return error('NOT_FOUND', 'No mock demo endpoint matches this request.', 404);
  }

  window.fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    if (!new URL(request.url).pathname.startsWith('/api/v1/')) return nativeFetch(input, init);
    try {
      return await handle(request);
    } catch {
      return error('DEMO_ERROR', 'The local demo could not complete this mock request.', 500);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.textContent = 'DEMO MODE · Runs in this browser only · Do not enter a real password';
    banner.setAttribute('role', 'note');
    banner.style.cssText =
      'position:fixed;right:14px;bottom:14px;z-index:9999;max-width:calc(100vw - 28px);padding:9px 12px;border:1px solid #385273;border-radius:7px;background:#111d2a;color:#bdd6f5;font:10px/1.4 ui-monospace,SFMono-Regular,monospace;letter-spacing:.25px;box-shadow:0 8px 24px #0008';
    document.body.append(banner);
  });
})();
