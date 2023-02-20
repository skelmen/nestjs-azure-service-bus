# Message Brokers

Common code shared by Nodejs services

## Azure Service Bus

Azure service bus provider based on `@nestjs/microservices` ClientProxy service.

For scheduling message add `updateTime` param to `data` object.

#### Import module

```ts
AzureServiceBusModule.forRootAsync([
  {
    name: 'provider_name',
    useFactory: (configService: ConfigService) => ({
      connectionString: 'Azure service bus connection string',
      options: {} // custom options
    }),
    inject: [ConfigService],
  },
]),
```

### Service usage

```ts
@Injectable()
export class AppService {

  constructor(
    @Inject('provider_name') private readonly messageBrokerClient: AzureServiceBusClient,
  ) { }

  async getData(){
    const queueName = 'queue';
    const pattern = {
      name: queueName,
      options: {} // Azure service bus options
    };
    const data = {
      updateTime: '2022-11-23 11:53:00+02', // for scheduling message
      body: {
        id: '39219'
        ...
      }
    };

    this.messageBrokerClient.emit(pattern, data);
  }
}
```

#### Message handler

```ts
@HandleMessageEvent
async processMessage(data) {
  // processing message
}
```
