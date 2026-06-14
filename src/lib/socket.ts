import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getToken } from './token'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

let globalSocket: Socket | null = null

export function getSocket(): Socket | null {
  return globalSocket
}

export function useSocket() {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    if (globalSocket?.connected) {
      socketRef.current = globalSocket
      setConnected(true)
      return
    }

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))

    globalSocket = s
    socketRef.current = s

    return () => {
      s.off('connect')
      s.off('disconnect')
    }
  }, [])

  return { socket: socketRef.current, connected }
}

export function useChatSocket(chatId?: string | number) {
  const { socket, connected } = useSocket()
  const [messages, setMessages] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!socket || !connected || !chatId) return

    socket.emit('chat:join', Number(chatId))

    const onMessage = (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    const onTyping = ({ userId, isTyping }: { userId: number; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        if (isTyping) next.add(userId)
        else next.delete(userId)
        return next
      })
    }

    socket.on('chat:message', onMessage)
    socket.on('chat:typing', onTyping)

    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:typing', onTyping)
    }
  }, [socket, connected, chatId])

  return { messages, typingUsers }
}
