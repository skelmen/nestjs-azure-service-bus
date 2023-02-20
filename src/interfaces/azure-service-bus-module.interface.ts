import { ModuleMetadata, Provider, Type } from '@nestjs/common';

import { IAzureServiceBusOptions } from './azure-service-bus.interface';

export type AzureServiceBusProvider = IAzureServiceBusOptions;

export type AzureServiceBusProviderOptions = AzureServiceBusProvider & {
  name: string | symbol;
};

export type AzureServiceBusModuleOptions = Array<AzureServiceBusProviderOptions>;

export interface AzureServiceBusModuleOptionsFactory {
  createAsyncOptionsProvider(): Promise<AzureServiceBusProvider> | AzureServiceBusProvider;
}

export interface AzureServiceBusProviderAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AzureServiceBusModuleOptionsFactory>;
  useClass?: Type<AzureServiceBusModuleOptionsFactory>;
  useFactory: (...args: any[]) => Promise<AzureServiceBusProvider> | AzureServiceBusProvider;
  inject?: any[];
  extraProviders?: Provider[];
  name: string | symbol;
}

export type AzureServiceBusModuleAsyncOptions = Array<AzureServiceBusProviderAsyncOptions>;
