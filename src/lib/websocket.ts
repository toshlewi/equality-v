import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface Socket {
  id: string;
  userId?: string;
  userRole?: string;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: Function) => void;
  disconnect: () => void;
  join: (room: string) => void;
}

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      path: '/api/socket'
    });

    this.io.on('connection', (socket: any) => {
      console.log('Client connected:', socket.id);

      // Handle authentication
      socket.on('authenticate', async (token: string) => {
        try {
          const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
          const user = await User.findById(decoded.sub);
          
          if (user && user.isActive) {
            socket.userId = user._id.toString();
            socket.userRole = user.role;
            this.connectedUsers.set(user._id.toString(), socket.id);
            
            socket.emit('authenticated', { 
              success: true, 
              userId: user._id.toString(),
              role: user.role 
            });
            
            console.log('User authenticated:', user.email);
          } else {
            socket.emit('authentication_failed', { error: 'Invalid token' });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authentication_failed', { error: 'Invalid token' });
        }
      });

      // Handle joining admin room
      socket.on('join_admin', () => {
        if (socket.userRole && ['admin', 'editor', 'reviewer', 'finance'].includes(socket.userRole)) {
          socket.join('admin');
          console.log('User joined admin room:', socket.userId);
        }
      });

      // Handle joining user-specific room
      socket.on('join_user_room', () => {
        if (socket.userId) {
          socket.join(`user_${socket.userId}`);
          console.log('User joined personal room:', socket.userId);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log('User disconnected:', socket.userId);
        }
      });
    });

    console.log('WebSocket server initialized');
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, event: string, data: any): boolean {
    if (!this.io) return false;

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Send notification to user's personal room
   */
  sendToUserRoom(userId: string, event: string, data: any): boolean {
    if (!this.io) return false;

    this.io.to(`user_${userId}`).emit(event, data);
    return true;
  }

  /**
   * Send notification to all admin users
   */
  sendToAdmins(event: string, data: any): boolean {
    if (!this.io) return false;

    this.io.to('admin').emit(event, data);
    return true;
  }

  /**
   * Send notification to specific role
   */
  sendToRole(role: string, event: string, data: any): boolean {
    if (!this.io) return false;

    // This would require maintaining a role-based room structure
    // For now, we'll broadcast to all connected users
    this.io.emit(event, { ...data, targetRole: role });
    return true;
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any): boolean {
    if (!this.io) return false;

    this.io.emit(event, data);
    return true;
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get user's socket ID
   */
  getUserSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }
}

// Export singleton instance
export const webSocketManager = new WebSocketManager();

// Export individual functions for convenience
export function sendToUser(userId: string, event: string, data: any): boolean {
  return webSocketManager.sendToUser(userId, event, data);
}

export function sendToUserRoom(userId: string, event: string, data: any): boolean {
  return webSocketManager.sendToUserRoom(userId, event, data);
}

export function sendToAdmins(event: string, data: any): boolean {
  return webSocketManager.sendToAdmins(event, data);
}

export function sendToRole(role: string, event: string, data: any): boolean {
  return webSocketManager.sendToRole(role, event, data);
}

export function broadcast(event: string, data: any): boolean {
  return webSocketManager.broadcast(event, data);
}

export function getConnectedUsersCount(): number {
  return webSocketManager.getConnectedUsersCount();
}

export function isUserConnected(userId: string): boolean {
  return webSocketManager.isUserConnected(userId);
}

export default webSocketManager;
