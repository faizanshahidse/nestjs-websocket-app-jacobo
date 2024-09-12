import {
  BadRequestException,
  Catch,
  Logger,
  OnModuleInit,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { PollsService } from './polls.service';
import { Server, Namespace, Socket } from 'socket.io';
import { WsBadRequestException } from 'src/exceptions/ws-exceptions';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
import { SocketWithAuth } from 'src/common/types';
import { GatewayAdminGuard } from './guard/gateway-admin.guard';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  namespace: 'polls',
})
export class PollsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollsGateway.name);
  constructor(private readonly pollsService: PollsService) {}

  @WebSocketServer()
  server: Server;

  @WebSocketServer()
  io: Namespace;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Connected');
    });
  }

  // Gateway initilized (provided in module and instantiated)
  afterInit() {
    this.logger.log('Websocket gateway initilized');
  }

  async handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;

    console.log('Connected');
    this.logger.log(`WS client with id: ${client.id} connected`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);

    const roomName = client.pollID;
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.debug(
      `userID: ${client.userID} joined room with name: ${roomName}`,
    );
    this.logger.debug(
      `Total clients connected to room '${roomName}': ${connectedClients}`,
    );

    const updatedPoll = await this.pollsService.addParticipant({
      pollID: client.pollID,
      userID: client.userID,
      name: client.name,
    });

    this.io.to(roomName).emit('poll_updated', updatedPoll);
  }

  handleDisconnect(client: Socket) {
    const sockets = this.io.sockets;
    this.logger.log(`WS client with id: ${client.id} disconnected`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
  }

  @SubscribeMessage('test')
  test() {
    throw new BadRequestException();
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const updatedPoll = await this.pollsService.removeParticipant(
      client.pollID,
      id,
    );

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }
}
