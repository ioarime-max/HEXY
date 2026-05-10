/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket, connectSocket, disconnectSocket } from '../lib/socket';

interface UserPresence {
  id: string | number;
  name: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
}

interface SocketContextType {
  user: { id: string | number; name: string } | null;
  onlineUsers: UserPresence[];
  notifications: Notification[];
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode; user: { id: string | number; name: string } | null }> = ({ children, user }) => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      connectSocket(user);

      socket.on("presence:update", (users: UserPresence[]) => {
        // Deduplicate users by ID to prevent duplicate keys in UI
        const uniqueUsers = users.reduce((acc: UserPresence[], curr) => {
          if (!acc.some(u => u.id === curr.id)) {
            acc.push(curr);
          }
          return acc;
        }, []);
        setOnlineUsers(uniqueUsers);
      });

      socket.on("notification:new", (notification: Notification) => {
        setNotifications(prev => [notification, ...prev].slice(0, 5));
      });

      return () => {
        socket.off("presence:update");
        socket.off("notification:new");
        disconnectSocket();
      };
    }
  }, [user]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ user, onlineUsers, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};
