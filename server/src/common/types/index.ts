import { Request } from 'express';
import { Socket } from 'socket.io';

// auth guard types
export type AuthPayload = {
  pollID: string;
  userID: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
