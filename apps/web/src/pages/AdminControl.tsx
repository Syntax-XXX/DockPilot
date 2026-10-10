import { useCallback, useEffect, useState, type ReactNode, type SyntheticEvent } from 'react';
import {
  Activity,
  BadgeCheck,
  Bot,
  Check,
  CircleSlash,
  ClipboardCopy,
  Fingerprint,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  mcpToolNames,
  type AiCredentialView,
  type AiPermissionLevel,
  type ApprovalView,
  type AuditEvent,
  type SafeUser,
  type SystemStatus,
} from '@dockpilot/shared';
import {
  ApiError,
  createAiCredential,
  decideApproval,
  disableAiCredential,
  enableAiCredential,
  fetchAiCredentials,
  fetchApprovals,
  fetchAuditEvent,
  fetchAuditEvents,
  fetchSystemStatus,
  revokeAiCredential,
  rotateAiCredential,
} from '../lib/api.js';

export type AdminSection = 'ai-credentials' | 'audit-log' | 'approvals';

export function isAdministrator(user: SafeUser): boolean {
  return user.role === 'owner' || user.role === 'admin';
}

export function AdminControl({ section, user }: { section: AdminSection; user: SafeUser }) {
  if (!isAdministrator(user)) {
    return (
      <AdminPanel>
        <div className="admin-lock">
          <span className="admin-lock-icon">
            <ShieldAlert size={20} />
          </span>
          <h2>Administrator access required</h2>
          <p>
            AI credentials, the AI activity log and approval decisions are restricted to instance
            owners and administrators. Your role is <strong>{user.role.toUpperCase()}</strong>.
          </p>
        </div>
      </AdminPanel>
    );
  }

  if (section === 'ai-credentials') return <AiCredentialsPanel />;
  if (section === 'audit-log') return <AuditLogPanel />;
  return <ApprovalsPanel />;
}

function AdminPanel({ children }: { children: ReactNode }) {
  return <section className="admin-panel">{children}</section>;
}

function PanelHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-heading">
      <div className="admin-heading-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="admin-heading-detail">{description}</p>
      </div>
      <span className="admin-heading-icon">
        <Icon size={18} />
      </span>
      {actions !== undefined && <div className="admin-heading-actions">{actions}</div>}
    </header>
  );
}

function PanelNotice({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <div
      className={`admin-notice admin-notice--${tone}`}
      role={tone === 'error' ? 'alert' : 'note'}
    >
      {tone === 'error' ? <TriangleAlert size={15} /> : <ShieldCheck size={15} />}
      <span>{children}</span>
    </div>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="admin-loading" aria-busy="true">
      <Loader2 size={15} className="admin-spin" /> {label}
    </div>
  );
}

function EmptyRow({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="quiet-empty">
      <span className="quiet-empty-icon">
        <Icon size={17} />
      </span>
      <span>
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>
      <span className="empty-line" />
    </div>
  );
}

function ErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'The request could not be completed.';
}

function PermissionChip({ level }: { level: AiPermissionLevel }) {
  return <span className={`permission-chip permission-chip--${level}`}>{level.toUpperCase()}</span>;
}

function OutcomeChip({ outcome }: { outcome: string }) {
  const label = outcome === 'failure' ? 'FAILED' : outcome === 'denied' ? 'DENIED' : 'OK';
  return <span className={`outcome-chip outcome-chip--${outcome}`}>{label}</span>;
}

function StatusChip({ credential }: { credential: AiCredentialView }) {
  const expired = credential.expiresAt !== null && Date.parse(credential.expiresAt) <= Date.now();
  if (credential.revokedAt !== null)
    return <span className="state-chip state-chip--red">REVOKED</span>;
  if (credential.disabledAt !== null) return <span className="state-chip">DISABLED</span>;
  if (expired) return <span className="state-chip state-chip--amber">EXPIRED</span>;
  return <span className="state-chip state-chip--green">ACTIVE</span>;
}

function formatTimestamp(value: string | null): string {
  if (value === null) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
}

function shortId(value: string | null): string {
  if (value === null) return '—';
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

function CopiedButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="button button--outline button--compact"
      onClick={() => {
        void copy();
      }}
    >
      {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
      {copied ? 'Copied' : 'Copy token'}
    </button>
  );
}

function AiCredentialsPanel() {
  const [credentials, setCredentials] = useState<AiCredentialView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issuedToken, setIssuedToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingRotate, setPendingRotate] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentIdentity, setAgentIdentity] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<AiPermissionLevel>('read');
  const [expiresInDays, setExpiresInDays] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, systemStatus] = await Promise.all([fetchAiCredentials(), fetchSystemStatus()]);
      setCredentials(page.credentials);
      setNextCursor(page.nextCursor);
      setStatus(systemStatus);
    } catch (loadError) {
      setError(ErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function loadMore(): Promise<void> {
    if (nextCursor === null) return;
    setLoading(true);
    try {
      const page = await fetchAiCredentials(nextCursor);
      setCredentials((current) => [...current, ...page.credentials]);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      setError(ErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    setFormError(null);
    try {
      const trimmedExpiry = expiresInDays.trim();
      const created = await createAiCredential({
        name: name.trim(),
        permissionLevel,
        ...(description.trim() === '' ? {} : { description: description.trim() }),
        ...(agentIdentity.trim() === '' ? {} : { agentIdentity: agentIdentity.trim() }),
        ...(trimmedExpiry === '' ? {} : { expiresInDays: Number(trimmedExpiry) }),
      });
      setIssuedToken(created.token);
      setName('');
      setDescription('');
      setAgentIdentity('');
      setExpiresInDays('');
      setPermissionLevel('read');
      await load();
    } catch (createError) {
      setFormError(ErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string): Promise<void> {
    setBusyId(id);
    setError(null);
    try {
      await revokeAiCredential(id);
      setPendingRevoke(null);
      await load();
    } catch (revokeError) {
      setError(ErrorMessage(revokeError));
    } finally {
      setBusyId(null);
    }
  }

  async function toggleDisabled(credential: AiCredentialView): Promise<void> {
    setBusyId(credential.id);
    setError(null);
    try {
      if (credential.disabledAt === null) {
        await disableAiCredential(credential.id);
      } else {
        await enableAiCredential(credential.id);
      }
      await load();
    } catch (toggleError) {
      setError(ErrorMessage(toggleError));
    } finally {
      setBusyId(null);
    }
  }

  async function rotate(id: string): Promise<void> {
    setBusyId(id);
    setError(null);
    try {
      const rotated = await rotateAiCredential(id);
      setPendingRotate(null);
      setIssuedToken(rotated.token);
      await load();
    } catch (rotateError) {
      setError(ErrorMessage(rotateError));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPanel>
      <PanelHeading
        eyebrow="AI CONTROL"
        title="AI credentials"
        description="MCP clients authenticate with a dedicated AI credential, never with a browser session. Permissions are enforced server-side on every tool call."
        icon={Fingerprint}
        actions={
          <button
            type="button"
            className="button button--outline button--compact"
            onClick={() => {
              void load();
            }}
            disabled={loading}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {status !== null && (
        <div className="admin-stats">
          <AdminStat label="USERS" value={status.counts.users} />
          <AdminStat label="ACTIVE SESSIONS" value={status.counts.activeSessions} />
          <AdminStat label="ACTIVE AI CREDENTIALS" value={status.counts.activeAiCredentials} />
          <AdminStat label="REVOKED AI CREDENTIALS" value={status.counts.revokedAiCredentials} />
          <AdminStat label="PENDING APPROVALS" value={status.counts.pendingApprovals} />
          <AdminStat label="AUDIT EVENTS (24H)" value={status.counts.auditEvents24h} />
        </div>
      )}

      {issuedToken !== null && (
        <div className="token-reveal" role="alert">
          <div className="token-reveal-head">
            <span className="token-reveal-icon">
              <KeyRound size={16} />
            </span>
            <div>
              <strong>Copy this token now.</strong>
              <p>
                It is shown once and cannot be retrieved later. Store it in your MCP client&apos;s
                secret store, never in source control.
              </p>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Hide issued token"
              onClick={() => {
                setIssuedToken(null);
              }}
            >
              <X size={15} />
            </button>
          </div>
          <code className="token-value">{issuedToken}</code>
          <div className="token-reveal-actions">
            <CopiedButton value={issuedToken} />
            <button
              type="button"
              className="button button--primary button--compact"
              onClick={() => {
                setIssuedToken(null);
              }}
            >
              I have stored it
            </button>
          </div>
        </div>
      )}

      <form className="admin-form" onSubmit={(event) => void submit(event)}>
        <p className="panel-eyebrow">CREATE A CREDENTIAL</p>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>NAME</span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
              maxLength={80}
              required
              placeholder="e.g. claude-code-laptop"
            />
          </label>
          <label className="admin-field">
            <span>AGENT IDENTITY</span>
            <input
              value={agentIdentity}
              onChange={(event) => {
                setAgentIdentity(event.target.value);
              }}
              maxLength={120}
              placeholder="e.g. claude-code"
            />
          </label>
          <label className="admin-field">
            <span>PERMISSION LEVEL</span>
            <select
              value={permissionLevel}
              onChange={(event) => {
                const value = event.target.value;
                setPermissionLevel(
                  value === 'write' ? 'write' : value === 'destructive' ? 'destructive' : 'read',
                );
              }}
            >
              <option value="read">read — inspect only</option>
              <option value="write">write — non-destructive changes</option>
              <option value="destructive">destructive — may request irreversible actions</option>
            </select>
          </label>
          <label className="admin-field">
            <span>EXPIRES IN DAYS</span>
            <input
              type="number"
              min={1}
              max={365}
              value={expiresInDays}
              onChange={(event) => {
                setExpiresInDays(event.target.value);
              }}
              placeholder="1–365, empty means no expiry"
            />
          </label>
          <label className="admin-field admin-field--wide">
            <span>DESCRIPTION</span>
            <input
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              maxLength={280}
              placeholder="What this agent is for"
            />
          </label>
        </div>
        {permissionLevel === 'destructive' && (
          <PanelNotice tone="info">
            Destructive credentials cannot act alone: revocation requests are queued for human
            approval.
          </PanelNotice>
        )}
        {formError !== null && <PanelNotice tone="error">{formError}</PanelNotice>}
        <button
          className="button button--primary button--compact"
          type="submit"
          disabled={creating}
        >
          {creating ? (
            <>
              <Loader2 size={13} className="admin-spin" /> Creating…
            </>
          ) : (
            <>
              <KeyRound size={13} /> Create AI credential
            </>
          )}
        </button>
      </form>

      {error !== null && <PanelNotice tone="error">{error}</PanelNotice>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">NAME</th>
              <th scope="col">AGENT</th>
              <th scope="col">PERMISSION</th>
              <th scope="col">TOKEN PREFIX</th>
              <th scope="col">CREATED</th>
              <th scope="col">LAST USED</th>
              <th scope="col">EXPIRES</th>
              <th scope="col">STATUS</th>
              <th scope="col">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((credential) => (
              <tr key={credential.id}>
                <td>
                  <strong>{credential.name}</strong>
                  {credential.description !== null && (
                    <span className="admin-cell-detail">{credential.description}</span>
                  )}
                </td>
                <td>
                  <span className="admin-mono">{credential.agentIdentity}</span>
                </td>
                <td>
                  <PermissionChip level={credential.permissionLevel} />
                </td>
                <td>
                  <span className="admin-mono">{credential.tokenPrefix}…</span>
                </td>
                <td>{formatTimestamp(credential.createdAt)}</td>
                <td>{formatTimestamp(credential.lastUsedAt)}</td>
                <td>{formatTimestamp(credential.expiresAt)}</td>
                <td>
                  <StatusChip credential={credential} />
                </td>
                <td>
                  {credential.revokedAt !== null ? (
                    <span className="admin-cell-detail">already revoked</span>
                  ) : pendingRevoke === credential.id ? (
                    <span className="admin-confirm">
                      <button
                        type="button"
                        className="button button--danger button--compact"
                        disabled={busyId === credential.id}
                        onClick={() => {
                          void revoke(credential.id);
                        }}
                      >
                        {busyId === credential.id ? (
                          <Loader2 size={13} className="admin-spin" />
                        ) : (
                          <ShieldAlert size={13} />
                        )}
                        Confirm revoke
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setPendingRevoke(null);
                        }}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : pendingRotate === credential.id ? (
                    <span className="admin-confirm">
                      <button
                        type="button"
                        className="button button--primary button--compact"
                        disabled={busyId === credential.id}
                        onClick={() => {
                          void rotate(credential.id);
                        }}
                      >
                        {busyId === credential.id ? (
                          <Loader2 size={13} className="admin-spin" />
                        ) : (
                          <RefreshCw size={13} />
                        )}
                        Confirm rotate
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setPendingRotate(null);
                        }}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="admin-row-actions">
                      <button
                        type="button"
                        className="button button--outline button--compact"
                        disabled={busyId === credential.id}
                        onClick={() => {
                          void toggleDisabled(credential);
                        }}
                      >
                        {busyId === credential.id ? (
                          <Loader2 size={13} className="admin-spin" />
                        ) : credential.disabledAt === null ? (
                          <CircleSlash size={13} />
                        ) : (
                          <BadgeCheck size={13} />
                        )}
                        {credential.disabledAt === null ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className="button button--outline button--compact"
                        onClick={() => {
                          setPendingRotate(credential.id);
                        }}
                      >
                        <RefreshCw size={13} /> Rotate
                      </button>
                      <button
                        type="button"
                        className="button button--outline button--compact"
                        onClick={() => {
                          setPendingRevoke(credential.id);
                        }}
                      >
                        <ShieldAlert size={13} /> Revoke
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && credentials.length === 0 && <LoadingRow label="Loading AI credentials…" />}
        {!loading && credentials.length === 0 && error === null && (
          <EmptyRow
            icon={Fingerprint}
            title="No AI credentials yet."
            detail="Create one to let an MCP client control DockPilot with scoped permissions."
          />
        )}
      </div>

      {nextCursor !== null && (
        <button
          type="button"
          className="button button--outline button--compact"
          disabled={loading}
          onClick={() => {
            void loadMore();
          }}
        >
          {loading ? <Loader2 size={13} className="admin-spin" /> : <Fingerprint size={13} />} Load
          more
        </button>
      )}
    </AdminPanel>
  );
}

function AdminStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

interface AuditFilterState {
  toolName: string;
  action: string;
  outcome: string;
  aiCredentialId: string;
  targetType: string;
  targetId: string;
  from: string;
  to: string;
}

const emptyFilters: AuditFilterState = {
  toolName: '',
  action: '',
  outcome: '',
  aiCredentialId: '',
  targetType: '',
  targetId: '',
  from: '',
  to: '',
};

function toIsoOrUndefined(value: string): string | undefined {
  if (value.trim() === '') return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function AuditLogPanel() {
  const [filters, setFilters] = useState<AuditFilterState>(emptyFilters);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [credentialOptions, setCredentialOptions] = useState<AiCredentialView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (activeFilters: AuditFilterState) => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchAuditEvents({
        limit: 25,
        ...(activeFilters.toolName.trim() === ''
          ? {}
          : { toolName: activeFilters.toolName.trim() }),
        ...(activeFilters.action.trim() === '' ? {} : { action: activeFilters.action.trim() }),
        ...(activeFilters.outcome === ''
          ? {}
          : { outcome: activeFilters.outcome as 'success' | 'failure' | 'denied' }),
        ...(activeFilters.aiCredentialId === ''
          ? {}
          : { aiCredentialId: activeFilters.aiCredentialId }),
        ...(activeFilters.targetType.trim() === ''
          ? {}
          : { targetType: activeFilters.targetType.trim() }),
        ...(activeFilters.targetId.trim() === ''
          ? {}
          : { targetId: activeFilters.targetId.trim() }),
        ...(toIsoOrUndefined(activeFilters.from) === undefined
          ? {}
          : { from: toIsoOrUndefined(activeFilters.from) }),
        ...(toIsoOrUndefined(activeFilters.to) === undefined
          ? {}
          : { to: toIsoOrUndefined(activeFilters.to) }),
      });
      setEvents(page.events);
      setNextCursor(page.nextCursor);
      setSelected(null);
    } catch (loadError) {
      setError(ErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(emptyFilters);
  }, [load]);

  useEffect(() => {
    const options = async (): Promise<void> => {
      try {
        const page = await fetchAiCredentials();
        setCredentialOptions(page.credentials);
      } catch {
        setCredentialOptions([]);
      }
    };
    void options();
  }, []);

  async function loadMore(): Promise<void> {
    if (nextCursor === null) return;
    setLoading(true);
    try {
      const page = await fetchAuditEvents({ limit: 25, cursor: nextCursor });
      setEvents((current) => [...current, ...page.events]);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      setError(ErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string): Promise<void> {
    setDetailLoading(true);
    setError(null);
    try {
      setSelected(await fetchAuditEvent(id));
    } catch (detailError) {
      setError(ErrorMessage(detailError));
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <AdminPanel>
      <PanelHeading
        eyebrow="AI CONTROL"
        title="AI activity log"
        description="Every MCP tool call is recorded, including denied, invalid and rate-limited attempts. Sensitive values are redacted before they are stored."
        icon={Activity}
        actions={
          <button
            type="button"
            className="button button--outline button--compact"
            onClick={() => {
              void load(filters);
            }}
            disabled={loading}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <div className="admin-filter-grid">
        <label className="admin-field">
          <span>AI CREDENTIAL</span>
          <select
            value={filters.aiCredentialId}
            onChange={(event) => {
              setFilters({ ...filters, aiCredentialId: event.target.value });
            }}
          >
            <option value="">All credentials</option>
            {credentialOptions.map((credential) => (
              <option key={credential.id} value={credential.id}>
                {credential.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span>STATUS</span>
          <select
            value={filters.outcome}
            onChange={(event) => {
              setFilters({ ...filters, outcome: event.target.value });
            }}
          >
            <option value="">All outcomes</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="denied">Denied</option>
          </select>
        </label>
        <label className="admin-field">
          <span>TOOL</span>
          <input
            list="audit-tool-names"
            value={filters.toolName}
            onChange={(event) => {
              setFilters({ ...filters, toolName: event.target.value });
            }}
            placeholder="e.g. dockpilot_list_users"
          />
          <datalist id="audit-tool-names">
            {mcpToolNames.map((tool) => (
              <option key={tool} value={tool} />
            ))}
          </datalist>
        </label>
        <label className="admin-field">
          <span>ACTION</span>
          <input
            value={filters.action}
            onChange={(event) => {
              setFilters({ ...filters, action: event.target.value });
            }}
            placeholder="e.g. mcp.health"
          />
        </label>
        <label className="admin-field">
          <span>TARGET TYPE</span>
          <input
            value={filters.targetType}
            onChange={(event) => {
              setFilters({ ...filters, targetType: event.target.value });
            }}
            placeholder="e.g. session"
          />
        </label>
        <label className="admin-field">
          <span>TARGET ID</span>
          <input
            value={filters.targetId}
            onChange={(event) => {
              setFilters({ ...filters, targetId: event.target.value });
            }}
            placeholder="resource identifier"
          />
        </label>
        <label className="admin-field">
          <span>FROM</span>
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(event) => {
              setFilters({ ...filters, from: event.target.value });
            }}
          />
        </label>
        <label className="admin-field">
          <span>TO</span>
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(event) => {
              setFilters({ ...filters, to: event.target.value });
            }}
          />
        </label>
      </div>
      <div className="admin-filter-actions">
        <button
          type="button"
          className="button button--primary button--compact"
          onClick={() => {
            void load(filters);
          }}
          disabled={loading}
        >
          Apply filters
        </button>
        <button
          type="button"
          className="button button--outline button--compact"
          onClick={() => {
            setFilters(emptyFilters);
            void load(emptyFilters);
          }}
        >
          Clear
        </button>
      </div>

      {error !== null && <PanelNotice tone="error">{error}</PanelNotice>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">TIME</th>
              <th scope="col">AI IDENTITY</th>
              <th scope="col">TOOL</th>
              <th scope="col">ACTION</th>
              <th scope="col">TARGET</th>
              <th scope="col">STATUS</th>
              <th scope="col">DURATION</th>
              <th scope="col">CORRELATION</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="admin-row"
                onClick={() => {
                  void openDetail(event.id);
                }}
              >
                <td>{formatTimestamp(event.occurredAt)}</td>
                <td>
                  <strong>{event.agentIdentity ?? 'human'}</strong>
                  {event.aiCredentialName !== null && (
                    <span className="admin-cell-detail">{event.aiCredentialName}</span>
                  )}
                </td>
                <td>
                  <span className="admin-mono">{event.toolName ?? '—'}</span>
                </td>
                <td>
                  <span className="admin-mono">{event.action}</span>
                </td>
                <td>
                  {event.targetType === null
                    ? '—'
                    : `${event.targetType}:${shortId(event.targetId)}`}
                </td>
                <td>
                  <OutcomeChip outcome={event.outcome} />
                  {event.approvalId !== null && <span className="admin-flag">APPROVAL</span>}
                </td>
                <td>{event.durationMs === null ? '—' : `${String(event.durationMs)} ms`}</td>
                <td>
                  <span className="admin-mono">{shortId(event.correlationId)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && events.length === 0 && <LoadingRow label="Loading the AI activity log…" />}
        {!loading && events.length === 0 && error === null && (
          <EmptyRow
            icon={Activity}
            title="No activity matches these filters."
            detail="MCP tool calls from AI credentials will appear here."
          />
        )}
      </div>

      {nextCursor !== null && (
        <button
          type="button"
          className="button button--outline button--compact"
          disabled={loading}
          onClick={() => {
            void loadMore();
          }}
        >
          {loading ? <Loader2 size={13} className="admin-spin" /> : <Activity size={13} />} Load
          older events
        </button>
      )}

      {detailLoading && <LoadingRow label="Loading audit event…" />}
      {selected !== null && (
        <AuditEventDetail
          event={selected}
          close={() => {
            setSelected(null);
          }}
        />
      )}
    </AdminPanel>
  );
}

function AuditEventDetail({ event, close }: { event: AuditEvent; close: () => void }) {
  return (
    <aside className="audit-detail" aria-label="Audit event detail">
      <header className="audit-detail-head">
        <div>
          <p className="panel-eyebrow">AUDIT EVENT</p>
          <h3>{event.action}</h3>
        </div>
        <button type="button" className="icon-button" aria-label="Close detail" onClick={close}>
          <X size={15} />
        </button>
      </header>
      <dl className="audit-detail-grid">
        <DetailTerm label="Event ID" value={event.id} />
        <DetailTerm label="Occurred" value={formatTimestamp(event.occurredAt)} />
        <DetailTerm label="Outcome" value={event.outcome} />
        <DetailTerm label="Error category" value={event.errorCategory ?? '—'} />
        <DetailTerm label="Tool" value={event.toolName ?? '—'} />
        <DetailTerm label="Permission used" value={event.permissionUsed ?? '—'} />
        <DetailTerm label="AI credential" value={shortId(event.aiCredentialId)} />
        <DetailTerm label="Agent identity" value={event.agentIdentity ?? '—'} />
        <DetailTerm label="Actor user" value={shortId(event.actorUserId)} />
        <DetailTerm label="Target" value={`${event.targetType ?? '—'}:${event.targetId ?? '—'}`} />
        <DetailTerm label="Approval" value={shortId(event.approvalId)} />
        <DetailTerm label="Correlation ID" value={event.correlationId ?? '—'} />
        <DetailTerm
          label="Duration"
          value={event.durationMs === null ? '—' : `${String(event.durationMs)} ms`}
        />
        <DetailTerm label="Source IP" value={event.sourceIp ?? '—'} />
        <DetailTerm label="User agent" value={event.userAgent ?? '—'} />
      </dl>
      <SummaryBlock title="Redacted input" value={event.inputSummary} />
      <SummaryBlock title="Redacted result" value={event.resultSummary} />
      <SummaryBlock title="Metadata" value={event.metadata} />
    </aside>
  );
}

function DetailTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="audit-term">
      <dt>{label.toUpperCase()}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SummaryBlock({ title, value }: { title: string; value: Record<string, unknown> | null }) {
  return (
    <section className="audit-summary">
      <p className="panel-eyebrow">{title.toUpperCase()}</p>
      <pre className="audit-json">{value === null ? '—' : JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}

function ApprovalsPanel() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approvals, setApprovals] = useState<ApprovalView[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const load = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchApprovals(status === '' ? undefined : status);
      setApprovals(page.approvals);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      setError(ErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load('pending');
  }, [load]);

  async function loadMore(): Promise<void> {
    if (nextCursor === null) return;
    setLoading(true);
    try {
      const page = await fetchApprovals(statusFilter === '' ? undefined : statusFilter, nextCursor);
      setApprovals((current) => [...current, ...page.approvals]);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      setError(ErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function decide(id: string, decision: 'approve' | 'reject'): Promise<void> {
    setBusyId(id);
    setError(null);
    try {
      await decideApproval(id, decision, note[id]);
      await load(statusFilter);
    } catch (decisionError) {
      setError(ErrorMessage(decisionError));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminPanel>
      <PanelHeading
        eyebrow="AI CONTROL"
        title="Approval inbox"
        description="Destructive AI requests are queued here. Nothing irreversible happens until an administrator approves it, and every decision is recorded."
        icon={ShieldAlert}
        actions={
          <label className="admin-field admin-field--inline">
            <span>STATUS</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                void load(event.target.value);
              }}
            >
              <option value="pending">Pending</option>
              <option value="executed">Executed</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
              <option value="">All</option>
            </select>
          </label>
        }
      />

      <PanelNotice tone="info">
        Approvals expire one hour after they are requested. Only session revocation and AI
        credential revocation can be executed.
      </PanelNotice>

      {error !== null && <PanelNotice tone="error">{error}</PanelNotice>}

      {loading && approvals.length === 0 && <LoadingRow label="Loading approvals…" />}
      {!loading && approvals.length === 0 && error === null && (
        <EmptyRow
          icon={BadgeCheck}
          title="Nothing waiting for you."
          detail="Destructive AI requests appear here for review."
        />
      )}

      <div className="approval-list">
        {approvals.map((approval) => (
          <article key={approval.id} className="approval-card">
            <header className="approval-card-head">
              <div>
                <p className="panel-eyebrow">DESTRUCTIVE REQUEST</p>
                <h3>{approval.actionType}</h3>
              </div>
              <span
                className={`state-chip state-chip--${approval.status === 'pending' ? 'amber' : approval.status === 'executed' ? 'green' : 'red'}`}
              >
                {approval.status.toUpperCase()}
              </span>
            </header>
            <div className="approval-meta">
              <span>
                <strong>Requested by</strong> {approval.requestedByCredentialName ?? 'unknown'}{' '}
                {approval.requestedByAgentIdentity === null
                  ? ''
                  : `(${approval.requestedByAgentIdentity})`}
              </span>
              <span>
                <strong>Tool</strong> <span className="admin-mono">{approval.toolName}</span>
              </span>
              <span>
                <strong>Target</strong>{' '}
                <span className="admin-mono">
                  {approval.targetType}:{approval.targetId}
                </span>
              </span>
              <span>
                <strong>Requested</strong> {formatTimestamp(approval.createdAt)}
              </span>
              <span>
                <strong>Expires</strong> {formatTimestamp(approval.expiresAt)}
              </span>
              {approval.decidedAt !== null && (
                <span>
                  <strong>Decided</strong> {formatTimestamp(approval.decidedAt)}
                </span>
              )}
            </div>
            {approval.justification !== null && (
              <blockquote className="approval-justification">{approval.justification}</blockquote>
            )}
            {approval.status === 'pending' ? (
              <div className="approval-actions">
                <input
                  className="approval-note"
                  value={note[approval.id] ?? ''}
                  onChange={(event) => {
                    setNote({ ...note, [approval.id]: event.target.value });
                  }}
                  maxLength={280}
                  placeholder="Optional decision note"
                  aria-label="Decision note"
                />
                <button
                  type="button"
                  className="button button--danger button--compact"
                  disabled={busyId === approval.id}
                  onClick={() => {
                    void decide(approval.id, 'approve');
                  }}
                  title="Executes the destructive action immediately"
                >
                  {busyId === approval.id ? (
                    <Loader2 size={13} className="admin-spin" />
                  ) : (
                    <ShieldAlert size={13} />
                  )}
                  Approve and execute
                </button>
                <button
                  type="button"
                  className="button button--outline button--compact"
                  disabled={busyId === approval.id}
                  onClick={() => {
                    void decide(approval.id, 'reject');
                  }}
                >
                  <X size={13} /> Reject
                </button>
              </div>
            ) : (
              <p className="admin-cell-detail">
                {approval.decisionNote === null || approval.decisionNote === ''
                  ? `Decided by an administrator.`
                  : `Note: ${approval.decisionNote}`}
              </p>
            )}
          </article>
        ))}
      </div>

      {nextCursor !== null && (
        <button
          type="button"
          className="button button--outline button--compact"
          disabled={loading}
          onClick={() => {
            void loadMore();
          }}
        >
          {loading ? <Loader2 size={13} className="admin-spin" /> : <Bot size={13} />} Load more
        </button>
      )}
    </AdminPanel>
  );
}
