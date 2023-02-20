import { Inject } from '@nestjs/common';
import {
  MessageHandlers,
  parseServiceBusConnectionString,
  ProcessErrorArgs,
  ServiceBusClient,
  ServiceBusConnectionStringProperties,
  ServiceBusMessage,
  ServiceBusReceivedMessage,
  ServiceBusReceiver,
  ServiceBusSender,
} from '@azure/service-bus';

import { IAzureServiceBusOptions, IAzureServiceBusEmit } from '../interfaces';
import { AZURE_SERVICE_BUS_EVENT_EXPLORER, EventExplorerService } from '../constants';

export class AzureServiceBusClient {
  private client: ServiceBusClient;
  private sender: ServiceBusSender;
  private receiver: ServiceBusReceiver;
  private clientConfig: ServiceBusConnectionStringProperties;

  constructor(
    protected readonly config: IAzureServiceBusOptions,
    @Inject(AZURE_SERVICE_BUS_EVENT_EXPLORER) protected readonly eventExplorerService: typeof EventExplorerService
  ) {
    this.init();
  }

  init() {
    this.client = new ServiceBusClient(this.config.connectionString, this.config.options);
    this.clientConfig = parseServiceBusConnectionString(this.config.connectionString);
    this.sender = this.client.createSender(this.clientConfig.entityPath);
    this.receiver = this.client.createReceiver(this.clientConfig.entityPath);
    this.receiver.subscribe(this.createMessageHandlers());
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

  private createMessageHandlers(): MessageHandlers {
    return {
      processMessage: async (receivedMessage: ServiceBusReceivedMessage) => {
        await this.handleMessage(receivedMessage);
      },
      processError: (args: ProcessErrorArgs): Promise<void> => {
        return new Promise<void>(() => {
          throw new Error(`Error processing message: ${args.error}`);
        });
      },
    };
  }

  handleMessage(receivedMessage: ServiceBusReceivedMessage): void {
    try {
      const { body } = receivedMessage;
      this.eventExplorerService.invoke(this.clientConfig.entityPath, { body });
    } catch (err) {
      throw err;
    }
  }

  async close(): Promise<void> {
    await this.sender?.close();
    await this.receiver?.close();
    await this.client?.close();
  }
}
