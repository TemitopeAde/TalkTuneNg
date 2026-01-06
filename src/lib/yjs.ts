import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'

export interface CollaborativeDoc {
  doc: Y.Doc
  provider: WebsocketProvider | null
  persistence: IndexeddbPersistence | null
}

export class YjsDocumentManager {
  private static instances: Map<string, CollaborativeDoc> = new Map()
  
  static getOrCreateDocument(roomName: string, wsUrl?: string): CollaborativeDoc {
    if (this.instances.has(roomName)) {
      return this.instances.get(roomName)!
    }

    // Create a new Yjs document
    const doc = new Y.Doc()
    
    // Set up WebSocket provider for real-time sync (only on client side)
    let provider: WebsocketProvider | null = null
    if (typeof window !== 'undefined' && wsUrl) {
      provider = new WebsocketProvider(wsUrl, roomName, doc)
      
      provider.on('status', (event: { status: string }) => {
        console.log('WebSocket status:', event.status) // connected, disconnected
      })
    }
    
    // Set up IndexedDB persistence for offline support (only on client side)
    let persistence: IndexeddbPersistence | null = null
    if (typeof window !== 'undefined') {
      persistence = new IndexeddbPersistence(roomName, doc)
      
      persistence.on('synced', () => {
        console.log('Document synced with IndexedDB')
      })
    }

    const collaborativeDoc: CollaborativeDoc = {
      doc,
      provider,
      persistence
    }

    this.instances.set(roomName, collaborativeDoc)
    return collaborativeDoc
  }

  static destroyDocument(roomName: string): void {
    const instance = this.instances.get(roomName)
    if (instance) {
      instance.provider?.destroy()
      instance.persistence?.destroy()
      instance.doc.destroy()
      this.instances.delete(roomName)
    }
  }

  static getAllDocuments(): Map<string, CollaborativeDoc> {
    return this.instances
  }
}

// Shared data types factory
export const createSharedTypes = (doc: Y.Doc) => ({
  // For collaborative text editing (scripts, notes, etc.)
  getText: (key: string) => doc.getText(key),
  
  // For collaborative objects (project settings, metadata, etc.)
  getMap: (key: string) => doc.getMap(key),
  
  // For collaborative lists (todo lists, audio tracks, etc.)
  getArray: (key: string) => doc.getArray(key)
})

// Default WebSocket server URL (you'll need to set up your own server)
export const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234'