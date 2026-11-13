# UNIFY upgrade – Phase 1

## Included

- Attach button in the existing chat composer.
- Drag-and-drop attachments onto the composer.
- Paste copied screenshots/images with Ctrl+V while the UNIFY window is focused.
- Attachment previews with remove controls.
- Text/code attachments are read locally in the renderer and included as text context in the APInex request.
- Images are sent using OpenAI-compatible `image_url` content parts (data URLs); actual vision support depends on the selected APInex model.
- Up to 8 files per message, 12 MB per file. Supported: images and common text/code formats.
- Existing dock, animations, settings and APInex key handling retained.

## Validation

- `npm run typecheck` passed (node + web TypeScript checks).
- ESLint could not be run in the Linux packaging environment because the bundled Windows `node_modules` executables are not runnable here. Run `npm.cmd run lint` on Windows after extracting.

## Not included yet

- Screen/app allowlist and background monitoring.
- VS Code extension, diagnostics watcher, and proactive chat opening.

These are planned as Phase 2/3. They should use explicit app/editor permissions and a visible pause/monitoring control, not covert full-screen capture.
