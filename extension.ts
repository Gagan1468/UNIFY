import * as vscode from 'vscode'

const BRIDGE_URL = 'http://127.0.0.1:41739/v1/context'

function bridgeToken(): string {
  return vscode.workspace.getConfiguration('unify').get<string>('bridgeToken', '').trim()
}

let debounce: ReturnType<typeof setTimeout> | undefined
let output: vscode.OutputChannel
let flashDecoration: vscode.TextEditorDecorationType
function isWorkspaceApproved(): boolean {
  if (!vscode.workspace.getConfiguration('unify.monitoring').get<boolean>('enabled', false))
    return false
  const folder = vscode.workspace.workspaceFolders?.[0]
  if (!folder) return false
  const approved = vscode.workspace
    .getConfiguration('unify.monitoring')
    .get<string[]>('allowedWorkspacePaths', [])
  const normalized = folder.uri.fsPath.toLowerCase().replace(/[\\/]+$/, '')
  return approved.some((path) => path.toLowerCase().replace(/[\\/]+$/, '') === normalized)
}

async function sendContext(
  document: vscode.TextDocument,
  force = false,
  includeSelection = false
): Promise<void> {
  if (!isWorkspaceApproved()) return
  if (document.uri.scheme !== 'file' || document.isUntitled) return
  const token = bridgeToken()
  if (!token) {
    output.appendLine('Bridge token missing. Copy it from UNIFY Settings into unify.bridgeToken.')
    return
  }

  const allDiagnostics = vscode.languages.getDiagnostics(document.uri)
  const errorDiagnostics = allDiagnostics.filter(
    (item) => item.severity === vscode.DiagnosticSeverity.Error
  )
  const diagnostics = errorDiagnostics.slice(0, 100).map((diagnostic) => {
    const line = diagnostic.range.start.line + 1
    const code = diagnostic.code
      ? ` (${typeof diagnostic.code === 'object' ? diagnostic.code.value : diagnostic.code})`
      : ''
    return `Error line ${line}${code}: ${diagnostic.message}`
  })
  if (!force && diagnostics.length === 0) return

  if (errorDiagnostics.length > 0) {
    const editor = vscode.window.visibleTextEditors.find(
      (item) => item.document.uri.toString() === document.uri.toString()
    )
    const first = errorDiagnostics[0]
    if (editor && first) {
      const range = first.range
      editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport)
      editor.setDecorations(flashDecoration, [range])
      setTimeout(() => editor.setDecorations(flashDecoration, []), 1100)
    }
  }

  const text = document.getText()
  const editor = vscode.window.visibleTextEditors.find(
    (item) => item.document.uri.toString() === document.uri.toString()
  )
  const selectedText =
    includeSelection && editor ? editor.document.getText(editor.selection).slice(0, 20000) : ''
  const openTabs = vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .map((tab) => tab.label)
    .slice(0, 40)
  if (text.length > 180_000) {
    output.appendLine(`Skipped ${document.fileName}: file exceeds 180 KB text limit.`)
    return
  }

  try {
    const response = await fetch(BRIDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fileName: vscode.workspace.asRelativePath(document.uri, false),
        languageId: document.languageId,
        text,
        selectedText,
        openTabs,
        diagnostics,
        workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? ''
      })
    })
    if (!response.ok)
      output.appendLine(
        `UNIFY bridge returned HTTP ${response.status}. Is the desktop app running?`
      )
  } catch {
    output.appendLine('Could not reach UNIFY. Open the UNIFY desktop app and try again.')
  }
}

export function activate(context: vscode.ExtensionContext): void {
  output = vscode.window.createOutputChannel('UNIFY Companion')
  context.subscriptions.push(output, flashDecoration)
  flashDecoration = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 190, 70, 0.28)',
    border: '1px solid rgba(255, 190, 70, 0.95)',
    isWholeLine: true,
    overviewRulerColor: 'rgba(255, 190, 70, 0.95)',
    overviewRulerLane: vscode.OverviewRulerLane.Right
  })
  context.subscriptions.push(flashDecoration)

  context.subscriptions.push(
    vscode.commands.registerCommand('unify.enableMonitoring', async () => {
      const folder = vscode.workspace.workspaceFolders?.[0]
      if (!folder) {
        void vscode.window.showWarningMessage(
          'Open a workspace folder before enabling UNIFY monitoring.'
        )
        return
      }
      const config = vscode.workspace.getConfiguration('unify.monitoring')
      const current = config.get<string[]>('allowedWorkspacePaths', [])
      const path = folder.uri.fsPath
      if (!current.some((item) => item.toLowerCase() === path.toLowerCase())) {
        await config.update(
          'allowedWorkspacePaths',
          [...current, path],
          vscode.ConfigurationTarget.Workspace
        )
      }
      await config.update('enabled', true, vscode.ConfigurationTarget.Workspace)
      void vscode.window.showInformationMessage(
        'UNIFY monitoring enabled for this approved workspace.'
      )
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('unify.disableMonitoring', async () => {
      await vscode.workspace
        .getConfiguration('unify.monitoring')
        .update('enabled', false, vscode.ConfigurationTarget.Workspace)
      void vscode.window.showInformationMessage('UNIFY monitoring paused.')
    })
  )

  context.subscriptions.push(
    vscode.commands.registerCommand('unify.sendCurrentContext', async () => {
      const document = vscode.window.activeTextEditor?.document
      if (!document) return
      if (!isWorkspaceApproved()) {
        void vscode.window.showWarningMessage(
          'Approve this workspace first using UNIFY: Enable Workspace Monitoring.'
        )
        return
      }
      await sendContext(document, true)
    })
  )

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (
        !vscode.workspace
          .getConfiguration('unify.monitoring')
          .get<boolean>('sendOnDocumentChange', true)
      )
        return
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(() => {
        void sendContext(event.document)
      }, 900)
    })
  )

  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics((event) => {
      const active = vscode.window.activeTextEditor?.document
      if (!active || !event.uris.some((uri) => uri.toString() === active.uri.toString())) return
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(() => {
        void sendContext(active)
      }, 250)
    })
  )

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) void sendContext(editor.document, true, true)
    })
  )

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((event) => {
      if (event.textEditor === vscode.window.activeTextEditor) {
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => void sendContext(event.textEditor.document, true, true), 350)
      }
    })
  )

  const activeEditor = vscode.window.activeTextEditor
  if (activeEditor) void sendContext(activeEditor.document, true, true)
}

export function deactivate(): void {
  if (debounce) clearTimeout(debounce)
}
