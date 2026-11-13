# UNIFY Phase 2 — VS Code companion

## Included

- Electron main-process bridge listening only on `127.0.0.1:41739`.
- Preload event subscription for editor context.
- UNIFY expands and asks APInex for a diagnostic explanation and suggested fix.
- VS Code extension with monitoring OFF by default.
- Workspace-level allowlist: the user explicitly approves a workspace via `UNIFY: Enable Workspace Monitoring`.
- Pause command: `UNIFY: Disable Workspace Monitoring`.
- Manual context command: `UNIFY: Send Current File to Desktop Assistant`.
- Document changes are debounced; content is sent when diagnostics exist. Manual send can send a file without diagnostics.
- No code is modified automatically. Suggestions are text only and require the user's own action.

## Install the extension

1. Open `vscode-extension` in a terminal.
2. Run `npm install`.
3. Run `npm run compile`.
4. Install VS Code Extension Manager if needed: `npm install -g @vscode/vsce`.
5. Run `vsce package` and install the resulting `.vsix` in VS Code using **Extensions: Install from VSIX**.
6. Start UNIFY desktop.
7. In VS Code, open only the workspace you want to approve.
8. Run `UNIFY: Enable Workspace Monitoring` from the Command Palette.

## Privacy / scope

The extension sends the active file text (up to 180 KB), its language, workspace path, and up to 100 diagnostics to the local UNIFY desktop app. It does not capture the screen, inspect unrelated windows, or transmit files from unapproved workspaces. Monitoring is disabled by default and can be paused from the Command Palette.

The current allowlist covers VS Code workspace folders only. It is not a general Windows screen-permission manager and does not yet integrate other desktop applications.
