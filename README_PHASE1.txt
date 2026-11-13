UNIFY PHASE 1 — CONTEXT PLATFORM

Replace these five files at their matching project paths:
- src/main/index.ts
- src/preload/index.ts
- src/preload/index.d.ts
- src/renderer/src/App.tsx
- vscode-extension/src/extension.ts

Setup:
1. Back up/commit your current project.
2. Replace the five files.
3. Add the configuration snippet from vscode-extension.package-json-snippet.json to the existing contributes.configuration section in vscode-extension/package.json. Merge it; do not overwrite the whole manifest.
4. Run: npx.cmd prettier --write .
5. Run: npm.cmd run typecheck
6. Run: npm.cmd run lint
7. Launch UNIFY and open Settings > Workspace Context. Copy the token.
8. In VS Code User Settings JSON add: "unify.bridgeToken": "YOUR_TOKEN"
9. Run the existing command: UNIFY: Enable Workspace Monitoring. Approve only the intended workspace.
10. Verify the latest active file appears in UNIFY. Keep "Include VS Code context in AI requests" off until you want editor content sent to APInex.

Privacy:
- The bridge binds to 127.0.0.1 and requires a per-install bearer token.
- Context is not sent to APInex until the renderer sharing checkbox is enabled.
- Context is not sent to Mem0 by this phase.
- VS Code workspace approval remains required.
- The extension sends active editor content and selected text only from approved workspaces; open tabs are labels only.

Scope:
This is Phase 1 for VS Code context. It is not yet Chrome, universal file parsing, Word, audio/video or desktop-wide access.
This bundle has not been tested in your local Windows project. Run the checks above and share any errors before proceeding.
