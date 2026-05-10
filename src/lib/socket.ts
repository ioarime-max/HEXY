/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { io, Socket } from "socket.io-client";

const socketUrl = window.location.origin;

export const socket: Socket = io(socketUrl, {
  autoConnect: false,
});

export const connectSocket = (user: { id: string | number; name: string }) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit("presence:join", user);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
