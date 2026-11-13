import { ElectronAPI } from '@electron-toolkit/preload'

type UnifyChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content:
    | string
    | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>
}

type ApinexResult<T> = {
  ok: boolean
  data?: T
  error?: string
}

type VsCodeContextSnapshot = {
  source: 'vscode'
  fileName: string
  languageId: string
  text: string
  selectedText: string
  diagnostics: string[]
  workspace: string
  openTabs: string[]
  capturedAt: number
}

type Mem0Memory = {
  id: string
  memory: string
  score?: number
}

interface UnifyAPI {
  apinex: {
    setApiKey: (key: string) => Promise<ApinexResult<null>>
    getApiKeyStatus: () => Promise<ApinexResult<{ configured: boolean }>>
    listModels: () => Promise<ApinexResult<Array<{ id: string; name?: string }>>>
    onVsCodeContext: (
      callback: (payload: {
        source: string
        fileName: string
        languageId: string
        text: string
        diagnostics: string[]
        workspace: string
      }) => void
    ) => () => void
    sendMessage: (payload: {
      model: string
      messages: UnifyChatMessage[]
    }) => Promise<ApinexResult<{ content: string }>>
  }

  context: {
    getBridgeToken: () => Promise<ApinexResult<{ token: string }>>
    getSnapshot: () => Promise<ApinexResult<VsCodeContextSnapshot[]>>
    clear: () => Promise<ApinexResult<null>>
    onUpdated: (callback: (items: VsCodeContextSnapshot[]) => void) => () => void
  }

  mem0: {
    setApiKey: (key: string) => Promise<ApinexResult<null>>
    getStatus: () => Promise<ApinexResult<{ configured: boolean; enabled: boolean }>>
    setEnabled: (enabled: boolean) => Promise<ApinexResult<{ enabled: boolean }>>
    add: (
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    ) => Promise<ApinexResult<null>>
    search: (query: string) => Promise<ApinexResult<Mem0Memory[]>>
    getAll: () => Promise<ApinexResult<Mem0Memory[]>>
    delete: (memoryId: string) => Promise<ApinexResult<null>>
    deleteAll: () => Promise<ApinexResult<null>>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: UnifyAPI
  }
}

export {}
