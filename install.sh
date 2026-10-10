#!/usr/bin/env bash
#
# DockPilot one-shot installer.
#
# Verifies prerequisites, installs dependencies, generates secrets, brings up the
# local PostgreSQL container, applies migrations, and (optionally) starts the stack.
#
# Usage:
#   ./install.sh                 # interactive install of the full dev stack
#   ./install.sh --yes           # non-interactive, accept defaults
#   ./install.sh --no-start      # install only; do not start the dev servers
#   ./install.sh --prod          # build production bundles instead of dev servers
#   ./install.sh --help          # show help
#
set -u

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR" || exit 1

# ---------------------------------------------------------------------------
# Presentation
# ---------------------------------------------------------------------------
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'
  DIM=$'\033[2m'
  RESET=$'\033[0m'
  BLUE=$'\033[38;5;111m'
  CYAN=$'\033[38;5;80m'
  GREEN=$'\033[38;5;114m'
  AMBER=$'\033[38;5;215m'
  RED=$'\033[38;5;203m'
  GREY=$'\033[38;5;244m'
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; CYAN=""; GREEN=""; AMBER=""; RED=""; GREY=""
fi

BANNER="${BLUE}${BOLD}
   ____             _   ____  _ _       _
  |  _ \\  ___   ___| | _|  _ \\(_) | ___ | |_
  | | | |/ _ \\ / __| |/ / |_) | | |/ _ \\| __|
  | |_| | (_) | (__|   <|  __/| | | (_) | |_
  |____/ \\___/ \\___|_|\\_\\_|   |_|_|\\___/ \\__|
${RESET}${GREY}  Docker, without the guessing.${RESET}
"

log()    { printf '%s\n' "${GREY}•${RESET} $*"; }
ok()     { printf '%s\n' "${GREEN}✔${RESET} $*"; }
warn()   { printf '%s\n' "${AMBER}!${RESET} $*"; }
fail()   { printf '%s\n' "${RED}✘${RESET} $*" >&2; }
header() { printf '\n%s\n' "${BOLD}${CYAN}▸ $*${RESET}"; }

step_index=0
total_steps=7
step() {
  step_index=$((step_index + 1))
  printf '\n%s\n' "${BOLD}${BLUE}[$step_index/$total_steps]${RESET} ${BOLD}$*${RESET}"
}

spin() {
  # spin "<message>" <command...>
  local message="$1"; shift
  if [ ! -t 1 ]; then
    "$@"
    return $?
  fi
  local frames='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏' i=0 pid status
  "$@" >/tmp/dockpilot-install.log 2>&1 &
  pid=$!
  while kill -0 "$pid" 2>/dev/null; do
    i=$(( (i + 1) % ${#frames} ))
    printf '\r  %s%s%s %s' "$BLUE" "${frames:$i:1}" "$RESET" "$message"
    sleep 0.1
  done
  wait "$pid"; status=$?
  if [ "$status" -eq 0 ]; then
    printf '\r  %s✔%s %s\n' "$GREEN" "$RESET" "$message"
  else
    printf '\r  %s✘%s %s\n' "$RED" "$RESET" "$message"
    sed 's/^/    /' /tmp/dockpilot-install.log | tail -20
  fi
  return "$status"
}

confirm() {
  # confirm "<question>" [default: y|n]
  local question="$1" default="${2:-y}" answer
  if [ "$ASSUME_YES" = "1" ]; then return 0; fi
  if [ ! -t 0 ]; then return 0; fi
  printf '%s [%s/%s] ' "${BOLD}$question${RESET}" "$([ "$default" = y ] && echo Y || echo y)" "$([ "$default" = n ] && echo N || echo n)"
  read -r answer
  answer="${answer:-$default}"
  case "$answer" in [Yy]*) return 0 ;; *) return 1 ;; esac
}

have() { command -v "$1" >/dev/null 2>&1; }

# ---------------------------------------------------------------------------
# Flags
# ---------------------------------------------------------------------------
ASSUME_YES=0
DO_START=1
PROD_MODE=0

while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes)     ASSUME_YES=1 ;;
    --no-start)   DO_START=0 ;;
    --prod)       PROD_MODE=1 ;;
    -h|--help)
      printf '%s\n' "DockPilot installer"
      printf '%s\n' ""
      printf '%s\n' "  ./install.sh              Install and start the local dev stack"
      printf '%s\n' "  ./install.sh --yes        Non-interactive install with defaults"
      printf '%s\n' "  ./install.sh --no-start   Install only, do not start servers"
      printf '%s\n' "  ./install.sh --prod       Build production bundles (no dev servers)"
      printf '%s\n' "  ./install.sh --help       Show this help"
      exit 0 ;;
    *) fail "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

printf '%s' "$BANNER"
printf '%s\n' "${DIM}Installer starting. This will take a few minutes on a fresh machine.${RESET}"

# Track whether the user chose to (re)install.
NEED_NODE=0

# ---------------------------------------------------------------------------
step "Checking prerequisites"
# ---------------------------------------------------------------------------
if ! have node; then
  fail "Node.js was not found. Install Node.js 20.19+ and re-run this installer."
  fail "Recommended: https://github.com/nvm-sh/nvm  then  nvm install 20"
  exit 1
fi
NODE_VERSION="$(node -p 'process.versions.node')"
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
NODE_MINOR="$(node -p 'Number(process.versions.node.split(".")[1])')"
if [ "$NODE_MAJOR" -lt 20 ] || { [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 19 ]; }; then
  fail "Node.js $NODE_VERSION is too old. DockPilot needs 20.19+."
  exit 1
fi
ok "Node.js $NODE_VERSION"

if ! have npm; then
  fail "npm was not found alongside Node.js. Reinstall Node.js."
  exit 1
fi
ok "npm $(npm --version)"

if have docker; then
  if docker info >/dev/null 2>&1; then
    ok "Docker is available"
    HAVE_DOCKER=1
  else
    warn "Docker is installed but the daemon is not reachable. Start Docker before continuing."
    HAVE_DOCKER=0
  fi
else
  warn "Docker was not found. The local PostgreSQL container cannot be started without it."
  HAVE_DOCKER=0
fi

# ---------------------------------------------------------------------------
step "Installing dependencies"
# ---------------------------------------------------------------------------
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  spin "Installing npm workspaces (this is the slow part)" npm install --no-fund --no-audit || {
    fail "npm install failed. See the log above."
    exit 1
  }
else
  ok "Dependencies already installed"
fi

# ---------------------------------------------------------------------------
step "Configuring environment"
# ---------------------------------------------------------------------------
gen_secret() { node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"; }

if [ -f .env ]; then
  if grep -qE '^SESSION_SECRET=(replace-with|$)' .env || grep -qE '^MCP_TOKEN_SECRET=(replace-with|$)' .env; then
    warn "Existing .env still contains placeholder secrets. Regenerating them."
    SESSION_SECRET="$(gen_secret)"
    MCP_TOKEN_SECRET="$(gen_secret)"
    # Rewrite only the two secret lines, preserving everything else.
    node - "$SESSION_SECRET" "$MCP_TOKEN_SECRET" <<'NODE' || exit 1
const fs = require('node:fs');
const [session, mcp] = process.argv.slice(2);
const lines = fs.readFileSync('.env', 'utf8').split('\n').map((line) => {
  if (line.startsWith('SESSION_SECRET=')) return `SESSION_SECRET=${session}`;
  if (line.startsWith('MCP_TOKEN_SECRET=')) return `MCP_TOKEN_SECRET=${mcp}`;
  return line;
});
fs.writeFileSync('.env', lines.join('\n'));
NODE
    ok "Rotated SESSION_SECRET and MCP_TOKEN_SECRET"
  else
    ok "Reusing existing .env"
  fi
else
  cp .env.example .env
  SESSION_SECRET="$(gen_secret)"
  MCP_TOKEN_SECRET="$(gen_secret)"
  node - "$SESSION_SECRET" "$MCP_TOKEN_SECRET" <<'NODE' || exit 1
const fs = require('node:fs');
const [session, mcp] = process.argv.slice(2);
const env = fs.readFileSync('.env', 'utf8')
  .replace('replace-with-at-least-32-random-bytes-before-running', session)
  .replace('replace-with-a-unique-32-character-or-longer-secret', mcp);
fs.writeFileSync('.env', env);
NODE
  ok "Created .env with freshly generated secrets"
fi
printf '%s\n' "${DIM}  Secrets live in .env (git-ignored). Keep that file private.${RESET}"

# ---------------------------------------------------------------------------
step "Starting PostgreSQL"
# ---------------------------------------------------------------------------
if [ "$HAVE_DOCKER" = "1" ]; then
  if spin "Bringing up the local database container" npm run db:up; then
    # Wait for the healthcheck to pass before migrating.
    ready=0
    for _ in $(seq 1 30); do
      if docker exec dockpilot-local-postgres-1 pg_isready -U dockpilot -d dockpilot >/dev/null 2>&1; then
        ready=1; break
      fi
      sleep 1
    done
    if [ "$ready" = "1" ]; then
      ok "PostgreSQL is ready on 127.0.0.1:54329"
    else
      warn "PostgreSQL container started but did not report ready in time."
    fi
  else
    warn "Could not start the database container. Continuing — re-run 'npm run db:up' later."
  fi
else
  warn "Skipping database startup (Docker unavailable)."
  printf '%s\n' "${DIM}  Provide an external DATABASE_URL in .env, then run 'npm run db:migrate'.${RESET}"
fi

# ---------------------------------------------------------------------------
step "Applying database migrations"
# ---------------------------------------------------------------------------
if [ "$HAVE_DOCKER" = "1" ] || grep -q '^DATABASE_URL=' .env; then
  if spin "Migrating the schema" npm run db:migrate; then
    ok "Schema is up to date"
  else
    warn "Migration failed. Check the database connection in .env."
  fi
else
  warn "Skipped migrations (no database available yet)."
fi

# ---------------------------------------------------------------------------
step "Building workspaces"
# ---------------------------------------------------------------------------
if [ "$PROD_MODE" = "1" ]; then
  spin "Building shared, API and web bundles" npm run build || {
    fail "Production build failed."
    exit 1
  }
  ok "Production bundles built"
else
  spin "Compiling the shared package" npm run build:shared || {
    fail "Shared package build failed."
    exit 1
  }
  ok "Shared package compiled"
fi

# ---------------------------------------------------------------------------
step "Finishing up"
# ---------------------------------------------------------------------------
cat >/tmp/dockpilot-next-steps <<EOF
${BOLD}${GREEN}DockPilot is installed.${RESET}

${BOLD}Start the stack${RESET}
  npm run dev                 ${DIM}# API + web with hot reload${RESET}
  ${DIM}(production: npm --workspace=@dockpilot/api start after 'npm run build')${RESET}

${BOLD}Then open${RESET}
  ${CYAN}http://127.0.0.1:5173${RESET}   dashboard (create the first owner here)
  ${CYAN}http://127.0.0.1:4000/api/v1/health${RESET}   API health
  ${CYAN}http://127.0.0.1:4000/api/v1/mcp${RESET}   MCP endpoint (bearer token)

${BOLD}Handy commands${RESET}
  npm run db:down             ${DIM}# stop local database (keeps data)${RESET}
  npm run test                ${DIM}# unit + integration suites${RESET}
  npm run lint                ${DIM}# lint everything${RESET}
EOF
cat /tmp/dockpilot-next-steps

if [ "$DO_START" = "1" ] && [ "$PROD_MODE" = "0" ]; then
  if confirm "Start the DockPilot dev servers now?" y; then
    header "Starting dev servers (Ctrl+C to stop)"
    exec npm run dev
  else
    ok "Installed. Run 'npm run dev' when you are ready."
  fi
else
  ok "Install complete."
fi
