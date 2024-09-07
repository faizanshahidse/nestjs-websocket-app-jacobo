import { Request } from '@nestjs/common';
import { Socket } from 'socket.io';

// auth guard types
type AuthPayload = {
  pollID: string;
  userID: string;
  name: string;
};

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
