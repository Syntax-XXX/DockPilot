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
      hosts: [],
      containers: [],
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

  function dockerId(seed) {
    return Array.from(
      { length: 64 },
      (_, index) => '0123456789abcdef'[(seed * 7 + index * 13) % 16],
    ).join('');
  }

  function seedDocker() {
    if (state.hosts.length) return;
    const nodes = [
      { name: 'cedar-nas', endpoint: 'unix:///var/run/docker.sock', version: '27.1.1' },
      { name: 'maple-mini', endpoint: 'unix:///run/docker.sock', version: '26.1.4' },
    ];
    const images = ['nginx:alpine', 'postgres:17', 'ghcr.io/dockpilot/agent:1.2.0'];
    nodes.forEach((node, nodeIndex) => {
      const hostId = makeId();
      state.hosts.push({
        id: hostId,
        name: node.name,
        description: 'Simulated homelab node (demo data only).',
        endpoint: node.endpoint,
        status: 'healthy',
        dockerVersion: node.version,
        lastError: null,
        lastErrorAt: null,
        lastSeenAt: new Date(Date.now() - nodeIndex * 45_000).toISOString(),
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      });
      for (let index = 0; index < 3; index += 1) {
        const containerId = dockerId(nodeIndex * 10 + index + 1);
        state.containers.push({
          id: makeId(),
          hostId,
          containerId,
          shortId: containerId.slice(0, 12),
          name: `${node.name}-svc-${String(index + 1)}`,
          image: images[(nodeIndex + index) % images.length],
          state: index === 2 ? 'exited' : 'running',
          status: index === 2 ? 'Exited (0) 2 hours ago' : 'Up 3 hours',
          syncedAt: new Date(Date.now() - nodeIndex * 60_000).toISOString(),
        });
      }
    });
    save();
  }

  function demoImages(hostId) {
    const tags = ['nginx:alpine', 'postgres:17', 'ghcr.io/dockpilot/agent:1.2.0'];
    const hostIndex = Math.max(
      0,
      state.hosts.findIndex((item) => item.id === hostId),
    );
    return tags.map((tag, index) => ({
      id: `sha256:${dockerId(hostIndex * 20 + index + 1)}`,
      repoDigests: [],
      repoTags: [tag],
      sizeBytes: 20_000_000 + index * 7_000_000,
      sharedSizeBytes: 0,
      containerCount: state.containers.filter(
        (item) => item.hostId === hostId && item.image === tag,
      ).length,
      dangling: false,
      createdAt: new Date(Date.now() - 86_400_000 * (index + 1)).toISOString(),
    }));
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
    seedDocker();
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
    if (path === '/api/v1/admin/hosts' && method === 'GET') {
      const start = Number(url.searchParams.get('cursor') || 0);
      const page = state.hosts.slice(start, start + 25);
      return json({
        hosts: page,
        nextCursor: start + 25 < state.hosts.length ? String(start + 25) : null,
      });
    }
    if (path === '/api/v1/admin/hosts' && method === 'POST') {
      const body = await request.json();
      if (!body.name?.trim() || !/^unix:\/\//.test(body.endpoint || '')) {
        return error('VALIDATION_ERROR', 'Provide a host name and a valid Docker endpoint.');
      }
      const host = {
        id: makeId(),
        name: body.name.trim(),
        description: body.description || null,
        endpoint: body.endpoint.trim(),
        status: 'healthy',
        dockerVersion: '27.1.1',
        lastError: null,
        lastErrorAt: null,
        lastSeenAt: now(),
        createdAt: now(),
      };
      state.hosts.unshift(host);
      addEvent({
        action: 'host.created',
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'host',
        resourceId: host.id,
        targetType: 'host',
        targetId: host.id,
        inputSummary: { name: host.name, endpoint: host.endpoint },
        resultSummary: { created: true },
      });
      save();
      return json({ host }, 201);
    }
    const hostMatch = path.match(/^\/api\/v1\/admin\/hosts\/([^/]+)$/);
    if (hostMatch && method === 'GET') {
      const host = state.hosts.find((item) => item.id === hostMatch[1]);
      return host ? json(host) : error('NOT_FOUND', 'Host not found.', 404);
    }
    if (hostMatch && method === 'DELETE') {
      const host = state.hosts.find((item) => item.id === hostMatch[1]);
      if (!host) return error('NOT_FOUND', 'Host not found.', 404);
      const body = await request.json().catch(() => ({}));
      const approval = {
        id: makeId(),
        toolName: 'admin.host_removal',
        actionType: 'host.remove',
        permissionLevel: 'destructive',
        targetType: 'host',
        targetId: host.id,
        arguments: { hostId: host.id },
        justification: body.justification || 'Administrator removal request (demo).',
        status: 'pending',
        requestedByCredentialId: null,
        requestedByCredentialName: null,
        requestedByAgentIdentity: null,
        decidedByUserId: null,
        decidedAt: null,
        decisionNote: null,
        executionAuditEventId: null,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        createdAt: now(),
      };
      state.approvals.unshift(approval);
      addEvent({
        action: 'host.removal_requested',
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'host',
        resourceId: host.id,
        targetType: 'host',
        targetId: host.id,
        approvalId: approval.id,
        resultSummary: { approvalRequired: true },
      });
      save();
      return json({ approval }, 202);
    }
    const syncMatch = path.match(/^\/api\/v1\/admin\/hosts\/([^/]+)\/sync$/);
    if (syncMatch && method === 'POST') {
      const host = state.hosts.find((item) => item.id === syncMatch[1]);
      if (!host) return error('NOT_FOUND', 'Host not found.', 404);
      host.status = 'healthy';
      host.lastSeenAt = now();
      addEvent({
        action: 'host.synced',
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'host',
        resourceId: host.id,
        targetType: 'host',
        targetId: host.id,
        resultSummary: {
          synced: state.containers.filter((item) => item.hostId === host.id).length,
        },
      });
      save();
      return json({ synced: state.containers.filter((item) => item.hostId === host.id).length });
    }
    const hostContainersMatch = path.match(/^\/api\/v1\/admin\/hosts\/([^/]+)\/containers$/);
    if (hostContainersMatch && method === 'GET') {
      const containers = state.containers.filter((item) => item.hostId === hostContainersMatch[1]);
      return json({ containers, nextCursor: null });
    }
    const hostImagesMatch = path.match(/^\/api\/v1\/admin\/hosts\/([^/]+)\/images$/);
    if (hostImagesMatch && method === 'GET') {
      const host = state.hosts.find((item) => item.id === hostImagesMatch[1]);
      if (!host) return error('NOT_FOUND', 'Host not found.', 404);
      return json({ images: demoImages(host.id), nextCursor: null });
    }
    if (hostImagesMatch && method === 'DELETE') {
      const host = state.hosts.find((item) => item.id === hostImagesMatch[1]);
      if (!host) return error('NOT_FOUND', 'Host not found.', 404);
      const body = await request.json().catch(() => ({}));
      const approval = {
        id: makeId(),
        toolName: 'admin.image_removal',
        actionType: 'image.remove',
        permissionLevel: 'destructive',
        targetType: 'image',
        targetId: body.imageId || null,
        arguments: { hostId: host.id, imageId: body.imageId || null },
        justification: body.justification || 'Administrator image removal request (demo).',
        status: 'pending',
        requestedByCredentialId: null,
        requestedByCredentialName: null,
        requestedByAgentIdentity: null,
        decidedByUserId: null,
        decidedAt: null,
        decisionNote: null,
        executionAuditEventId: null,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        createdAt: now(),
      };
      state.approvals.unshift(approval);
      addEvent({
        action: 'image.removal_requested',
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'image',
        resourceId: host.id,
        targetType: 'image',
        targetId: body.imageId || null,
        approvalId: approval.id,
        resultSummary: { approvalRequired: true },
      });
      save();
      return json({ approval }, 202);
    }
    const hostDiagnosticsMatch = path.match(/^\/api\/v1\/admin\/hosts\/([^/]+)\/diagnostics$/);
    if (hostDiagnosticsMatch && method === 'GET') {
      const host = state.hosts.find((item) => item.id === hostDiagnosticsMatch[1]);
      if (!host) return error('NOT_FOUND', 'Host not found.', 404);
      const stopped = state.containers.filter(
        (item) => item.hostId === host.id && item.state !== 'running',
      ).length;
      const checks = [
        {
          id: 'engine_reachable',
          title: 'Docker engine reachable',
          severity: 'ok',
          summary: 'The simulated engine answered.',
          detail: 'Response received in 14 ms (simulated).',
        },
        {
          id: 'docker_version',
          title: 'Docker version reported',
          severity: 'ok',
          summary: `Docker ${host.dockerVersion} (simulated).`,
          detail: null,
        },
        {
          id: 'stopped_containers',
          title: 'Stopped containers',
          severity: stopped > 2 ? 'warning' : 'info',
          summary: `${stopped} simulated container(s) are not running.`,
          detail: null,
        },
        {
          id: 'disk_usage',
          title: 'Image storage',
          severity: 'info',
          summary: 'Simulated image layer usage is within normal range.',
          detail: null,
        },
      ];
      const overall = stopped > 2 ? 'warning' : 'ok';
      addEvent({
        action: 'host.diagnosed',
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'host',
        resourceId: host.id,
        targetType: 'host',
        targetId: host.id,
        resultSummary: { overall },
      });
      save();
      return json({
        diagnostics: {
          hostId: host.id,
          hostName: host.name,
          overall,
          checkedAt: now(),
          checks,
        },
      });
    }
    if (path === '/api/v1/admin/docker-summary' && method === 'GET') {
      const healthy = state.hosts.filter((item) => item.status === 'healthy').length;
      const errored = state.hosts.filter((item) => item.status === 'error').length;
      const disabled = state.hosts.filter((item) => item.status === 'disabled').length;
      const running = state.containers.filter((item) => item.state === 'running').length;
      const lastSynced =
        state.containers
          .map((item) => item.syncedAt)
          .filter(Boolean)
          .sort()
          .pop() || null;
      return json({
        summary: {
          hosts: state.hosts.length,
          healthyHosts: healthy,
          errorHosts: errored,
          disabledHosts: disabled,
          containers: state.containers.length,
          runningContainers: running,
          stoppedContainers: state.containers.length - running,
          lastSyncedAt: lastSynced,
        },
      });
    }
    const containerStatsMatch = path.match(/^\/api\/v1\/admin\/containers\/([a-f0-9]{64})\/stats$/);
    if (containerStatsMatch && method === 'GET') {
      const container = state.containers.find(
        (item) => item.containerId === containerStatsMatch[1],
      );
      if (!container) return error('NOT_FOUND', 'Container not found.', 404);
      const running = container.state === 'running';
      return json({
        stats: {
          cpuPercent: running ? 3.5 : 0,
          memoryUsedBytes: running ? 48_000_000 : 0,
          memoryLimitBytes: 512_000_000,
          memoryPercent: running ? 9.38 : 0,
          networkRxBytes: running ? 1024 : 0,
          networkTxBytes: running ? 2048 : 0,
          blockReadBytes: running ? 4096 : 0,
          blockWriteBytes: running ? 8192 : 0,
          pids: running ? 5 : 0,
          capturedAt: now(),
        },
      });
    }
    const containerMatch = path.match(/^\/api\/v1\/admin\/containers\/([a-f0-9]{64})$/);
    if (containerMatch && method === 'DELETE') {
      const container = state.containers.find((item) => item.containerId === containerMatch[1]);
      if (!container) return error('NOT_FOUND', 'Container not found.', 404);
      const body = await request.json().catch(() => ({}));
      const approval = {
        id: makeId(),
        toolName: 'admin.container_removal',
        actionType: 'container.remove',
        permissionLevel: 'destructive',
        targetType: 'container',
        targetId: container.containerId,
        arguments: { containerId: container.containerId },
        justification: body.justification || 'Administrator removal request (demo).',
        status: 'pending',
        requestedByCredentialId: null,
        requestedByCredentialName: null,
        requestedByAgentIdentity: null,
        decidedByUserId: null,
        decidedAt: null,
        decisionNote: null,
        executionAuditEventId: null,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        createdAt: now(),
      };
      state.approvals.unshift(approval);
      addEvent({
        action: 'container.removal_requested',
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'container',
        resourceId: container.id,
        targetType: 'container',
        targetId: container.containerId,
        approvalId: approval.id,
        resultSummary: { approvalRequired: true },
      });
      save();
      return json({ approval }, 202);
    }
    const containerLogsMatch = path.match(/^\/api\/v1\/admin\/containers\/([a-f0-9]{64})\/logs$/);
    if (containerLogsMatch && method === 'GET') {
      const container = state.containers.find((item) => item.containerId === containerLogsMatch[1]);
      if (!container) return error('NOT_FOUND', 'Container not found.', 404);
      const tail = Math.min(Number(url.searchParams.get('tail') || 200), 1000);
      const log = [
        `${now()}  INFO  Starting ${container.name}`,
        `${now()}  INFO  Health check passed`,
        `${now()}  INFO  Serving on the simulated network`,
        '',
        'Demo logs are generated locally. No real container output is available.',
      ].join('\n');
      return json({ log: { log, tty: false, tail } });
    }
    const containerActionMatch = path.match(
      /^\/api\/v1\/admin\/containers\/([a-f0-9]{64})\/(start|stop|restart)$/,
    );
    if (containerActionMatch && method === 'POST') {
      const container = state.containers.find(
        (item) => item.containerId === containerActionMatch[1],
      );
      if (!container) return error('NOT_FOUND', 'Container not found.', 404);
      const action = containerActionMatch[2];
      container.state = action === 'stop' ? 'exited' : 'running';
      container.status = action === 'stop' ? 'Exited (0) just now' : 'Up just now';
      const actionNames = {
        start: 'container.started',
        stop: 'container.stopped',
        restart: 'container.restarted',
      };
      addEvent({
        action: actionNames[action],
        toolName: null,
        agentIdentity: null,
        actorUserId: state.user.id,
        resourceType: 'container',
        resourceId: container.id,
        targetType: 'container',
        targetId: container.containerId,
        resultSummary: { state: container.state },
      });
      save();
      return json({ container });
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
