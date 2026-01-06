'use client'

import { useAwareness } from '@/hooks/useAwareness'
import { useCollaboration } from '@/hooks/useCollaboration'
import { cn } from '@/lib/utils'

interface PresenceIndicatorProps {
  className?: string
}

const colors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-orange-500'
]

export const PresenceIndicator = ({ className }: PresenceIndicatorProps) => {
  const { connected, roomName } = useCollaboration()
  const { users } = useAwareness()

  if (!connected || !roomName || users.length === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 mr-2">
          {users.length} {users.length === 1 ? 'person' : 'people'} collaborating
        </span>
        <div className="flex -space-x-1">
          {users.slice(0, 5).map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-medium",
                user.user.color ? `bg-[${user.user.color}]` : colors[index % colors.length]
              )}
              title={user.user.name}
            >
              {user.user.avatar ? (
                <img
                  src={user.user.avatar}
                  alt={user.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.user.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {users.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-sm font-medium">
              +{users.length - 5}
            </div>
          )}
        </div>
      </div>
      <div className={cn(
        "w-3 h-3 rounded-full",
        connected ? "bg-green-500" : "bg-red-500"
      )} title={connected ? "Connected" : "Disconnected"} />
    </div>
  )
}

export const ConnectionStatus = () => {
  const { connected, isLoading, roomName } = useCollaboration()

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "w-2 h-2 rounded-full",
        isLoading ? "bg-yellow-500 animate-pulse" :
        connected ? "bg-green-500" : "bg-red-500"
      )} />
      <span className="text-gray-600">
        {isLoading ? 'Connecting...' :
         connected ? `Connected to ${roomName}` :
         'Disconnected'}
      </span>
    </div>
  )
}