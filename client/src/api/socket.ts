import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Identity is resolved server-side from the session cookie; nothing is sent
// from the client.
export function getSocket(): Socket {
  if (!socket) {
    socket = io({ withCredentials: true });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
