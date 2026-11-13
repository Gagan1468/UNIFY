# UNIFY VS Code Companion

This extension sends the active VS Code file and diagnostics to the UNIFY desktop app over a loopback-only HTTP bridge (`127.0.0.1:41739`).

## Privacy and permissions

- Monitoring is **off by default**.
- Run `UNIFY: Enable Workspace Monitoring` to explicitly approve the current workspace.
- The extension stores the approved workspace path in VS Code workspace settings.
- Run `UNIFY: Disable Workspace Monitoring` to pause transmission.
- Only the active editor document is sent. Text is limited to 180 KB.
- When diagnostics exist, changes are debounced before context is sent.
- `UNIFY: Send Current File to Desktop Assistant` manually sends the current file.

## Build

Requires Node.js and VS Code Extension API types:

```sh
npm install --save-dev typescript @types/vscode
npx tsc -p .
```

Then package with `vsce package` (install `@vscode/vsce` first).
