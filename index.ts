import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

const api = {
  apinex: {
    setApiKey: (key: string) => ipcRenderer.invoke('apinex:set-api-key', key),

    getApiKeyStatus: () => ipcRenderer.invoke('apinex:get-api-key-status'),

    listModels: () => ipcRenderer.invoke('apinex:list-models'),

    onVsCodeContext: (
      callback: (payload: {
        source: string
        fileName: string
        languageId: string
        text: string
        diagnostics: string[]
        workspace: string
      }) => void
    ) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        payload: {
          source: string
          fileName: string
          languageId: string
          text: string
          diagnostics: string[]
          workspace: string
        }
      ): void => callback(payload)

      ipcRenderer.on('unify:vscode-context', listener)
      return () => ipcRenderer.removeListener('unify:vscode-context', listener)
    },

    sendMessage: (payload: {
      model: string
      messages: Array<{
        role: 'system' | 'user' | 'assistant'
        content:
          | string
          | Array<
              { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
            >
      }>
    }) => ipcRenderer.invoke('apinex:send-message', payload)
  },

  context: {
    getBridgeToken: () => ipcRenderer.invoke('context:get-bridge-token'),
    getSnapshot: () => ipcRenderer.invoke('context:get-snapshot'),
    clear: () => ipcRenderer.invoke('context:clear'),
    onUpdated: (callback: (items: VsCodeContextSnapshot[]) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, items: VsCodeContextSnapshot[]): void =>
        callback(items)
      ipcRenderer.on('unify:context-updated', listener)
      return () => ipcRenderer.removeListener('unify:context-updated', listener)
    }
  },

  mem0: {
    setApiKey: (key: string) => ipcRenderer.invoke('mem0:set-api-key', key),

    getStatus: () => ipcRenderer.invoke('mem0:get-status'),

    setEnabled: (enabled: boolean) => ipcRenderer.invoke('mem0:set-enabled', enabled),

    add: (messages: Array<{ role: 'user' | 'assistant'; content: string }>) =>
      ipcRenderer.invoke('mem0:add', messages),

    search: (query: string) => ipcRenderer.invoke('mem0:search', query),

    getAll: () => ipcRenderer.invoke('mem0:get-all'),

    delete: (memoryId: string) => ipcRenderer.invoke('mem0:delete', memoryId),

    deleteAll: () => ipcRenderer.invoke('mem0:delete-all')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('Failed to expose preload APIs:', error)
  }
} else {
  // @ts-ignore - Defined in preload/index.d.ts
  window.electron = electronAPI

  // @ts-ignore - Defined in preload/index.d.ts
  window.api = api
}
