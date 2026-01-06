'use client'

import { CollaborativeTextEditor } from '@/components/CollaborativeTextEditor'
import { useCollaborativeMap, useCollaborativeArray } from '@/hooks/useCollaboration'
import { useAwareness } from '@/hooks/useAwareness'
import { ConnectionStatus } from '@/components/PresenceIndicator'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ProjectSettings {
  title: string
  description: string
  tags: string[]
}

interface AudioTrack {
  id: string
  name: string
  duration: number
  createdAt: string
}

export default function CollaborationDemo() {
  // Collaborative text for script editing
  const [showSettings, setShowSettings] = useState(false)
  const [showTracks, setShowTracks] = useState(false)

  // Collaborative project settings
  const { data: projectSettings, updateData: updateSettings } = useCollaborativeMap<ProjectSettings>('project-settings')

  // Collaborative audio tracks list
  const { items: audioTracks, addItem: addTrack, removeItem: removeTrack } = useCollaborativeArray<AudioTrack>('audio-tracks')

  // Awareness for user presence
  const { users } = useAwareness()

  const handleUpdateTitle = () => {
    updateSettings({
      title: `Project ${Date.now()}`,
      description: 'A collaborative audio project'
    })
  }

  const handleAddTrack = () => {
    const newTrack: AudioTrack = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Track ${audioTracks.length + 1}`,
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      createdAt: new Date().toISOString()
    }
    addTrack(newTrack)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Yjs Collaboration Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This demo shows how Yjs enables real-time collaboration in your Talktune app. 
          Open this page in multiple browser tabs or share with others to see live collaboration.
        </p>
        <ConnectionStatus />
      </div>

      {/* Collaborative Text Editor */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Collaborative Script Editor</h2>
        <p className="text-gray-600">
          Multiple users can edit this text simultaneously. Changes sync in real-time.
        </p>
        <CollaborativeTextEditor 
          documentKey="demo-script"
          placeholder="Write your script here... Other users will see your changes in real-time!"
        />
      </section>

      {/* Collaborative Project Settings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Collaborative Project Settings</h2>
          <Button onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? 'Hide' : 'Show'} Settings
          </Button>
        </div>
        
        {showSettings && (
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div>
              <strong>Title:</strong> {projectSettings.title || 'Untitled Project'}
            </div>
            <div>
              <strong>Description:</strong> {projectSettings.description || 'No description'}
            </div>
            <Button onClick={handleUpdateTitle}>
              Update Project Title
            </Button>
            <p className="text-sm text-gray-600">
              Project settings are shared across all collaborators. 
              Current settings: <code className="bg-white px-2 py-1 rounded">{JSON.stringify(projectSettings)}</code>
            </p>
          </div>
        )}
      </section>

      {/* Collaborative Audio Tracks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Collaborative Audio Tracks</h2>
          <Button onClick={() => setShowTracks(!showTracks)}>
            {showTracks ? 'Hide' : 'Show'} Tracks
          </Button>
        </div>
        
        {showTracks && (
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleAddTrack}>Add Track</Button>
              <span className="text-sm text-gray-600 self-center">
                {audioTracks.length} track(s) total
              </span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {audioTracks.length === 0 ? (
                <p className="text-gray-500 italic">No tracks yet. Add one to get started!</p>
              ) : (
                audioTracks.map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <div className="font-medium">{track.name}</div>
                      <div className="text-sm text-gray-500">
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')} • 
                        Created {new Date(track.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeTrack(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
            <p className="text-sm text-gray-600">
              All users can see and modify this track list in real-time.
            </p>
          </div>
        )}
      </section>

      {/* Active Users */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Collaborators</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          {users.length === 0 ? (
            <p className="text-gray-500 italic">
              No other users connected. Share this page with others to see collaboration in action!
            </p>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">Currently online:</p>
              {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: user.user.color || '#6B7280' }}
                  >
                    {user.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.user.name}</span>
                  <span className="text-sm text-gray-500">
                    (last seen {new Date(user.lastSeen).toLocaleTimeString()})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Instructions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How to Test Collaboration</h2>
        <div className="bg-blue-50 p-6 rounded-lg space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Start the Yjs WebSocket server: <code className="bg-white px-2 py-1 rounded">npm run yjs-server</code></li>
            <li>Start your Next.js app: <code className="bg-white px-2 py-1 rounded">npm run dev</code></li>
            <li>Or run both together: <code className="bg-white px-2 py-1 rounded">npm run dev:full</code></li>
            <li>Open this page in multiple browser tabs or different browsers</li>
            <li>Join the same room name in each tab</li>
            <li>Start typing in the text editor or modifying settings</li>
            <li>Watch changes sync in real-time across all connected clients!</li>
          </ol>
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> The WebSocket server runs on <code>ws://localhost:1234</code> by default.
            In production, you'd use a proper WebSocket service.
          </p>
        </div>
      </section>
    </div>
  )
}