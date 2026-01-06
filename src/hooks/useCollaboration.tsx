'use client'

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import * as Y from 'yjs'
import { YjsDocumentManager, createSharedTypes, DEFAULT_WS_URL, CollaborativeDoc } from '@/lib/yjs'

interface CollaborationContextType {
  doc: Y.Doc | null
  connected: boolean
  roomName: string | null
  sharedTypes: ReturnType<typeof createSharedTypes> | null
  joinRoom: (roomName: string, wsUrl?: string) => void
  leaveRoom: () => void
  isLoading: boolean
}

const CollaborationContext = createContext<CollaborationContextType>({
  doc: null,
  connected: false,
  roomName: null,
  sharedTypes: null,
  joinRoom: () => { },
  leaveRoom: () => { },
  isLoading: false,
})

export const useCollaboration = () => {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider')
  }
  return context
}

interface CollaborationProviderProps {
  children: ReactNode
}

export const CollaborationProvider = ({ children }: CollaborationProviderProps) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sharedTypes, setSharedTypes] = useState<ReturnType<typeof createSharedTypes> | null>(null)

  const currentDocRef = useRef<CollaborativeDoc | null>(null)

  const joinRoom = async (newRoomName: string, wsUrl = DEFAULT_WS_URL) => {
    if (newRoomName === roomName && currentDocRef.current) {
      return // Already in the room
    }

    setIsLoading(true)

    try {
      // Leave current room if exists
      if (currentDocRef.current && roomName) {
        leaveRoom()
      }

      // Join new room
      const collaborativeDoc = YjsDocumentManager.getOrCreateDocument(newRoomName, wsUrl)
      currentDocRef.current = collaborativeDoc

      setDoc(collaborativeDoc.doc)
      setRoomName(newRoomName)
      setSharedTypes(createSharedTypes(collaborativeDoc.doc))

      // Set up connection status listener
      if (collaborativeDoc.provider) {
        collaborativeDoc.provider.on('status', (event: { status: string }) => {
          setConnected(event.status === 'connected')
        })

        // Initial connection state
        setConnected(collaborativeDoc.provider.wsconnected)
      } else {
        // If no provider (server-side), consider it "connected" for offline use
        setConnected(true)
      }
    } catch (error) {
      console.error('Error joining room:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const leaveRoom = () => {
    if (currentDocRef.current && roomName) {
      // Don't destroy the document, just disconnect this component
      // The document will persist for other users
      if (currentDocRef.current.provider) {
        currentDocRef.current.provider.disconnect()
      }
    }

    currentDocRef.current = null
    setDoc(null)
    setRoomName(null)
    setConnected(false)
    setSharedTypes(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom()
    }
  }, [])

  const value: CollaborationContextType = {
    doc,
    connected,
    roomName,
    sharedTypes,
    joinRoom,
    leaveRoom,
    isLoading,
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
}

// Hook for collaborative text
export const useCollaborativeText = (key: string) => {
  const { sharedTypes, doc } = useCollaboration()
  const [text, setText] = useState('')

  useEffect(() => {
    if (!sharedTypes || !doc) return

    const yText = sharedTypes.getText(key)

    // Initial value
    setText(yText.toString())

    // Listen for changes
    const observer = () => {
      setText(yText.toString())
    }

    yText.observe(observer)

    return () => {
      yText.unobserve(observer)
    }
  }, [sharedTypes, doc, key])

  const updateText = (newText: string) => {
    if (!sharedTypes) return

    const yText = sharedTypes.getText(key)

    // Replace entire content (for simple use cases)
    // For more advanced text editing, you'd want to use delta operations
    yText.delete(0, yText.length)
    yText.insert(0, newText)
  }

  return { text, updateText }
}

// Hook for collaborative objects
export const useCollaborativeMap = <T extends Record<string, any>,>(key: string) => {
  const { sharedTypes, doc } = useCollaboration()
  const [data, setDataState] = useState<T>({} as T)

  useEffect(() => {
    if (!sharedTypes || !doc) return

    const yMap = sharedTypes.getMap(key)

    // Initial value
    setDataState(yMap.toJSON() as T)

    // Listen for changes
    const observer = () => {
      setDataState(yMap.toJSON() as T)
    }

    yMap.observe(observer)

    return () => {
      yMap.unobserve(observer)
    }
  }, [sharedTypes, doc, key])

  const updateData = (updates: Partial<T>) => {
    if (!sharedTypes) return

    const yMap = sharedTypes.getMap(key)

    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) {
        yMap.delete(k)
      } else {
        yMap.set(k, v)
      }
    })
  }

  const setData = (newData: T) => {
    if (!sharedTypes) return

    const yMap = sharedTypes.getMap(key)
    yMap.clear()
    Object.entries(newData).forEach(([k, v]) => {
      yMap.set(k, v)
    })
  }

  return { data, updateData, setData }
}

// Hook for collaborative arrays
export const useCollaborativeArray = <T,>(key: string) => {
  const { sharedTypes, doc } = useCollaboration()
  const [items, setItems] = useState<T[]>([])

  useEffect(() => {
    if (!sharedTypes || !doc) return

    const yArray = sharedTypes.getArray(key)

    // Initial value
    setItems(yArray.toArray() as T[])

    // Listen for changes
    const observer = () => {
      setItems(yArray.toArray() as T[])
    }

    yArray.observe(observer)

    return () => {
      yArray.unobserve(observer)
    }
  }, [sharedTypes, doc, key])

  const addItem = (item: T) => {
    if (!sharedTypes) return

    const yArray = sharedTypes.getArray(key)
    yArray.push([item])
  }

  const removeItem = (index: number) => {
    if (!sharedTypes) return

    const yArray = sharedTypes.getArray(key)
    yArray.delete(index, 1)
  }

  const updateItem = (index: number, item: T) => {
    if (!sharedTypes) return

    const yArray = sharedTypes.getArray(key)
    yArray.delete(index, 1)
    yArray.insert(index, [item])
  }

  const setAllItems = (newItems: T[]) => {
    if (!sharedTypes) return

    const yArray = sharedTypes.getArray(key)
    yArray.delete(0, yArray.length)
    yArray.push(newItems)
  }

  return { items, addItem, removeItem, updateItem, setAllItems }
}