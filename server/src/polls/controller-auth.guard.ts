import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class ControllerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    const { accessToken } = request.body;

    try {
      const payload = this.jwtService.verify(accessToken);

      // append user and poll to socket
      request.userID = payload.sub;
      request.pollID = payload.pollID;
      request.name = payload.name;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }
}
