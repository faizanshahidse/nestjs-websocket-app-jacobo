import { Logger, OnModuleInit } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';

@WebSocketGateway({
  namespace: 'polls',
})
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollsGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  // @WebSocketServer()
  // server: Server;

  // onModuleInit() {
  //   this.server.on('connection', (socket) => {
  //     console.log('Connected');
  //   });
  // }

  // Gateway initilized (provided in module and instantiated)
  afterInit() {
    this.logger.log('Websocket gateway initilized');
  }

  handleConnection(client: any, ...args: any[]) {
    throw new Error('Method not implemented.');
  }

  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
  }
}
