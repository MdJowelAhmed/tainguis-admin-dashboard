import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://10.10.26.172:4051'

let socket: Socket | null = null

export const getSocket = (token?: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: {
        token: token || undefined,
      },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('⚡ Socket disconnected')
    })
  } else if (token && socket.auth) {
    socket.auth = { token }
    if (!socket.connected) {
      socket.connect()
    }
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
