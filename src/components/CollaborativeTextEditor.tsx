'use client'

import { useEffect, useRef, useState } from 'react'
import { useCollaboration, useCollaborativeText } from '@/hooks/useCollaboration'
import { useAwareness } from '@/hooks/useAwareness'
import { PresenceIndicator } from './PresenceIndicator'
import { Button } from '@/components/ui/button'
import TextInput from '@/components/inputs/TextInput'
import { cn } from '@/lib/utils'

interface CollaborativeTextEditorProps {
  documentKey: string
  placeholder?: string
  className?: string
}

export const CollaborativeTextEditor = ({ 
  documentKey, 
  placeholder = "Start typing...", 
  className 
}: CollaborativeTextEditorProps) => {
  const { connected, joinRoom, leaveRoom, roomName } = useCollaboration()
  const { text, updateText } = useCollaborativeText(documentKey)
  const { setUser, setCursor } = useAwareness()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [localText, setLocalText] = useState(text)
  const [roomToJoin, setRoomToJoin] = useState('')

  // Sync with Yjs text
  useEffect(() => {
    setLocalText(text)
  }, [text])

  // Set user info when component mounts
  useEffect(() => {
    if (connected) {
      setUser({
        id: Math.random().toString(36).substr(2, 9), // In real app, use actual user ID
        name: `User ${Math.floor(Math.random() * 1000)}`, // In real app, use actual user name
        color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
      })
    }
  }, [connected, setUser])

  // Update cursor position
  const handleCursorMove = () => {
    if (!textareaRef.current || !connected) return
    
    const rect = textareaRef.current.getBoundingClientRect()
    const x = rect.left + (textareaRef.current.selectionStart * 8) // Approximate character width
    const y = rect.top + 20 // Approximate line height
    
    setCursor(x, y)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    updateText(newText)
  }

  const handleJoinRoom = () => {
    if (roomToJoin.trim()) {
      joinRoom(roomToJoin.trim())
    }
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    setRoomToJoin('')
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Room Controls */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        {!connected ? (
          <>
            <TextInput
              placeholder="Enter room name..."
              value={roomToJoin}
              onChange={(e) => setRoomToJoin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              containerclassname="flex-1"
            />
            <Button onClick={handleJoinRoom} disabled={!roomToJoin.trim()}>
              Join Room
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Room: {roomName}</span>
              <PresenceIndicator />
            </div>
            <Button variant="outline" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
          </div>
        )}
      </div>

      {/* Text Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextChange}
          onMouseMove={handleCursorMove}
          onKeyUp={handleCursorMove}
          placeholder={connected ? placeholder : "Join a room to start collaborating..."}
          disabled={!connected}
          className={cn(
            "w-full min-h-[300px] p-4 border rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            !connected && "bg-gray-100 cursor-not-allowed"
          )}
        />
        
        {/* Status indicator */}
        <div className="absolute top-2 right-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            connected ? "bg-green-500" : "bg-gray-400"
          )} title={connected ? "Connected" : "Disconnected"} />
        </div>
      </div>

      {/* Document Statistics */}
      {connected && (
        <div className="flex items-center justify-between text-sm text-gray-600 px-2">
          <span>Characters: {localText.length}</span>
          <span>Words: {localText.trim().split(/\s+/).filter(Boolean).length}</span>
        </div>
      )}
    </div>
  )
}