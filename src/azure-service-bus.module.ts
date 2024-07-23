import { DynamicModule, Global, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';

import { AzureServiceBusClient } from './clients/azure-service.bus.client';
import {
  AzureServiceBusModuleAsyncOptions,
  AzureServiceBusProviderAsyncOptions,
} from './interfaces';

@Global()
@Module({
  imports: [DiscoveryModule],
})
export class AzureServiceBusModule {

  static forRootAsync(options: AzureServiceBusModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = options.reduce(
      (accProviders: Provider[], item: AzureServiceBusProviderAsyncOptions) =>
        accProviders
          .concat(this.createAsyncOptionsProvider(item))
          .concat(item.extraProviders || []),
      [],
    );

    const imports = options.reduce(
      (accImports: any, option: AzureServiceBusProviderAsyncOptions) =>
        option.imports && !accImports.includes(option.imports)
          ? accImports.concat(option.imports)
          : accImports,
      [],
    );

    return {
      module: AzureServiceBusModule,
      imports: [DiscoveryModule, ...imports],
      providers: [
        ...providers,
      ],
      exports: [...providers],
    };
  }

  private static createAsyncOptionsProvider(
    options: AzureServiceBusProviderAsyncOptions,
  ): Provider[] {
    return [
      {
        provide: options.name,
        useFactory: async (...args: any[]) => {
          const [discoverService, ...rest] = args;
          const clientOptions = await options.useFactory(...rest);
          const clientProxyRef = new AzureServiceBusClient(clientOptions, discoverService);
          return this.assignOnAppShutdownHook(clientProxyRef);
        },
        inject: [DiscoveryService, ...(options.inject || [])],
      },
    ];
  }

  private static assignOnAppShutdownHook(client) {
    (client as unknown as OnApplicationShutdown).onApplicationShutdown = client.close;
    return client;
  }
}
