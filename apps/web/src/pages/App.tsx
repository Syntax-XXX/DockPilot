import { useCallback, useEffect, useState, type SyntheticEvent } from 'react';
import {
  Activity,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  Command,
  Container,
  Database,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  LogOut,
  Network,
  Radio,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShipWheel,
  Sparkles,
  Terminal,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import {
  createFirstOwner,
  fetchApiHealth,
  fetchSession,
  fetchSetupStatus,
  logIn,
  logOut,
  ApiError,
} from '../lib/api.js';
import { AdminControl, isAdministrator, type AdminSection } from './AdminControl.js';
import type { SafeUser } from '@dockpilot/shared';

type LoadState = 'loading' | 'ready' | 'error';
type ConsoleSection = 'overview' | AdminSection;
type ServerStatus = 'checking' | 'online' | 'offline';
type AuthMode = 'setup' | 'login';

export default function App() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('setup');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const refreshServerStatus = useCallback(async () => {
    try {
      await fetchApiHealth();
      setServerStatus('online');
    } catch {
      setServerStatus('offline');
    }
  }, []);

  const initialize = useCallback(async () => {
    setLoadState('loading');
    setGlobalError(null);
    try {
      const [setupRequired, session] = await Promise.all([fetchSetupStatus(), fetchSession()]);
      await refreshServerStatus();
      setUser(session);
      setAuthMode(setupRequired ? 'setup' : 'login');
      setLoadState('ready');
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : 'The DockPilot API could not be reached.',
      );
      setServerStatus('offline');
      setLoadState('error');
    }
  }, [refreshServerStatus]);

  useEffect(() => {
    void initialize();
    const interval = window.setInterval(() => void refreshServerStatus(), 30_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [initialize, refreshServerStatus]);

  if (loadState === 'loading') {
    return <LoadingScreen />;
  }

  if (loadState === 'error') {
    return (
      <ConnectionError
        message={globalError ?? 'The DockPilot API could not be reached.'}
        retry={() => {
          void initialize();
        }}
      />
    );
  }

  if (!user) {
    return (
      <AuthenticationScreen
        initialMode={authMode}
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthMode('login');
        }}
        setGlobalError={setGlobalError}
        globalError={globalError}
        serverStatus={serverStatus}
        initialize={initialize}
      />
    );
  }

  return (
    <OperatorConsole
      user={user}
      serverStatus={serverStatus}
      onLogout={async () => {
        try {
          await logOut();
          setUser(null);
          await initialize();
        } catch (error) {
          setGlobalError(error instanceof Error ? error.message : 'Could not sign out.');
        }
      }}
      globalError={globalError}
      clearGlobalError={() => {
        setGlobalError(null);
      }}
    />
  );
}

function ProductMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand-lockup${small ? ' brand-lockup--small' : ''}`}>
      <span className="brand-symbol" aria-hidden="true">
        <ShipWheel size={small ? 18 : 22} strokeWidth={2.25} />
      </span>
      <span className="brand-name">
        dock<span>pilot</span>
        <span className="brand-dot">.</span>
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: ServerStatus }) {
  const label =
    status === 'online'
      ? 'API connected'
      : status === 'offline'
        ? 'API disconnected'
        : 'Checking API';
  return (
    <span className={`connection-state connection-state--${status}`}>
      <span className="connection-dot" />
      {label}
    </span>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen" aria-label="Loading DockPilot" aria-busy="true">
      <ProductMark />
      <div className="loading-track">
        <span />
      </div>
      <p>
        Establishing a secure connection<span className="loading-ellipsis">...</span>
      </p>
    </main>
  );
}

function ConnectionError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <main className="loading-screen">
      <ProductMark />
      <div className="error-dialog" role="alert">
        <span className="alert-icon alert-icon--red">
          <TriangleAlert size={20} />
        </span>
        <p className="eyebrow eyebrow--red">CONNECTION INTERRUPTED</p>
        <h1>Can’t reach DockPilot.</h1>
        <p className="body-muted">{message}</p>
        <p className="help-copy">
          <Terminal size={14} /> Make sure the API and PostgreSQL are running. See{' '}
          <code>README.md</code>.
        </p>
        <button className="button button--primary button--full" onClick={retry}>
          Retry connection <ArrowRight size={15} />
        </button>
      </div>
      <footer className="loading-footer">
        DOCKPILOT <span>·</span> SELF-HOSTED DOCKER CONTROL
      </footer>
    </main>
  );
}

function AuthenticationScreen({
  initialMode,
  onAuthenticated,
  setGlobalError,
  globalError,
  serverStatus,
  initialize,
}: {
  initialMode: AuthMode;
  onAuthenticated: (user: SafeUser) => void;
  setGlobalError: (error: string | null) => void;
  globalError: string | null;
  serverStatus: ServerStatus;
  initialize: () => Promise<void>;
}) {
  const mode = initialMode;
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setGlobalError(null);
    try {
      const authenticatedUser =
        mode === 'setup'
          ? await createFirstOwner({ email, password, name, organizationName })
          : await logIn({ email, password });
      setPassword('');
      onAuthenticated(authenticatedUser);
    } catch (error) {
      setGlobalError(
        error instanceof ApiError
          ? error.message
          : 'The request could not be completed. Check that the API is running.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-left">
        <header className="auth-header">
          <ProductMark />
          <span className="header-caption">INFRASTRUCTURE, IN FOCUS</span>
        </header>
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            YOUR INFRASTRUCTURE, DECODED
          </p>
          <h1>
            Stop guessing.
            <br />
            <span>Start knowing.</span>
          </h1>
          <p className="hero-description">
            One clear view of every container, host and issue. Operate your Docker infrastructure
            with confidence.
          </p>
          <div className="feature-stack">
            <FeatureLine
              icon={Fingerprint}
              title="Know what’s happening"
              detail="Every host. Every container. One clear picture."
            />
            <FeatureLine
              icon={ShieldCheck}
              title="Catch trouble early"
              detail="Security, reliability and health at a glance."
            />
            <FeatureLine
              icon={Activity}
              title="Act with confidence"
              detail="See what will change before it happens."
            />
          </div>
        </div>
        <footer className="auth-left-footer">
          <span>DOCKER, WITHOUT THE GUESSING.</span>
          <span>BUILT TO SELF-HOST. OPEN SOURCE BY DESIGN.</span>
        </footer>
      </div>
      <div className="auth-right">
        <span className="auth-corner auth-corner--top" />
        <span className="auth-corner auth-corner--bottom" />
        <div className="auth-card-wrap">
          <div className="auth-mobile-brand">
            <ProductMark />
          </div>
          <div className="auth-card-top">
            <p className="eyebrow eyebrow--muted">
              {mode === 'setup' ? 'YOUR PRIVATE INFRASTRUCTURE' : 'WELCOME BACK'}
            </p>
            <div className="auth-api-indicator">
              <StatusDot status={serverStatus} />
            </div>
          </div>
          <div className="auth-card-heading">
            <h2>{mode === 'setup' ? 'Make yourself at home.' : 'Good to have you back.'}</h2>
            <p>
              {mode === 'setup'
                ? 'Create your owner account to get started. Your instance is yours, and yours alone.'
                : 'Sign in to see what’s happening across your infrastructure.'}
            </p>
          </div>
          {mode === 'setup' && (
            <div className="secure-callout">
              <span className="secure-icon">
                <LockKeyhole size={16} />
              </span>
              <p>
                <strong>Your account, your control.</strong>
                <br />
                Your password is never shared with Docker hosts.
              </p>
              <span className="owner-badge">OWNER ONLY</span>
            </div>
          )}
          {globalError && (
            <div className="form-error" role="alert">
              <TriangleAlert size={15} />
              <span>{globalError}</span>
            </div>
          )}
          <form
            className="auth-form"
            onSubmit={(event) => {
              void submit(event);
            }}
            noValidate
          >
            {mode === 'setup' && (
              <>
                <FormField
                  id="full-name"
                  label="YOUR NAME"
                  value={name}
                  setValue={setName}
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  maxLength={80}
                  required
                />
                <FormField
                  id="organization-name"
                  label="ORGANIZATION"
                  value={organizationName}
                  setValue={setOrganizationName}
                  placeholder="e.g. Homelab"
                  autoComplete="organization"
                  maxLength={100}
                  required
                />
              </>
            )}
            <FormField
              id="email"
              label="EMAIL ADDRESS"
              type="email"
              value={email}
              setValue={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              required
            />
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="password">
                  {mode === 'setup' ? 'CREATE PASSWORD' : 'PASSWORD'}
                </label>
                {mode === 'setup' && <span className="field-hint">12 CHARACTERS MINIMUM</span>}
              </div>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'setup' ? 12 : 1}
                  maxLength={128}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  placeholder={mode === 'setup' ? 'At least 12 characters' : 'Enter your password'}
                  aria-label="Password"
                />
                <button
                  className="password-visibility"
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'setup' && (
                <span className="field-footnote">
                  <ShieldCheck size={13} /> Encrypted and stored on your own server.
                </span>
              )}
            </div>
            <button
              className="button button--primary button--submit"
              type="submit"
              disabled={busy || (mode === 'setup' && password.length < 12)}
            >
              {busy ? (
                <>
                  <span className="button-spinner" />
                  {mode === 'setup' ? 'Securing your account...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {mode === 'setup' ? 'Create owner account' : 'Sign in'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          {mode === 'login' && (
            <p className="forgot-copy">
              Forgot your password? Password recovery is not available in this milestone. Contact
              your instance administrator.
            </p>
          )}
          <div className="auth-divider">
            <span />
            {mode === 'setup' ? 'ONE SECURE SETUP' : 'PRIVATE BY DESIGN'}
            <span />
          </div>
          <p className="auth-terms">
            By continuing, you agree to operate your Docker infrastructure responsibly.{' '}
            <Shield size={12} /> No data leaves your server.
          </p>
          {mode === 'login' && (
            <button
              className="text-button"
              onClick={() => {
                void initialize();
              }}
              type="button"
            >
              Refresh setup status
            </button>
          )}
        </div>
        <footer className="auth-right-footer">
          <span>
            <span className="footer-status-dot" /> SELF-HOSTED & PRIVATE
          </span>
          <span>
            <Command size={12} /> DOCKPILOT<span className="brand-dot">.</span>{' '}
            <span className="version-chip">0.1.0</span>
          </span>
        </footer>
      </div>
    </main>
  );
}

function FeatureLine({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="feature-line">
      <span className="feature-icon">
        <Icon size={17} strokeWidth={1.8} />
      </span>
      <span className="feature-text">
        <strong>{title}</strong>
        <span>{detail}</span>
      </span>
      <Check className="feature-check" size={15} />
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  setValue,
  placeholder,
  type = 'text',
  autoComplete,
  maxLength,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete: string;
  maxLength: number;
  required?: boolean;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

function OperatorConsole({
  user,
  serverStatus,
  onLogout,
  globalError,
  clearGlobalError,
}: {
  user: SafeUser;
  serverStatus: ServerStatus;
  onLogout: () => void | Promise<void>;
  globalError: string | null;
  clearGlobalError: () => void;
}) {
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [section, setSection] = useState<ConsoleSection>('overview');
  const administrator = isAdministrator(user);
  async function doLogout() {
    setLogoutBusy(true);
    await onLogout();
    setLogoutBusy(false);
  }

  return (
    <div className="console-shell">
      <aside className="sidebar">
        <header className="sidebar-brand">
          <ProductMark small />
          <button className="host-selector" aria-label="Host selector: all hosts">
            <span className="host-selector-icon">
              <Server size={15} />
            </span>
            <span className="host-selector-copy">
              <span>INFRASTRUCTURE</span>
              <strong>All hosts</strong>
            </span>
            <ChevronDown size={14} className="host-chevron" />
          </button>
        </header>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-section-label">WORKSPACE</span>
          <SectionNavItem
            icon={Activity}
            title="Overview"
            active={section === 'overview'}
            onSelect={() => {
              setSection('overview');
            }}
          />
          <span className="nav-section-label nav-section-label--spaced">RESOURCES</span>
          <NavItem icon={Server} title="Hosts" />
          <NavItem icon={Container} title="Containers" />
          <NavItem icon={Box} title="Images" />
          <NavItem icon={Database} title="Volumes" />
          <NavItem icon={Network} title="Networks" />
          <div className="sidebar-nav-divider" />
          <span className="nav-section-label nav-section-label--spaced">INTELLIGENCE</span>
          <NavItem icon={Sparkles} title="Docker Doctor" badge="SOON" />
          <NavItem icon={ShieldCheck} title="Backups" badge="SOON" />
          <NavItem icon={Activity} title="Alerts" />
          {administrator && (
            <>
              <div className="sidebar-nav-divider" />
              <span className="nav-section-label nav-section-label--spaced">AI CONTROL</span>
              <SectionNavItem
                icon={KeyRound}
                title="AI credentials"
                active={section === 'ai-credentials'}
                onSelect={() => {
                  setSection('ai-credentials');
                }}
              />
              <SectionNavItem
                icon={Activity}
                title="AI activity"
                active={section === 'audit-log'}
                onSelect={() => {
                  setSection('audit-log');
                }}
              />
              <SectionNavItem
                icon={ShieldAlert}
                title="Approvals"
                active={section === 'approvals'}
                onSelect={() => {
                  setSection('approvals');
                }}
              />
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="agent-empty">
            <span className="agent-empty-icon">
              <Radio size={15} />
            </span>
            <span>
              <strong>No agents online</strong>
              <span>Connect a host to get started</span>
            </span>
            <span className="agent-connector-dot" />
          </div>
          <button
            className="sidebar-user"
            onClick={() => {
              void doLogout();
            }}
            disabled={logoutBusy}
            aria-label={`Sign out ${user.name}`}
          >
            <span className="avatar">{user.name.trim().charAt(0).toUpperCase()}</span>
            <span className="sidebar-user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </span>
            <LogOut size={15} className="logout-icon" />
          </button>
        </div>
      </aside>
      <main className="main-panel" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{sectionTitle(section)}</strong>
          </div>
          <div className="topbar-right">
            <StatusDot status={serverStatus} />
            <span className="topbar-divider" />
            <span className="role-chip">
              <Shield size={12} /> {user.role.toUpperCase()}
            </span>
            <button
              className="icon-button user-menu-button"
              onClick={() => {
                void doLogout();
              }}
              disabled={logoutBusy}
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          {globalError && (
            <button className="console-error-banner" onClick={clearGlobalError} role="alert">
              <TriangleAlert size={15} /> {globalError} <span>×</span>
            </button>
          )}
          {section === 'overview' ? (
            <>
              <section className="page-heading">
                <div>
                  <div className="date-label">
                    <span className="live-dot" /> YOUR INFRASTRUCTURE{' '}
                    <span className="date-separator">/</span>{' '}
                    <span className="date-local">
                      {new Date()
                        .toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })
                        .toUpperCase()}
                    </span>
                  </div>
                  <h1>
                    Good {greeting()}, {user.name.split(' ')[0]}
                    <span className="heading-period">.</span>
                  </h1>
                  <p>Here’s the view from your command center.</p>
                </div>
                <button
                  className="button button--outline"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <Activity size={14} /> Refresh overview
                </button>
              </section>
              <div className="stats-grid">
                <StatCard
                  icon={Server}
                  label="CONNECTED HOSTS"
                  value="—"
                  sub="Connect an agent to begin"
                  accent="blue"
                />
                <StatCard
                  icon={Container}
                  label="RUNNING CONTAINERS"
                  value="—"
                  sub="No container data yet"
                  accent="green"
                />
                <StatCard
                  icon={TriangleAlert}
                  label="NEEDS ATTENTION"
                  value="—"
                  sub="Awaiting host connection"
                  accent="amber"
                />
                <StatCard
                  icon={ShieldCheck}
                  label="SECURITY SCORE"
                  value="—"
                  sub="Docker Doctor · awaiting data"
                  accent="purple"
                />
              </div>
              <section className="connect-card">
                <div className="connect-card-left">
                  <div className="connect-label">
                    <span className="terminal-green">
                      <Terminal size={13} />
                    </span>
                    GETTING STARTED<span className="connect-underscore">_</span>
                  </div>
                  <h2>Nothing to see. Yet.</h2>
                  <p>
                    DockPilot is connected and ready. Add an agent to a Docker host to bring your
                    infrastructure into focus. Real container and server data will show up here as
                    soon as a host checks in.
                  </p>
                  <button
                    className="button button--connect"
                    disabled
                    title="Agent enrollment is being built in milestone 2"
                  >
                    Connect a Docker host <ArrowRight size={15} />
                  </button>
                  <span className="connect-preflight">
                    <Shield size={12} /> Host credentials stay on your own server.
                  </span>
                </div>
                <div className="connect-art" aria-hidden="true">
                  <div className="orbit orbit--outer" />
                  <div className="orbit orbit--inner" />
                  <div className="orbit-center">
                    <ShipWheel size={31} strokeWidth={1.5} />
                  </div>
                  <span className="orbit-terminal">
                    <Terminal size={12} />
                  </span>
                  <span className="orbit-container">
                    <Container size={12} />
                  </span>
                  <span className="orbit-shield">
                    <ShieldCheck size={12} />
                  </span>
                  <span className="orbit-server">
                    <Server size={12} />
                  </span>
                  <span className="orbit-satellite" />
                </div>
              </section>
              <div className="lower-grid">
                <section className="panel panel--activity">
                  <div className="panel-header">
                    <div>
                      <p className="panel-eyebrow">WHAT’S HAPPENING</p>
                      <h3>Recent activity</h3>
                    </div>
                    <span className="panel-icon">
                      <Activity size={16} />
                    </span>
                  </div>
                  <div className="quiet-empty">
                    <span className="quiet-empty-icon">
                      <Activity size={17} />
                    </span>
                    <span>
                      <strong>The log is quiet.</strong>
                      <span>Host and container events will appear here.</span>
                    </span>
                    <span className="empty-line" />
                  </div>
                </section>
                <section className="panel panel--health">
                  <div className="panel-header">
                    <div>
                      <p className="panel-eyebrow">SYSTEM STATUS</p>
                      <h3>System health</h3>
                    </div>
                    <span className="panel-icon panel-icon--green">
                      <ShieldCheck size={16} />
                    </span>
                  </div>
                  <div className="health-row">
                    <span className="health-indicator health-indicator--green" />
                    <span className="health-row-label">DockPilot API</span>
                    <span className={`health-status health-status--${serverStatus}`}>
                      {serverStatus === 'online'
                        ? 'Connected'
                        : serverStatus === 'offline'
                          ? 'Disconnected'
                          : 'Checking'}
                    </span>
                    <Check
                      size={14}
                      className={`health-check ${serverStatus !== 'online' ? 'health-check--hidden' : ''}`}
                    />
                  </div>
                  <div className="health-row">
                    <span className="health-indicator health-indicator--blue" />
                    <span className="health-row-label">Authentication</span>
                    <span className="health-status health-status--green">Secured</span>
                    <Fingerprint size={15} className="health-check" />
                  </div>
                  <div className="health-row">
                    <span className="health-indicator health-indicator--amber" />
                    <span className="health-row-label">Host agents</span>
                    <span className="health-status health-status--muted">Not connected</span>
                    <Radio size={14} className="health-check health-check--muted" />
                  </div>
                  <div className="health-footer">
                    <ShieldCheck size={13} /> Your account and session are protected.
                  </div>
                </section>
              </div>
              <footer className="dashboard-footer">
                <span>
                  DOCKPILOT<span className="brand-dot">.</span>{' '}
                  <span className="dashboard-footer-light">DOCKER, WITHOUT THE GUESSING.</span>
                </span>
                <span>
                  <span className="live-dot" /> API{' '}
                  {serverStatus === 'online'
                    ? 'CONNECTED'
                    : serverStatus === 'offline'
                      ? 'OFFLINE'
                      : 'CONNECTING'}{' '}
                  <span className="date-separator">/</span> DEVELOPMENT PREVIEW
                </span>
              </footer>
            </>
          ) : (
            <AdminControl section={section} user={user} />
          )}
        </div>
      </main>
    </div>
  );
}

function sectionTitle(section: ConsoleSection): string {
  if (section === 'ai-credentials') return 'AI credentials';
  if (section === 'audit-log') return 'AI activity';
  if (section === 'approvals') return 'Approvals';
  return 'Overview';
}

function SectionNavItem({
  icon: Icon,
  title,
  active,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`nav-item nav-item--button${active ? ' nav-item--active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
    >
      <span className="nav-icon">
        <Icon size={17} />
      </span>
      {title}
    </button>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      <div className="stat-card-top">
        <span className="stat-icon">
          <Icon size={16} />
        </span>
        <span className="stat-arrow">↗</span>
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-sub">{sub}</span>
    </article>
  );
}

function NavItem({
  icon: Icon,
  title,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
}) {
  return (
    <a
      className="nav-item nav-item--disabled"
      href="#overview"
      aria-disabled="true"
      onClick={(event) => {
        event.preventDefault();
      }}
    >
      <span className="nav-icon">
        <Icon size={17} />
      </span>
      {title}
      {badge && <span className="nav-soon">{badge}</span>}
    </a>
  );
}
