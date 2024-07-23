import {
  MessageHandlers,
  parseServiceBusConnectionString,
  ProcessErrorArgs,
  ServiceBusClient,
  ServiceBusConnectionStringProperties,
  ServiceBusMessage,
  ServiceBusReceiver,
  ServiceBusSender,
} from '@azure/service-bus';
import { DiscoveredMethodWithMeta, DiscoveryService } from '@golevelup/nestjs-discovery';

import { IAzureServiceBusOptions, IAzureServiceBusEmit, IMessageHandlerMeta } from '../interfaces';
import { AZURE_SERVICE_BUS_CONSUMER_METHOD } from '../constants';


export class AzureServiceBusClient {
  private client: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;
  private clientConfig: ServiceBusConnectionStringProperties;

  constructor(
    protected readonly config: IAzureServiceBusOptions,
    private readonly discover: DiscoveryService,
  ) { }

  public async onModuleInit(): Promise<void> {
    const messageHandlers = await this.discover.providerMethodsWithMetaAtKey<IMessageHandlerMeta>(AZURE_SERVICE_BUS_CONSUMER_METHOD);
    this.client = new ServiceBusClient(this.config.connectionString, this.config.options);
    this.clientConfig = parseServiceBusConnectionString(this.config.connectionString);

    const entityPath = this.clientConfig.entityPath;
    const metadata = messageHandlers.find(({ meta }) => meta.name === entityPath);

    this.sender = this.client.createSender(entityPath);
    this.receiver = this.client.createReceiver(entityPath);
    this.receiver.subscribe(this.createMessageHandlers(metadata));
  }

  async emit<T extends ServiceBusMessage | ServiceBusMessage[]>(data: IAzureServiceBusEmit<T>): Promise<void> {
    const { payload, updateTime, options } = data;
    if (updateTime && this.checkScheduleDate(updateTime)) {
      await this.sender.scheduleMessages(payload, updateTime, options);
      return;
    }
    await this.sender.sendMessages(payload, options);
  }

  checkScheduleDate(updateTime: Date) {
    if (updateTime instanceof Date) {
      return true;
    } else {
      throw new Error(`Error validating schedule date: ${updateTime} is not valid`);
    }
  }

  private createMessageHandlers(metadata: DiscoveredMethodWithMeta<IMessageHandlerMeta>): MessageHandlers {
    return {
      processMessage: metadata.discoveredMethod.handler.bind(metadata.discoveredMethod.parentClass.instance),
      processError: (args: ProcessErrorArgs): Promise<void> => {
        return new Promise<void>(() => {
          throw new Error(`Error processing message: ${args.error}`);
        });
      },
    };
  }

  async close(): Promise<void> {
    await this.sender?.close();
    await this.receiver?.close();
    await this.client?.close();
  }
}
