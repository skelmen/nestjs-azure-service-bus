import { DynamicModule, Global, Module, OnApplicationShutdown, Provider } from '@nestjs/common';

import { AzureServiceBusClient } from './services/azure-service.bus.service';
import {
  AzureServiceBusModuleAsyncOptions,
  AzureServiceBusProviderAsyncOptions,
} from './interfaces';

import { AZURE_SERVICE_BUS_EVENT_EXPLORER, EventExplorerService } from './constants';

@Global()
@Module({})
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
      imports: [...imports],
      providers: [
        ...providers,
        {
          provide: AZURE_SERVICE_BUS_EVENT_EXPLORER,
          useValue: EventExplorerService,
        }
      ],
      exports: [...providers, AZURE_SERVICE_BUS_EVENT_EXPLORER],
    };
  }

  private static createAsyncOptionsProvider(
    options: AzureServiceBusProviderAsyncOptions,
  ): Provider[] {
    return [
      {
        provide: options.name,
        useFactory: this.createFactoryWrapper(options.useFactory),
        inject: [...(options.inject || [])],
      },
    ];
  }

  private static createFactoryWrapper(
    useFactory: AzureServiceBusProviderAsyncOptions['useFactory'],
  ) {
    return async (...args: any[]) => {
      const clientOptions = await useFactory(...args);
      const clientProxyRef = new AzureServiceBusClient(clientOptions, EventExplorerService);
      return this.assignOnAppShutdownHook(clientProxyRef);
    };
  }

  private static assignOnAppShutdownHook(client) {
    (client as unknown as OnApplicationShutdown).onApplicationShutdown = client.close;
    return client;
  }
}
