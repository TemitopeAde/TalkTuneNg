'use client'

import { useEffect, useState } from 'react'
import { useCollaboration } from './useCollaboration'

export interface UserPresence {
  user: {
    id: string
    name: string
    email?: string
    avatar?: string
    color?: string
  }
  cursor?: {
    x: number
    y: number
  }
  selection?: {
    start: number
    end: number
  }
  lastSeen: number
}

export const useAwareness = () => {
  const { doc } = useCollaboration()
  const [users, setUsers] = useState<Map<number, UserPresence>>(new Map())
  const [clientId, setClientId] = useState<number | null>(null)

  useEffect(() => {
    if (!doc) return

    const provider = (doc as any).provider
    if (!provider?.awareness) return

    const awareness = provider.awareness
    setClientId(awareness.clientID)

    const updateUsers = () => {
      const states = awareness.getStates()
      setUsers(new Map(states))
    }

    // Listen for awareness changes
    awareness.on('change', updateUsers)
    
    // Initial load
    updateUsers()

    return () => {
      awareness.off('change', updateUsers)
    }
  }, [doc])

  const updatePresence = (presence: Partial<UserPresence>) => {
    if (!doc) return

    const provider = (doc as any).provider
    if (!provider?.awareness) return

    const currentState = provider.awareness.getLocalState() || {}
    provider.awareness.setLocalStateField('user', {
      ...currentState.user,
      ...presence.user,
      lastSeen: Date.now()
    })

    if (presence.cursor) {
      provider.awareness.setLocalStateField('cursor', presence.cursor)
    }

    if (presence.selection) {
      provider.awareness.setLocalStateField('selection', presence.selection)
    }
  }

  const setUser = (user: UserPresence['user']) => {
    updatePresence({ user })
  }

  const setCursor = (x: number, y: number) => {
    updatePresence({ cursor: { x, y } })
  }

  const setSelection = (start: number, end: number) => {
    updatePresence({ selection: { start, end } })
  }

  const clearPresence = () => {
    if (!doc) return

    const provider = (doc as any).provider
    if (!provider?.awareness) return

    provider.awareness.setLocalState(null)
  }

  // Filter out current user and convert to array
  const otherUsers = Array.from(users.entries())
    .filter(([id]) => id !== clientId)
    .map(([id, presence]) => ({ id, ...presence }))

  const currentUser = clientId !== null ? users.get(clientId) : null

  return {
    users: otherUsers,
    currentUser,
    clientId,
    setUser,
    setCursor,
    setSelection,
    updatePresence,
    clearPresence
  }
}