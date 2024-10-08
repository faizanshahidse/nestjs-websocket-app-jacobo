import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

export const redisModule = RedisModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const logger = new Logger('RedisModule');

    console.log(configService.get('REDIS_HOST'));

    return {
      connectionOptions: {
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      },
      onClientReady: (client) => {
        logger.log('Redis client is ready');

        client.on('error', (err) => {
          logger.error('Redis Client Error', err);
        });

        client.on('connect', () => {
          logger.log(
            `Connected to redis on ${client.options.host}:${client.options.port}`,
          );
        });
      },
    };
  },
  inject: [ConfigService],
});

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: parseInt(configService.get<string>('POLL_DURATION')),
    },
  }),
  inject: [ConfigService],
});
