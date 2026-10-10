import { useCallback, useEffect, useState, type ReactNode, type SyntheticEvent } from 'react';
import {
  Boxes,
  Loader2,
  Play,
  RefreshCw,
  RotateCw,
  Server,
  ShieldCheck,
  Square,
  Trash2,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ContainerView, HostView, SafeUser } from '@dockpilot/shared';
import {
  ApiError,
  createHost,
  disableHost,
  enableHost,
  fetchContainerLogs,
  fetchContainers,
  fetchHosts,
  refreshHost,
  requestContainerRemoval,
  requestHostRemoval,
  restartContainer,
  startContainer,
  stopContainer,
  syncHost,
} from '../lib/api.js';

export type DockerSection = 'hosts' | 'containers';

type LoadState = 'loading' | 'ready' | 'error';

function isOperator(user: SafeUser): boolean {
  return user.role === 'operator' || user.role === 'admin' || user.role === 'owner';
}

function isManager(user: SafeUser): boolean {
  return user.role === 'admin' || user.role === 'owner';
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'The request could not be completed.';
}

export function DockerControl({
  section,
  user,
  selectedHostId,
  onSelectHost,
  onNavigate,
  notify,
}: {
  section: DockerSection;
  user: SafeUser;
  selectedHostId: string | null;
  onSelectHost: (hostId: string | null) => void;
  onNavigate: (section: DockerSection) => void;
  notify: (message: string) => void;
}) {
  return (
    <section className="admin-panel">
      {section === 'hosts' ? (
        <HostsPanel
          user={user}
          selectedHostId={selectedHostId}
          onSelectHost={(hostId) => {
            onSelectHost(hostId);
            onNavigate('containers');
          }}
          notify={notify}
        />
      ) : (
        <ContainersPanel
          user={user}
          selectedHostId={selectedHostId}
          onSelectHost={onSelectHost}
          notify={notify}
        />
      )}
    </section>
  );
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

function HostStatusChip({ status }: { status: HostView['status'] }) {
  const chip =
    status === 'healthy'
      ? 'state-chip state-chip--green'
      : status === 'error'
        ? 'state-chip state-chip--red'
        : 'state-chip state-chip--amber';
  return <span className={chip}>{status.toUpperCase()}</span>;
}

function ContainerStateChip({ state }: { state: ContainerView['state'] }) {
  const chip = state === 'running' ? 'state-chip state-chip--green' : 'state-chip';
  return <span className={chip}>{state.toUpperCase()}</span>;
}

function formatTimestamp(value: string | null): string {
  if (value === null) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString();
}

function HostsPanel({
  user,
  selectedHostId,
  onSelectHost,
  notify,
}: {
  user: SafeUser;
  selectedHostId: string | null;
  onSelectHost: (hostId: string | null) => void;
  notify: (message: string) => void;
}) {
  const [hosts, setHosts] = useState<HostView[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [busyHostId, setBusyHostId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('unix:///var/run/docker.sock');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const canManage = isManager(user);
  const canOperate = isOperator(user);

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const page = await fetchHosts();
      setHosts(page.hosts);
      setState('ready');
    } catch (caught) {
      setError(errorMessage(caught));
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createHost({
        name,
        endpoint,
        ...(description.trim() === '' ? {} : { description }),
      });
      setHostToken(created.token);
      setName('');
      setDescription('');
      setShowForm(false);
      notify(`Registered host ${created.host.name}.`);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function runHostAction(
    hostId: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<void> {
    setBusyHostId(hostId);
    setError(null);
    try {
      await action();
      notify(successMessage);
      await load();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyHostId(null);
    }
  }

  async function requestRemoval(host: HostView) {
    const justification = window.prompt(
      `Requesting removal of "${host.name}". Provide a justification:`,
    );
    if (justification === null || justification.trim().length < 4) return;
    await runHostAction(
      host.id,
      () => requestHostRemoval(host.id, justification.trim()),
      'Removal request submitted for administrator approval.',
    );
  }

  return (
    <>
      <PanelHeading
        eyebrow="INFRASTRUCTURE"
        title="Docker hosts"
        description="Register Docker hosts, check connectivity, and reconcile their containers. Removal requires administrator approval."
        icon={Server}
        actions={
          canManage ? (
            <button
              type="button"
              className="button button--primary button--compact"
              onClick={() => {
                setShowForm((value) => !value);
              }}
            >
              <Server size={13} /> {showForm ? 'Cancel' : 'Register host'}
            </button>
          ) : undefined
        }
      />
      {error !== null && <PanelNotice tone="error">{error}</PanelNotice>}
      {hostToken !== null && (
        <PanelNotice tone="info">
          Host credential (shown once): <code className="admin-mono">{hostToken}</code>
        </PanelNotice>
      )}
      {showForm && canManage && (
        <form className="admin-form" onSubmit={(event) => void submit(event)} noValidate>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span className="field-label-row">NAME</span>
              <input
                className="text-input-plain"
                value={name}
                maxLength={80}
                required
                placeholder="e.g. homelab-node-1"
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="field-label-row">ENDPOINT</span>
              <input
                className="admin-mono"
                value={endpoint}
                maxLength={255}
                required
                onChange={(event) => {
                  setEndpoint(event.target.value);
                }}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="field-label-row">DESCRIPTION (OPTIONAL)</span>
              <input
                className="text-input-plain"
                value={description}
                maxLength={280}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </label>
          </div>
          <button
            className="button button--primary button--compact"
            disabled={submitting}
            type="submit"
          >
            {submitting ? <Loader2 size={13} className="admin-spin" /> : <Server size={13} />}{' '}
            Register
          </button>
        </form>
      )}
      {state === 'loading' ? (
        <div className="admin-loading" aria-busy="true">
          <Loader2 size={15} className="admin-spin" /> Loading hosts
        </div>
      ) : hosts.length === 0 ? (
        <div className="quiet-empty">
          <span className="quiet-empty-icon">
            <Server size={17} />
          </span>
          <span>
            <strong>No Docker hosts registered.</strong>
            <span>Register a host to sync and operate its containers.</span>
          </span>
          <span className="empty-line" />
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Docker</th>
                <th>Last seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hosts.map((host) => (
                <tr key={host.id} className={host.id === selectedHostId ? 'admin-row--active' : ''}>
                  <td>
                    <strong>{host.name}</strong>
                    {host.description !== null && (
                      <span className="admin-cell-detail">{host.description}</span>
                    )}
                    {host.lastError !== null && (
                      <span className="admin-cell-detail admin-cell-detail--error">
                        {host.lastError}
                      </span>
                    )}
                  </td>
                  <td className="admin-mono">{host.endpoint}</td>
                  <td>
                    <HostStatusChip status={host.status} />
                  </td>
                  <td className="admin-mono">{host.dockerVersion ?? '—'}</td>
                  <td>{formatTimestamp(host.lastSeenAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="button button--outline button--compact"
                        onClick={() => {
                          onSelectHost(host.id);
                        }}
                      >
                        <Boxes size={13} /> Containers
                      </button>
                      {canOperate && (
                        <>
                          <button
                            type="button"
                            className="button button--outline button--compact"
                            disabled={busyHostId === host.id}
                            onClick={() =>
                              void runHostAction(
                                host.id,
                                () => refreshHost(host.id),
                                `Refreshed ${host.name}.`,
                              )
                            }
                          >
                            <RefreshCw size={13} /> Refresh
                          </button>
                          <button
                            type="button"
                            className="button button--outline button--compact"
                            disabled={busyHostId === host.id}
                            onClick={() =>
                              void runHostAction(
                                host.id,
                                () => syncHost(host.id),
                                `Synced containers for ${host.name}.`,
                              )
                            }
                          >
                            <RotateCw size={13} /> Sync
                          </button>
                        </>
                      )}
                      {canManage && (
                        <>
                          <button
                            type="button"
                            className="button button--outline button--compact"
                            disabled={busyHostId === host.id}
                            onClick={() =>
                              void runHostAction(
                                host.id,
                                () =>
                                  host.status === 'disabled'
                                    ? enableHost(host.id)
                                    : disableHost(host.id),
                                host.status === 'disabled'
                                  ? `Enabled ${host.name}.`
                                  : `Disabled ${host.name}.`,
                              )
                            }
                          >
                            {host.status === 'disabled' ? 'Enable' : 'Disable'}
                          </button>
                          <button
                            type="button"
                            className="button button--danger button--compact"
                            disabled={busyHostId === host.id}
                            onClick={() => void requestRemoval(host)}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ContainersPanel({
  user,
  selectedHostId,
  onSelectHost,
  notify,
}: {
  user: SafeUser;
  selectedHostId: string | null;
  onSelectHost: (hostId: string | null) => void;
  notify: (message: string) => void;
}) {
  const [hosts, setHosts] = useState<HostView[]>([]);
  const [containers, setContainers] = useState<ContainerView[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [logContainer, setLogContainer] = useState<ContainerView | null>(null);
  const [logText, setLogText] = useState<string | null>(null);
  const [logLoading, setLogLoading] = useState(false);
  const canOperate = isOperator(user);
  const canRemove = isManager(user);

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const page = await fetchHosts();
      setHosts(page.hosts);
      const target = selectedHostId ?? page.hosts[0]?.id ?? null;
      if (target !== null && target !== selectedHostId) onSelectHost(target);
      if (target === null) {
        setContainers([]);
      } else {
        const containerPage = await fetchContainers(target);
        setContainers(containerPage.containers);
      }
      setState('ready');
    } catch (caught) {
      setError(errorMessage(caught));
      setState('error');
    }
  }, [selectedHostId, onSelectHost]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(
    container: ContainerView,
    action: () => Promise<unknown>,
    message: string,
  ): Promise<void> {
    setBusyId(container.containerId);
    setError(null);
    try {
      await action();
      notify(message);
      if (selectedHostId !== null) {
        const page = await fetchContainers(selectedHostId);
        setContainers(page.containers);
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyId(null);
    }
  }

  async function openLogs(container: ContainerView) {
    setLogContainer(container);
    setLogText(null);
    setLogLoading(true);
    try {
      const log = await fetchContainerLogs(container.containerId, 200);
      setLogText(log.log.length === 0 ? '(no log output)' : log.log);
    } catch (caught) {
      setLogText(`Unable to load logs: ${errorMessage(caught)}`);
    } finally {
      setLogLoading(false);
    }
  }

  async function requestRemoval(container: ContainerView) {
    const label = container.name ?? container.containerId;
    const justification = window.prompt(
      `Requesting removal of "${label}". Provide a justification:`,
    );
    if (justification === null || justification.trim().length < 4) return;
    await runAction(
      container,
      () => requestContainerRemoval(container.containerId, justification.trim()),
      'Removal request submitted for administrator approval.',
    );
  }

  return (
    <>
      <PanelHeading
        eyebrow="RESOURCES"
        title="Containers"
        description="Browse containers known for a host and start, stop, restart or view logs. Removal requires administrator approval."
        icon={Boxes}
        actions={
          <select
            className="admin-select"
            value={selectedHostId ?? ''}
            onChange={(event) => {
              onSelectHost(event.target.value === '' ? null : event.target.value);
            }}
            aria-label="Select host"
          >
            {hosts.length === 0 && <option value="">No hosts</option>}
            {hosts.map((host) => (
              <option key={host.id} value={host.id}>
                {host.name}
              </option>
            ))}
          </select>
        }
      />
      {error !== null && <PanelNotice tone="error">{error}</PanelNotice>}
      {hosts.length === 0 && state === 'ready' && (
        <div className="quiet-empty">
          <span className="quiet-empty-icon">
            <Server size={17} />
          </span>
          <span>
            <strong>No Docker hosts registered.</strong>
            <span>Register a host on the Hosts screen first.</span>
          </span>
          <span className="empty-line" />
        </div>
      )}
      {state === 'loading' ? (
        <div className="admin-loading" aria-busy="true">
          <Loader2 size={15} className="admin-spin" /> Loading containers
        </div>
      ) : containers.length === 0 && hosts.length > 0 ? (
        <div className="quiet-empty">
          <span className="quiet-empty-icon">
            <Boxes size={17} />
          </span>
          <span>
            <strong>No containers synced.</strong>
            <span>Run a sync on the host to pull its container list.</span>
          </span>
          <span className="empty-line" />
        </div>
      ) : (
        containers.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr key={container.id}>
                    <td>
                      <strong>{container.name ?? container.shortId ?? '—'}</strong>
                      <span className="admin-cell-detail admin-mono">
                        {container.shortId ?? ''}
                      </span>
                    </td>
                    <td className="admin-mono">{container.image}</td>
                    <td>
                      <ContainerStateChip state={container.state} />
                    </td>
                    <td>{container.status}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="button button--outline button--compact"
                          onClick={() => void openLogs(container)}
                        >
                          Logs
                        </button>
                        {canOperate && (
                          <>
                            <button
                              type="button"
                              className="button button--outline button--compact"
                              disabled={busyId === container.containerId}
                              onClick={() =>
                                void runAction(
                                  container,
                                  () => startContainer(container.containerId),
                                  'Container started.',
                                )
                              }
                            >
                              <Play size={13} /> Start
                            </button>
                            <button
                              type="button"
                              className="button button--outline button--compact"
                              disabled={busyId === container.containerId}
                              onClick={() =>
                                void runAction(
                                  container,
                                  () => stopContainer(container.containerId),
                                  'Container stopped.',
                                )
                              }
                            >
                              <Square size={13} /> Stop
                            </button>
                            <button
                              type="button"
                              className="button button--outline button--compact"
                              disabled={busyId === container.containerId}
                              onClick={() =>
                                void runAction(
                                  container,
                                  () => restartContainer(container.containerId),
                                  'Container restarted.',
                                )
                              }
                            >
                              <RotateCw size={13} /> Restart
                            </button>
                          </>
                        )}
                        {canRemove && (
                          <button
                            type="button"
                            className="button button--danger button--compact"
                            disabled={busyId === container.containerId}
                            onClick={() => void requestRemoval(container)}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {logContainer !== null && (
        <div className="log-panel">
          <div className="log-panel-header">
            <strong>{logContainer.name ?? logContainer.containerId}</strong>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setLogContainer(null);
                setLogText(null);
              }}
            >
              Close
            </button>
          </div>
          {logLoading ? (
            <div className="admin-loading" aria-busy="true">
              <Loader2 size={15} className="admin-spin" /> Loading logs
            </div>
          ) : (
            <pre className="log-view">{logText}</pre>
          )}
        </div>
      )}
    </>
  );
}
