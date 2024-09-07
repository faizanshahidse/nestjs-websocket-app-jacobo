import {
  DynamicModule,
  FactoryProvider,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import IORedis, { Redis, RedisOptions } from 'ioredis';

export const IORedisKey = 'IO_REDIS_KEY';

type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Module({})
export class RedisModule {
  static async registerAsync({
    imports,
    useFactory,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args) => {
        console.log(...args);
        const { connectionOptions, onClientReady } = await useFactory(...args);
        const client = await new IORedis(connectionOptions);
        onClientReady(client);

        return client;
      },
      inject,
    };

    return {
      module: RedisModule,
      imports,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
