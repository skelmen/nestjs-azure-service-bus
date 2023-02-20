import { OperationOptionsBase, ServiceBusClientOptions } from '@azure/service-bus';

export interface IAzureServiceBusOptions {
  connectionString: string;
  options?: ServiceBusClientOptions;
}

export interface IAzureServiceBusEmit<T> {
  payload: T;
  options?: OperationOptionsBase;
  updateTime?: Date;
}
