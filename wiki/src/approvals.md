# Approval workflow

Destructive MCP actions do not execute directly. They create a pending human approval request that an administrator must decide.

## How it works

A destructive tool records a pending approval request that includes:

- the requesting credential,
- the agent identity,
- the tool,
- the action type,
- the target,
- a written justification,
- a one-hour expiry.

The tool returns an approval identifier and a pending status. The action is not performed until an administrator approves it.

## Deciding an approval

An administrator can approve or reject a pending approval through the admin API or dashboard.

Only on approval does DockPilot execute the action, inside a single database transaction that locks the approval row and writes the execution audit event.

Rejected, expired, and already-decided requests cannot execute anything. Approving a request whose target has disappeared results in a recorded `failed` approval instead of a silent success.

## Executable actions

The executable action types are currently:

- `session.revoke`
- `ai_credential.revoke`

Any other action type is refused.

## Good defaults

- Read-only tools never require approval.
- Approval requests expire after one hour.
- The approval record is auditable and tied to the requesting credential and agent identity.
